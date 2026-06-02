import { motion } from 'framer-motion'
import { User, Home, Battery, BatteryFull, BatteryLow } from 'lucide-react'
import { useHAStore } from '@/store/useHAStore'
import type { PersonCardConfig } from '@/config/types'

interface Props {
  config: PersonCardConfig
}

const HOME_COLOR = '#2a8a82'
const AWAY_COLOR = '#f5a623'

function capitaliseWords(str: string): string {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function getBatteryIcon(pct: number) {
  if (pct >= 80) return BatteryFull
  if (pct < 20) return BatteryLow
  return Battery
}

function getBatteryColor(pct: number): string {
  if (pct >= 80) return HOME_COLOR
  if (pct < 20) return '#e07b4a'
  return '#a09890'
}

export function PersonCard({ config }: Props) {
  const personEntity = useHAStore((s) => s.entities[config.entity])
  const travelEntity = useHAStore((s) =>
    config.travel_time ? s.entities[config.travel_time] : undefined
  )
  const batteryEntity = useHAStore((s) =>
    config.battery ? s.entities[config.battery] : undefined
  )

  const isHome = personEntity?.state === 'home'
  const locationColor = isHome ? HOME_COLOR : AWAY_COLOR
  const locationLabel = isHome
    ? 'Home'
    : capitaliseWords(personEntity?.state ?? 'Unknown')

  const hasSubEntities = !!(config.travel_time || config.battery)

  // Travel time
  const rawTravel = travelEntity?.state
  const travelMin = rawTravel != null && rawTravel !== 'unavailable' && rawTravel !== 'unknown'
    ? (isHome ? 0 : parseInt(rawTravel, 10))
    : null
  const travelDisplay = travelMin != null && !isNaN(travelMin)
    ? String(isHome ? 0 : travelMin)
    : '—'
  const travelColor = isHome ? HOME_COLOR : '#1a1714'

  // Battery
  const rawBattery = batteryEntity?.state
  const batteryPct = rawBattery != null && rawBattery !== 'unavailable' && rawBattery !== 'unknown'
    ? parseInt(rawBattery, 10)
    : null
  const batteryDisplay = batteryPct != null && !isNaN(batteryPct) ? String(batteryPct) : '—'
  const BatteryIcon = batteryPct != null ? getBatteryIcon(batteryPct) : Battery
  const batteryColor = batteryPct != null ? getBatteryColor(batteryPct) : '#a09890'

  return (
    <div className="flex flex-col h-full min-w-0" style={{ gap: '8px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <User size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
        <span
          className="font-body truncate"
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: '#b0a898',
            fontWeight: 500,
            textTransform: 'uppercase',
          }}
        >
          {config.name ?? config.entity}
        </span>
      </div>

      {/* Location state — hero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        {!isHome && (
          <span
            className="animate-pulse rounded-full flex-shrink-0"
            style={{ width: '6px', height: '6px', backgroundColor: AWAY_COLOR }}
          />
        )}
        <motion.span
          animate={{ color: locationColor }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="font-heading font-bold leading-none"
          style={{ fontSize: '2rem', letterSpacing: '-0.01em' }}
        >
          {locationLabel}
        </motion.span>
      </div>

      {/* Divider + info row — only when sub-entities configured */}
      {hasSubEntities && (
        <>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', margin: '2px 0 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Travel time */}
            {config.travel_time ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Home size={14} style={{ color: '#a09890', flexShrink: 0 }} />
                <span
                  className="font-value"
                  style={{ fontSize: '0.95rem', color: travelColor, fontWeight: 500 }}
                >
                  {travelDisplay}
                </span>
                <span
                  className="font-body"
                  style={{ fontSize: '0.75rem', color: '#a09890' }}
                >
                  min
                </span>
              </div>
            ) : (
              <span />
            )}

            {/* Battery */}
            {config.battery ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <BatteryIcon size={14} style={{ color: batteryColor, flexShrink: 0 }} />
                <span
                  className="font-value"
                  style={{ fontSize: '0.95rem', color: '#1a1714', fontWeight: 500 }}
                >
                  {batteryDisplay}
                </span>
                <span
                  className="font-body"
                  style={{ fontSize: '0.75rem', color: '#a09890' }}
                >
                  %
                </span>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
