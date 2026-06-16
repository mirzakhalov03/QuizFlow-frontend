import { useEffect, useMemo, useRef, useState } from 'react'

import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionWindow,
} from '@/types/speech-recognition'

export function useSpeechRecognition(
  onTranscript: (text: string) => void,
) {
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const [isRecording, setIsRecording] = useState(false)

  const SpeechRecognitionClass = useMemo(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const speechWindow = window as SpeechRecognitionWindow

    return (
      speechWindow.SpeechRecognition ??
      speechWindow.webkitSpeechRecognition
    )
  }, [])

  const isSupported = !!SpeechRecognitionClass

  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    if (!SpeechRecognitionClass) {
      return
    }

    const recognition = new SpeechRecognitionClass()

    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript
      }

      onTranscriptRef.current(transcript.trim())
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [SpeechRecognitionClass])

  const toggle = () => {
    const recognition = recognitionRef.current

    if (!recognition) {
      return
    }

    try {
      if (isRecording) {
        recognition.stop()
      } else {
        recognition.start()
      }
    } catch (error) {
      console.error('Speech recognition toggle error:', error)
    }
  }

  return {
    isSupported,
    isRecording,
    toggle,
  }
}