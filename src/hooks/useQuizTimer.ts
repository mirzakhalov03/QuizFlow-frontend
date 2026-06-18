import { useEffect, useRef, useState } from 'react'

type PersistedTimer = { remaining: number; duration: number }

/**
 * Read a resumable timer from storage. We persist the duration the remaining
 * was based on so we can tell a genuine resume from stale data: if the quiz's
 * timer was changed, or the entry was written by an older build/different unit,
 * the durations won't match and we start fresh instead of trusting a bogus
 * (often larger) value. Legacy plain-number entries fail the shape check and
 * are likewise ignored.
 */
function readPersisted(storageKey: string): PersistedTimer | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'remaining' in parsed &&
      'duration' in parsed &&
      typeof (parsed as PersistedTimer).remaining === 'number' &&
      typeof (parsed as PersistedTimer).duration === 'number' &&
      Number.isFinite((parsed as PersistedTimer).remaining) &&
      Number.isFinite((parsed as PersistedTimer).duration)
    ) {
      return parsed as PersistedTimer
    }
  } catch {
    // ignore corrupt data
  }
  return null
}

function computeInitialTime(storageKey: string, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0
  const saved = readPersisted(storageKey)
  // Only resume when the saved entry was based on the same duration. Clamp as
  // defense-in-depth so we can never start with more time than configured.
  if (saved && saved.duration === durationSeconds && saved.remaining > 0) {
    return Math.min(saved.remaining, durationSeconds)
  }
  return durationSeconds
}

export function useQuizTimer(
  durationSeconds: number,
  storageKey: string,
  onExpire: () => void,
  enabled = true
): { timeRemaining: number; isRunning: boolean } {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    computeInitialTime(storageKey, durationSeconds)
  )

  // Re-sync when the duration becomes known or changes (e.g. the quiz finishes
  // loading and durationSeconds goes from 0 to its real value, or the configured
  // timer changes). Done during render via a tracked value instead of an effect,
  // which avoids a cascading re-render.
  // https://react.dev/learn/you-might-not-need-an-effect
  // Guards `onExpire` to exactly one call per countdown. Reset whenever the timer
  // (re)starts with time on the clock (e.g. duration loads, or is reconfigured).
  const expiredRef = useRef(false)

  const [syncedDuration, setSyncedDuration] = useState(durationSeconds)
  if (syncedDuration !== durationSeconds) {
    setSyncedDuration(durationSeconds)
    const fresh = computeInitialTime(storageKey, durationSeconds)
    setTimeRemaining(fresh)
    if (fresh > 0) expiredRef.current = false
  }

  const onExpireRef = useRef(onExpire)
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!enabled || timeRemaining <= 0) return

    const interval = setInterval(() => {
      // The updater must stay pure — StrictMode double-invokes it in dev, and
      // any side effect here (e.g. submitting the quiz) would fire twice. So we
      // only compute the next value; expiry is handled in the effect below.
      setTimeRemaining((prev) => {
        const next = prev - 1
        if (next <= 0) {
          localStorage.removeItem(storageKey)
          return 0
        }
        localStorage.setItem(
          storageKey,
          JSON.stringify({ remaining: next, duration: durationSeconds } satisfies PersistedTimer)
        )
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
    // timeRemaining is intentionally omitted: the interval reads it via the
    // functional updater, so re-subscribing every tick would reset the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, storageKey, durationSeconds])

  // Fire expiry once, as a committed-state effect rather than from inside the
  // updater — this is what guarantees a single auto-submit.
  useEffect(() => {
    if (!enabled || timeRemaining > 0 || expiredRef.current) return
    expiredRef.current = true
    onExpireRef.current()
  }, [enabled, timeRemaining])

  return { timeRemaining, isRunning: enabled && timeRemaining > 0 }
}
