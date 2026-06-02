import { useState, useEffect, useRef } from 'react'
import { Sun } from 'lucide-react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useHAStore } from '@/store/useHAStore'
import { haService } from '@/lib/ha'
import type { LightGroupCardConfig, LightGroupMember } from '@/config/types'

const bri255ToPercent = (bri: number): number => Math.round((bri / 255) * 100)
const percentTo255 = (pct: number): number => Math.round((pct / 100) * 255)

function getHABrightness(attributes: unknown): number | undefined {
  const a = attributes as Record<string, unknown> | undefined
  return a?.brightness != null ? (a.brightness as number) : undefined
}

// ─── Compact slider for member rows ──────────────────────────────────────────

interface CompactSliderProps {
  value: number
  onChange: (v: number) => void
  disabled: boolean
}

function CompactSlider({ value, onChange, disabled }: CompactSliderProps) {
  return (
    <SliderPrimitive.Root
      min={1} max={100} step={1}
      value={[Math.max(1, value)]}
      onValueChange={([v]) => onChange(v)}
      disabled={disabled}
      className="relative flex w-full touch-none select-none items-center"
    >
      <SliderPrimitive.Track
        className="relative w-full grow overflow-hidden rounded-full"
        style={{ height: '3px', background: '#e8e0d4' }}
      >
        <SliderPrimitive.Range
          className="absolute h-full rounded-full"
          style={{ background: disabled ? '#e8e0d4' : '#f5a623' }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block rounded-full focus-visible:outline-none disabled:pointer-events-none"
        style={{
          width: '14px',
          height: '14px',
          background: '#ffffff',
          border: `2px solid ${disabled ? '#c8c0b8' : '#f5a623'}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
          opacity: disabled ? 0.45 : 1,
          flexShrink: 0,
        }}
      />
    </SliderPrimitive.Root>
  )
}

// ─── Member row ───────────────────────────────────────────────────────────────

interface MemberRowProps {
  member: LightGroupMember
}

function LightGroupMemberRow({ member }: MemberRowProps) {
  const entity = useHAStore((s) => s.entities[member.entity])
  const isOn = entity?.state === 'on'
  const haBri = getHABrightness(entity?.attributes)
  const [localBrightness, setLocalBrightness] = useState(haBri != null ? bri255ToPercent(haBri) : 50)
  const isDragging = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isDragging.current && haBri != null) {
      setLocalBrightness(bri255ToPercent(haBri))
    }
  }, [haBri])

  function handleToggle() {
    haService.toggleLight(member.entity).catch(console.error)
  }

  function handleBrightnessChange(pct: number) {
    isDragging.current = true
    setLocalBrightness(pct)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      isDragging.current = false
      haService.setBrightness(member.entity, percentTo255(pct)).catch(console.error)
    }, 300)
  }

  const unavailable = !entity || entity.state === 'unavailable' || entity.state === 'unknown'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: unavailable ? 0.4 : 1,
        pointerEvents: unavailable ? 'none' : 'auto',
      }}
    >
      {/* Name */}
      <span
        className="font-body"
        style={{
          fontSize: '0.8rem',
          color: '#6b6560',
          width: '52px',
          flexShrink: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {member.name}
      </span>

      {/* Compact slider — hidden when off, spacer takes its place */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isOn ? (
          <CompactSlider
            value={localBrightness}
            onChange={handleBrightnessChange}
            disabled={false}
          />
        ) : (
          <div style={{ height: '14px' }} />
        )}
      </div>

      {/* Brightness value */}
      <span
        className="font-value"
        style={{
          fontSize: '0.8rem',
          color: '#a09890',
          width: '32px',
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {isOn ? `${localBrightness}%` : '—'}
      </span>

      {/* Toggle — scaled down */}
      <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center', flexShrink: 0 }}>
        <Switch
          checked={isOn}
          onCheckedChange={handleToggle}
          aria-label={`Toggle ${member.name}`}
        />
      </div>
    </div>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────

interface Props {
  config: LightGroupCardConfig
}

export function LightGroupCard({ config }: Props) {
  const entity = useHAStore((s) => s.entities[config.entity])
  const isOn = entity?.state === 'on'
  const haBri = getHABrightness(entity?.attributes)
  const [localBrightness, setLocalBrightness] = useState(haBri != null ? bri255ToPercent(haBri) : 100)
  const isDragging = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unavailable = !entity || entity.state === 'unavailable' || entity.state === 'unknown'

  useEffect(() => {
    if (!isDragging.current && haBri != null) {
      setLocalBrightness(bri255ToPercent(haBri))
    }
  }, [haBri])

  function handleMasterToggle() {
    haService.toggleLight(config.entity).catch(console.error)
  }

  function handleMasterBrightnessChange([pct]: number[]) {
    isDragging.current = true
    setLocalBrightness(pct)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      isDragging.current = false
      haService.setBrightness(config.entity, percentTo255(pct)).catch(console.error)
    }, 300)
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        opacity: unavailable ? 0.5 : 1,
        pointerEvents: unavailable ? 'none' : 'auto',
      }}
    >
      {/* Unavailable badge */}
      {unavailable && (
        <span
          className="self-start font-body px-2 py-0.5 rounded-full mb-2"
          style={{ background: '#f0ebe4', color: '#a09890', fontSize: '0.625rem' }}
        >
          Unavailable
        </span>
      )}

      {/* Master header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <Sun size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
        <span
          className="font-body"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: '#b0a898',
            fontWeight: 500,
            textTransform: 'uppercase',
            flex: 1,
          }}
        >
          {config.name ?? config.entity}
        </span>
        <Switch
          checked={isOn}
          onCheckedChange={handleMasterToggle}
          aria-label={`Toggle ${config.name ?? config.entity}`}
        />
      </div>

      {/* Master brightness value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '8px' }}>
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

      {/* Master slider — only when on */}
      {isOn && (
        <div style={{ marginBottom: '4px' }}>
          <Slider
            min={1} max={100} step={1}
            value={[localBrightness]}
            onValueChange={handleMasterBrightnessChange}
            className="w-full"
          />
        </div>
      )}

      {/* Divider */}
      {!unavailable && (
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', margin: '12px 0 10px' }} />
      )}

      {/* Member rows */}
      {!unavailable && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {config.members.map((member) => (
            <LightGroupMemberRow key={member.entity} member={member} />
          ))}
        </div>
      )}
    </div>
  )
}
