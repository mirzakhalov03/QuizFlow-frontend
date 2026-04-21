import { useMemo } from "react"
import { useLocation, useMatches } from "react-router-dom"

export function usePath() {
  const { pathname, search, hash } = useLocation()
  const matches = useMatches()

  const segments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname],
  )

  const is = (target: string) =>
    pathname === target || pathname.startsWith(target + "/")

  const inZone = {
    public: !pathname.startsWith("/auth") && !pathname.startsWith("/app"),
    auth: pathname.startsWith("/auth"),
    app: pathname.startsWith("/app"),
  }

  return { pathname, search, hash, segments, matches, is, inZone }
}
