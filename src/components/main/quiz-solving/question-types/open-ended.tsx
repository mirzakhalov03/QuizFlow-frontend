import { useCallback } from 'react'
import { Mic, MicOff } from 'lucide-react'

import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

const MAX_CHARS = 1000

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
  'audio-capture': 'No microphone found. Please connect a microphone and try again.',
  'network': 'Speech recognition requires an internet connection.',
  'no-speech': 'No speech detected. Try speaking closer to your mic.',
  'unknown': 'Speech recognition failed. Please try again.',
}

type Props = {
  value: string
  onChange: (text: string) => void
}

export default function OpenEnded({ value, onChange }: Props) {
  const handleTranscript = useCallback(
    (transcript: string) => {
      const nextValue = `${value} ${transcript}`.trim().slice(0, MAX_CHARS)
      onChange(nextValue)
    },
    [value, onChange]
  )

  const { isSupported, isRecording, error, toggle } = useSpeechRecognition(handleTranscript)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Type your answer here..."
          rows={4}
          maxLength={MAX_CHARS}
          className="border-border focus:border-primary focus:ring-primary/20 w-full resize-none rounded-lg border bg-transparent p-3 pr-12 text-sm transition-colors outline-none focus:ring-2"
        />

        {isSupported && (
          <button
            type="button"
            onClick={toggle}
            aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
            title={isRecording ? 'Stop recording' : 'Speak your answer'}
            className={`absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              isRecording
                ? 'bg-red-500/10 hover:bg-red-500/20'
                : 'hover:bg-muted'
            }`}
          >
            {isRecording ? (
              <Mic className="h-5 w-5 animate-pulse text-red-500" />
            ) : (
              <Mic className="text-muted-foreground h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        {error ? (
          <p className="text-destructive flex items-center gap-1 text-xs">
            <MicOff className="h-3 w-3 shrink-0" />
            {ERROR_MESSAGES[error] ?? ERROR_MESSAGES['unknown']}
          </p>
        ) : isRecording ? (
          <p className="text-muted-foreground text-xs">Listening… speak now</p>
        ) : (
          <span />
        )}
        <p className="text-muted-foreground shrink-0 text-right text-xs">
          {value.length}/{MAX_CHARS}
        </p>
      </div>
    </div>
  )
}
