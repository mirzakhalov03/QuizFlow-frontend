/**
 * Pulls a human-readable message out of an unknown error thrown by an API call.
 * Prefers the backend's `message`, then `detail`, then a native Error message,
 * and finally a generic fallback.
 */
export function extractApiErrorMessage(
  err: unknown,
  fallback = 'Generation failed. Please try again.'
): string {
  const e = err as { response?: { data?: { message?: string; detail?: string } } }
  return (
    e?.response?.data?.message ??
    e?.response?.data?.detail ??
    (err instanceof Error ? err.message : fallback)
  )
}
