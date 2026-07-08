import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export function TooltipProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <TooltipPrimitive.Provider>{children}</TooltipPrimitive.Provider>
}

export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export function TooltipContent({
  className = '',
  sideOffset = 4,
  ...props
}: TooltipPrimitive.TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={`z-50 overflow-hidden rounded-md bg-black px-3 py-1.5 text-sm text-white shadow-md ${className}`}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}