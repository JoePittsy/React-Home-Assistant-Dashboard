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
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
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

  const valueFontClass =
    displayValue.length <= 6
      ? 'text-4xl leading-none'
      : displayValue.length <= 12
        ? 'text-2xl leading-tight'
        : 'text-lg leading-snug'

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-muted-foreground flex-shrink-0" />
        <span className="font-heading text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
          {config.name ?? config.entity}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={raw}
          initial={{ scale: 0.97, opacity: 0.7 }}
          animate={{ scale: [1, 1.04, 1], opacity: 1 }}
          transition={{ duration: 0.4, times: [0, 0.3, 1] }}
          className="flex items-baseline gap-1.5 flex-wrap"
        >
          <span className={`font-value font-medium text-amber-400 line-clamp-2 ${valueFontClass}`}>
            {displayValue}
          </span>
          {config.unit && (
            <span className="font-value text-sm text-muted-foreground leading-none">
              {config.unit}
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {entity?.attributes && (typeof (entity.attributes as Record<string, unknown>).friendly_name === 'string') && (
        <span className="text-[10px] text-muted-foreground/50 font-body truncate">
          {String((entity.attributes as Record<string, unknown>).friendly_name)}
        </span>
      )}
    </div>
  )
}
