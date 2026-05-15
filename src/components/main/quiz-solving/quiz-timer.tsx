type Props = {
  timeRemaining: number
}

export default function QuizTimer({ timeRemaining }: Props) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const colorClass =
    timeRemaining <= 30
      ? 'text-destructive'
      : timeRemaining <= 60
        ? 'text-amber-500'
        : 'text-foreground'

  return (
    <span className={`font-mono text-sm font-semibold tabular-nums ${colorClass}`}>{display}</span>
  )
}
