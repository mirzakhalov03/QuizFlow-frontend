const MAX_CHARS = 1000

type Props = {
  value: string
  onChange: (text: string) => void
}

export default function OpenEnded({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Type your answer here..."
        rows={4}
        maxLength={MAX_CHARS}
        className="border-border focus:border-primary focus:ring-primary/20 w-full resize-none rounded-lg border bg-transparent p-3 text-sm transition-colors outline-none focus:ring-2"
      />
      <p className="text-muted-foreground text-right text-xs">
        {value.length}/{MAX_CHARS}
      </p>
    </div>
  )
}
