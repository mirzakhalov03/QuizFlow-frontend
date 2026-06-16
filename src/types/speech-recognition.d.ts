export type SpeechRecognitionAlternative = {
  readonly transcript: string
  readonly confidence: number
}

export type SpeechRecognitionResult = {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

export type SpeechRecognitionResultList = {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

export type SpeechRecognitionEvent = Event & {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

export type SpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string

  start(): void
  stop(): void

  onstart: (() => void) | null
  onend: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
}

export type SpeechRecognitionConstructor = {
  new (): SpeechRecognition
}

export type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}