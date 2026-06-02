import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Icons from 'lucide-react'
import { useHAStore } from '@/store/useHAStore'
import type { SensorCardConfig } from '@/config/types'

interface Props {
  config: SensorCardConfig
}

function getIcon(name: string | undefined): React.ElementType {
  if (!name) return Icons.Activity
  const key = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  return (Icons as unknown as Record<string, React.ElementType>)[key] ?? Icons.Activity
}

function useAnimatedValue(target: number, duration = 600) {
  const [display, setDisplay] = useState(target)
  const prevRef = useRef(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const from = prevRef.current
    const to = target
    if (from === to) return
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (to - from) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        prevRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return display
}


export function SensorCard({ config }: Props) {
  const entity = useHAStore((s) => s.entities[config.entity])
  const raw = entity?.state ?? '—'
  const numericValue = parseFloat(raw)
  const isNumeric = !isNaN(numericValue)
  const decimals = config.decimals ?? (isNumeric && numericValue % 1 !== 0 ? 1 : 0)
  const animatedValue = useAnimatedValue(isNumeric ? numericValue : 0)
  const displayValue = isNumeric ? animatedValue.toFixed(decimals) : raw
  const Icon = getIcon(config.icon)

  return (
    <div className="flex flex-col h-full min-w-0" style={{ gap: '8px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icon size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898', fontWeight: 500, textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
          {config.name ?? config.entity}
        </span>
      </div>

      {/* Value — hero content */}
      <AnimatePresence mode="wait">
        {isNumeric ? (
          <motion.div
            key={`num-${Math.round(numericValue * 10)}`}
            initial={{ scale: 0.97, opacity: 0.7 }}
            animate={{ scale: [1, 1.03, 1], opacity: 1 }}
            transition={{ duration: 0.35, times: [0, 0.3, 1] }}
            style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}
          >
            <span
              className="font-value font-medium"
              style={{ color: '#1a1714', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', lineHeight: 1 }}
            >
              {displayValue}
            </span>
            {config.unit && (
              <span
                className="font-body"
                style={{ color: '#a09890', fontSize: '1rem', fontWeight: 400, lineHeight: 1 }}
              >
                {config.unit}
              </span>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`str-${raw}`}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}
          >
            <span
              className="font-heading line-clamp-2"
              style={{
                color: '#1a1714',
                fontSize: '1.5rem',
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {displayValue}
            </span>
            {config.unit && (
              <span
                className="font-body"
                style={{ color: '#a09890', fontSize: '1rem', fontWeight: 400, lineHeight: 1 }}
              >
                {config.unit}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom label — HA friendly_name, only when different from card name */}
      {(() => {
        const friendlyName = entity?.attributes && (entity.attributes as Record<string, unknown>).friendly_name as string | undefined
        return friendlyName && friendlyName !== config.name ? (
          <span
            className="font-body truncate"
            style={{ fontSize: '0.72rem', color: '#9a9088', marginTop: 'auto', letterSpacing: '0.01em' }}
          >
            {friendlyName}
          </span>
        ) : <span style={{ marginTop: 'auto' }} />
      })()}
    </div>
  )
}
