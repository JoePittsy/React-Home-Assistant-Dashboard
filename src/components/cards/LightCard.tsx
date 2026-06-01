import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useHAStore } from '@/store/useHAStore'
import { haService } from '@/lib/ha'
import type { LightCardConfig } from '@/config/types'

interface Props {
  config: LightCardConfig
}

export function LightCard({ config }: Props) {
  const entity = useHAStore((s) => s.entities[config.entity])
  const isOn = entity?.state === 'on'
  const haBrightness = (entity?.attributes as Record<string, unknown>)?.brightness as number | undefined
  const initialPct = haBrightness != null ? Math.round((haBrightness / 255) * 100) : 100

  const [localBrightness, setLocalBrightness] = useState(initialPct)
  const isDragging = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isDragging.current && haBrightness != null) {
      setLocalBrightness(Math.round((haBrightness / 255) * 100))
    }
  }, [haBrightness])

  function handleToggle() {
    haService.toggleLight(config.entity).catch(console.error)
  }

  function handleBrightnessChange([pct]: number[]) {
    isDragging.current = true
    setLocalBrightness(pct)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      isDragging.current = false
      haService.setBrightness(config.entity, Math.round((pct / 100) * 255)).catch(console.error)
    }, 300)
  }

  return (
    <motion.div
      animate={{
        backgroundColor: isOn ? 'rgba(245,166,35,0.05)' : 'rgba(0,0,0,0)',
        boxShadow: isOn
          ? '0 0 40px rgba(245,166,35,0.10), inset 0 0 0 1px rgba(245,166,35,0.12)'
          : '0 0 0 rgba(0,0,0,0), inset 0 0 0 1px transparent',
      }}
      transition={{ duration: 0.4 }}
      className="rounded-md -m-px p-px"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sun
              size={14}
              className="flex-shrink-0"
              style={{ color: isOn ? '#f5a623' : '#4a5568' }}
            />
            <span className="font-heading text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
              {config.name ?? config.entity}
            </span>
          </div>
          <Switch
            checked={isOn}
            onCheckedChange={handleToggle}
            aria-label={`Toggle ${config.name ?? config.entity}`}
          />
        </div>

        <div className="flex items-baseline gap-1.5">
          <span
            className="font-value text-3xl font-medium transition-colors duration-300"
            style={{ color: isOn ? '#f5a623' : '#4a5568' }}
          >
            {isOn ? 'On' : 'Off'}
          </span>
          {isOn && config.show_brightness && (
            <span className="font-value text-sm text-muted-foreground">{localBrightness}%</span>
          )}
        </div>

        {config.show_brightness && isOn && (
          <div className="pt-1">
            <Slider
              min={1}
              max={100}
              step={1}
              value={[localBrightness]}
              onValueChange={handleBrightnessChange}
              className="w-full"
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}
