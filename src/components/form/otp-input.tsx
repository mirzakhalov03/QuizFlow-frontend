import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

type OtpInputProps = {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  ariaLabel?: string
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus,
  ariaLabel = 'One-time passcode',
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const focusIndex = (i: number) => {
    const el = inputsRef.current[Math.max(0, Math.min(length - 1, i))]
    el?.focus()
    el?.select()
  }

  const setDigit = (i: number, digit: string) => {
    const next = digits.slice()
    next[i] = digit
    onChange(next.join('').slice(0, length))
  }

  const handleChange = (i: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '')
    if (!cleaned) {
      setDigit(i, '')
      return
    }
    // Last char handles the "overwrite selected digit" case.
    setDigit(i, cleaned[cleaned.length - 1])
    if (i < length - 1) focusIndex(i + 1)
  }

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        setDigit(i, '')
      } else if (i > 0) {
        e.preventDefault()
        setDigit(i - 1, '')
        focusIndex(i - 1)
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault()
      focusIndex(i - 1)
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      e.preventDefault()
      focusIndex(i + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    onChange(pasted)
    focusIndex(pasted.length >= length ? length - 1 : pasted.length)
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label={ariaLabel}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'border-border bg-background h-12 w-full min-w-0 rounded-md border text-center font-mono text-lg',
            'focus:ring-primary/40 focus:border-primary focus:ring-2 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
      ))}
    </div>
  )
}
