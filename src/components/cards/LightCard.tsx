import { useState, useEffect, useRef } from 'react'
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
    <div className="flex flex-col h-full" style={{ gap: '8px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Sun size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898', fontWeight: 500, textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
          {config.name ?? config.entity}
        </span>
      </div>

      {/* Brightness value — hero */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', flex: 1 }}>
        {isOn ? (
          <>
            <span
              className="font-value font-medium"
              style={{ color: '#1a1714', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', lineHeight: 1 }}
            >
              {localBrightness}
            </span>
            <span
              className="font-body"
              style={{ color: '#a09890', fontSize: '1rem', fontWeight: 400, lineHeight: 1 }}
            >
              %
            </span>
          </>
        ) : (
          <span
            className="font-value font-medium"
            style={{ color: '#c8c0b8', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', lineHeight: 1 }}
          >
            —
          </span>
        )}
      </div>

      {/* Bottom row: slider + toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto' }}>
        {config.show_brightness && isOn ? (
          <div style={{ flex: 1 }}>
            <Slider
              min={1} max={100} step={1}
              value={[localBrightness]}
              onValueChange={handleBrightnessChange}
            />
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}
        <Switch
          checked={isOn}
          onCheckedChange={handleToggle}
          aria-label={`Toggle ${config.name ?? config.entity}`}
        />
      </div>
    </div>
  )
}
