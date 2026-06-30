import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type {
  SpeechRecognition,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  SpeechRecognitionWindow,
} from '@/types/speech-recognition'

export type SpeechRecognitionError =
  | 'not-allowed' // mic permission denied
  | 'no-speech' // silence timeout
  | 'audio-capture' // no microphone found
  | 'network' // network required for cloud recognition
  | 'aborted' // recognition was aborted
  | 'unknown'

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const shouldRestartRef = useRef(false) // true while user wants recording active
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<SpeechRecognitionError | null>(null)

  const SpeechRecognitionClass = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const win = window as SpeechRecognitionWindow
    return win.SpeechRecognition ?? win.webkitSpeechRecognition
  }, [])

  const isSupported = !!SpeechRecognitionClass

  // Keep the transcript callback stable without recreating the recognition object
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  const startRecognition = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    try {
      recognition.start()
    } catch {
      // InvalidStateError: already started — safe to ignore
    }
  }, [])

  useEffect(() => {
    if (!SpeechRecognitionClass) return

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsRecording(true)
      setError(null)
    }

    recognition.onend = () => {
      setIsRecording(false)
      // If the user still wants it recording (e.g., browser stopped after silence),
      // restart automatically so it feels continuous.
      if (shouldRestartRef.current) {
        setTimeout(() => {
          if (shouldRestartRef.current) {
            try {
              recognition.start()
            } catch {
              // already running or destroyed
            }
          }
        }, 150)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = event.error ?? 'unknown'

      if (code === 'not-allowed' || code === 'service-not-allowed') {
        shouldRestartRef.current = false
        setIsRecording(false)
        setError('not-allowed')
        return
      }

      if (code === 'audio-capture') {
        shouldRestartRef.current = false
        setIsRecording(false)
        setError('audio-capture')
        return
      }

      if (code === 'network') {
        shouldRestartRef.current = false
        setIsRecording(false)
        setError('network')
        return
      }

      // 'no-speech' and 'aborted' are non-fatal — onend will fire and restart if needed.
      if (code === 'no-speech') {
        setError('no-speech')
        return
      }

      if (code !== 'aborted') {
        setError('unknown')
      }
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      if (transcript.trim()) {
        onTranscriptRef.current(transcript.trim())
        setError(null)
      }
    }

    recognitionRef.current = recognition

    return () => {
      shouldRestartRef.current = false
      recognition.stop()
    }
  }, [SpeechRecognitionClass])

  const toggle = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    setError(null)

    if (shouldRestartRef.current) {
      // User wants to stop
      shouldRestartRef.current = false
      try {
        recognition.stop()
      } catch {
        // safe to ignore
      }
    } else {
      // User wants to start
      shouldRestartRef.current = true
      startRecognition()
    }
  }, [startRecognition])

  return { isSupported, isRecording, error, toggle }
}
