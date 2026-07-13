import { useEffect } from 'react'

type Props = {
  count: number
  quote: string
}

/** Full-viewport countdown shown right before a quiz begins. Purely visual —
 *  the actual navigation timing is still owned by the caller's interval. */
export default function StartCountdownOverlay({ count, quote }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="bg-background/90 fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 px-6 backdrop-blur-sm">
      <span
        key={count}
        className="countdown-pop text-primary text-[7rem] leading-none font-bold tabular-nums sm:text-[9rem]"
      >
        {count}
      </span>
      <p className="text-muted-foreground max-w-xs text-center text-sm italic sm:text-base">
        {quote}
      </p>
    </div>
  )
}