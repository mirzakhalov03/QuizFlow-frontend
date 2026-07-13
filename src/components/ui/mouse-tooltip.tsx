import * as React from 'react'

type MouseTooltipProps = {
  content: React.ReactNode
  disabled?: boolean
  children: React.ReactNode
  offsetX?: number
  offsetY?: number
  className?: string
  /** Applied to the wrapper element so it can stretch to its layout slot
   *  (e.g. fill a grid cell) instead of shrinking to the trigger's size. */
  wrapperClassName?: string
  delay?: number
  autoDismiss?: number
}

export function MouseTooltip({
  content,
  disabled = false,
  children,
  offsetX = 14,
  offsetY = 14,
  className = '',
  wrapperClassName = '',
  delay = 400,
  autoDismiss = 2500,
}: MouseTooltipProps) {
  const [mounted, setMounted] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [pos, setPos] = React.useState({ x: 0, y: 0 })
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const dismissRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearPendingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const clearDismissTimeout = () => {
    if (dismissRef.current) {
      clearTimeout(dismissRef.current)
      dismissRef.current = null
    }
  }

  const clampToViewport = (rawX: number, rawY: number) => {
    let x = rawX
    let y = rawY
    const tooltipEl = tooltipRef.current
    if (tooltipEl) {
      const rect = tooltipEl.getBoundingClientRect()
      if (x + rect.width > window.innerWidth) {
        x = rawX - rect.width - offsetX * 2
      }
      if (y + rect.height > window.innerHeight) {
        y = rawY - rect.height - offsetY * 2
      }
    }
    return { x, y }
  }

  const hide = () => {
    clearPendingTimeout()
    clearDismissTimeout()
    setVisible(false)
    timeoutRef.current = setTimeout(() => {
      setMounted(false)
    }, 150)
  }

  const handleMouseEnter = () => {
    clearPendingTimeout()
    setMounted(true)
    timeoutRef.current = setTimeout(() => {
      setVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    hide()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setPos(clampToViewport(e.clientX + offsetX, e.clientY + offsetY))
  }

  // Tap-to-show for touch devices: no hover exists, so a tap positions the
  // tooltip near the touch point, fades it in immediately, then auto-dismisses
  // (fading out) after `autoDismiss` ms unless tapped again first.
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return

    clearPendingTimeout()
    clearDismissTimeout()
    setMounted(true)
    setPos(clampToViewport(touch.clientX + offsetX, touch.clientY + offsetY))

    // let it mount at opacity-0 first, then fade in on the next frame
    requestAnimationFrame(() => setVisible(true))

    dismissRef.current = setTimeout(() => {
      hide()
    }, autoDismiss)
  }

  React.useEffect(() => {
    return () => {
      clearPendingTimeout()
      clearDismissTimeout()
    }
  }, [])

  if (disabled) return <>{children}</>

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      className={`relative ${wrapperClassName}`}
    >
      {children}

      {mounted && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            pointerEvents: 'none',
          }}
          className={`z-50 rounded-md border border-border bg-popover px-2.5 py-1.5 text-center text-xs text-popover-foreground shadow-lg shadow-black/5 transition-all duration-150 ease-out ${
            visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          } ${className}`}
        >
          {content}
        </div>
      )}
    </div>
  )
}