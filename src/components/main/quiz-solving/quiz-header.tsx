import QuizTimer from './quiz-timer'

type Props = {
  title: string
  timeRemaining?: number
  isTimerEnabled: boolean
}

export default function QuizHeader({ title, timeRemaining, isTimerEnabled }: Props) {
  return (
    <div className="flex items-center justify-between">
      <p className="line-clamp-1 text-sm font-semibold">{title}</p>
      {isTimerEnabled && timeRemaining !== undefined && (
        <QuizTimer timeRemaining={timeRemaining} />
      )}
    </div>
  )
}
