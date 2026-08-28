import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Ribbons drawn across the backdrop. Each path is periodic over 240 user units
 * so a -240 translation loops seamlessly, which is what the drift animation
 * relies on.
 */
const RIBBONS = [
  { y: 26, amplitude: 9, duration: 41, reverse: false, opacity: 0.18 },
  { y: 48, amplitude: 13, duration: 33, reverse: true, opacity: 0.26 },
  { y: 70, amplitude: 11, duration: 47, reverse: false, opacity: 0.34 },
  { y: 92, amplitude: 16, duration: 29, reverse: true, opacity: 0.44 },
  { y: 112, amplitude: 12, duration: 38, reverse: false, opacity: 0.54 },
  { y: 132, amplitude: 18, duration: 25, reverse: true, opacity: 0.64 },
  { y: 152, amplitude: 14, duration: 44, reverse: false, opacity: 0.74 },
  { y: 172, amplitude: 20, duration: 31, reverse: true, opacity: 0.86 },
]

/** Motes floating over the ribbons, for a bit of depth. */
const MOTES = [
  { cx: 78, cy: 96, r: 2.5, duration: 9, delay: 0 },
  { cx: 196, cy: 62, r: 1.8, duration: 12, delay: 1.5 },
  { cx: 312, cy: 118, r: 3, duration: 10, delay: 3 },
  { cx: 404, cy: 74, r: 2, duration: 14, delay: 0.8 },
]

/** Builds one alternating S-curve with a 240-unit wavelength. */
function ribbonPath(y: number, amplitude: number) {
  const segments: string[] = []

  for (let x = -240; x < 720; x += 120) {
    const next = x + 120
    const peak = y + ((x / 120) % 2 === 0 ? -amplitude : amplitude)
    segments.push(`C ${x + 40} ${peak}, ${next - 40} ${peak}, ${next} ${y}`)
  }

  return `M -240 ${y} ${segments.join(" ")}`
}

/**
 * Decorative graphic for the bottom half of the empty chat: drifting ribbons
 * in the primary orange, shifting through gold and amber along their length
 * and fading out as they rise. Purely ornamental — hidden from assistive tech
 * and inert to pointers so the suggestions above stay clickable.
 */
export function ChatBackdrop({ className }: { className?: string }) {
  const id = React.useId()
  const strokeId = `${id}-stroke`
  const bloomId = `${id}-bloom`
  const maskId = `${id}-mask`
  const fadeId = `${id}-fade`

  return (
    <div
      aria-hidden
      data-slot="chat-backdrop"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-1/2 select-none",
        className
      )}
    >
      <svg
        viewBox="0 0 480 200"
        preserveAspectRatio="none"
        className="size-full opacity-80 dark:opacity-70"
      >
        <defs>
          <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop
              offset="38%"
              stopColor="oklch(from var(--primary) calc(l + 0.1) calc(c * 0.75) calc(h + 22))"
            />
            <stop
              offset="72%"
              stopColor="oklch(from var(--primary) calc(l - 0.08) c calc(h - 10))"
            />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>

          <radialGradient id={bloomId} cx="0.5" cy="1" r="0.75">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={fadeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="55%" stopColor="white" stopOpacity="0.75" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>

          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect
              x="-480"
              y="0"
              width="1200"
              height="200"
              fill={`url(#${fadeId})`}
            />
          </mask>
        </defs>

        <rect x="0" y="0" width="480" height="200" fill={`url(#${bloomId})`} />

        <g mask={`url(#${maskId})`} fill="none">
          {RIBBONS.map((ribbon) => (
            <g
              key={ribbon.y}
              style={{
                animation: `chat-backdrop-drift ${ribbon.duration}s linear infinite`,
                animationDirection: ribbon.reverse ? "reverse" : "normal",
              }}
            >
              <path
                d={ribbonPath(ribbon.y, ribbon.amplitude)}
                stroke={`url(#${strokeId})`}
                strokeOpacity={ribbon.opacity}
                strokeWidth={1.25}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}

          {MOTES.map((mote) => (
            <circle
              key={`${mote.cx}-${mote.cy}`}
              cx={mote.cx}
              cy={mote.cy}
              r={mote.r}
              fill="var(--primary)"
              fillOpacity={0.45}
              style={{
                animation: `chat-backdrop-float ${mote.duration}s ease-in-out ${mote.delay}s infinite`,
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
