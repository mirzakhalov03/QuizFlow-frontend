import { useState, useEffect, useRef } from 'react'
import type { ScorePoint } from '@/types/analytics'

type Props = {
  points: ScorePoint[]
}

const PX_PER_POINT = 56
const AXIS_WIDTH = 40
const PADDING = { top: 16, right: 16, bottom: 32, left: 8 }

function getInitialWidth() {
  if (typeof window === 'undefined') return 600
  const w = window.innerWidth
  // Estimate available width:
  // lg: window.innerWidth - sidebar(240px) - padding(48px) - axis(40px) - card_padding(32px)
  // other: window.innerWidth - padding(32px) - axis(40px) - card_padding(32px)
  if (w >= 1024) {
    return Math.max(600, w - 240 - 48 - 40 - 32)
  }
  return Math.max(600, w - 32 - 40 - 32)
}

function getChartHeight(width: number) {
  if (width >= 1024) return 380
  if (width >= 640) return 280
  return 220
}

export default function ScoreOverTimeChart({ points }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(getInitialWidth)

  useEffect(() => {
    if (!containerRef.current) return

    setContainerWidth(containerRef.current.getBoundingClientRect().width)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  if (points.length === 0) {
    return (
      <div className="border-border bg-background text-muted-foreground rounded-lg border p-8 text-center text-sm">
        No quiz attempts yet — your score over time will appear here.
      </div>
    )
  }

  const height = getChartHeight(containerWidth)

  // The chart SVG grows with point count so labels never crowd; minimum width
  // keeps short series from looking sparse. The wrapper around it scrolls
  // horizontally on mobile while the y-axis stays pinned.
  const chartWidth = Math.max(
    containerWidth,
    PADDING.left + PADDING.right + points.length * PX_PER_POINT
  )
  const innerW = chartWidth - PADDING.left - PADDING.right
  const innerH = height - PADDING.top - PADDING.bottom

  const PLOT_MARGIN_X = 24
  const plotW = innerW - PLOT_MARGIN_X * 2

  const xFor = (i: number) =>
    PADDING.left +
    PLOT_MARGIN_X +
    (points.length === 1 ? plotW / 2 : (i * plotW) / (points.length - 1))
  const yFor = (score: number) => PADDING.top + innerH - (score / 100) * innerH

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.score)}`).join(' ')

  const yTicks = [0, 25, 50, 75, 100]

  return (
    <div className="border-border bg-background rounded-lg border p-4">
      <h3 className="mb-3 text-sm font-semibold">Score over time</h3>
      <div className="flex">
        <svg width={AXIS_WIDTH} height={height} className="shrink-0" aria-hidden="true">
          {yTicks.map((tick) => (
            <text
              key={tick}
              x={AXIS_WIDTH - 6}
              y={yFor(tick)}
              textAnchor="end"
              dominantBaseline="central"
              className="fill-muted-foreground text-[10px] md:text-xs"
            >
              {tick}%
            </text>
          ))}
        </svg>

        <div ref={containerRef} className="min-w-0 flex-1 overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${height}`}
            width={chartWidth}
            height={height}
            className="h-auto max-w-none"
            role="img"
            aria-label="Line chart of quiz scores over time"
          >
            {yTicks.map((tick) => {
              const y = yFor(tick)
              return (
                <line
                  key={tick}
                  x1={0}
                  x2={chartWidth}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )
            })}

            <path d={path} className="stroke-primary" fill="none" strokeWidth={2} />

            {points.map((p, i) => (
              <circle
                key={`${p.date}-${i}`}
                cx={xFor(i)}
                cy={yFor(p.score)}
                r={3}
                className="fill-primary"
              >
                <title>{`${p.date}: ${p.score}%`}</title>
              </circle>
            ))}

            {points.map((p, i) => (
              <text
                key={`${p.date}-${i}-label`}
                x={xFor(i)}
                y={height - PADDING.bottom + 14}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] md:text-xs"
              >
                {formatDateLabel(p.date)}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}

function formatDateLabel(iso: string) {
  const datePart = iso.split('T')[0]
  const [, month, day] = datePart.split('-')
  if (!month || !day) return iso
  return `${month}/${day}`
}
