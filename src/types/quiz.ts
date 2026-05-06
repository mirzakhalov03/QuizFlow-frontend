// types/quiz.ts

export const QUESTION_TYPES = [
  'multiple_choice',
  'multi_select',
  'open_ended',
  'true_false',
] as const

export type QuestionType = (typeof QUESTION_TYPES)[number]

export type GenerateQuizRequest = {
  key: string
  bucket: string
  title?: string
  type?: string
  questionCount?: number
  userInstructions?: string
  isTimerEnabled?: boolean
  timerDuration?: number
}

export type CreateQuizInput = {
  title: string
  userId: string
  type?: QuestionType
  userInstructions?: string
  isTimerEnabled?: boolean
  timerDuration?: number
  questions?: CreateQuestionInput[]
}

type CreateQuestionInput = {
  text: string
  type: QuestionType
  position: number
  options?: CreateOptionInput[]
}

type CreateOptionInput = {
  text: string
  isCorrect: boolean
  position: number
}