import { motion, AnimatePresence } from 'framer-motion'
import {
  Car, MapPin, Lock, LockOpen, Zap, Thermometer, Cloud,
  Cpu, Gauge,
} from 'lucide-react'
import { useHAStore } from '@/store/useHAStore'
import type { CarCardConfig } from '@/config/types'

interface Props {
  config: CarCardConfig
}

const SHADOW =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.09), 0 16px 40px rgba(0,0,0,0.06)'
const SHADOW_HOVER =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.08), 0 8px 28px rgba(0,0,0,0.12), 0 0 0 1.5px rgba(245,166,35,0.3)'

function capitaliseWords(str: string): string {
  return str.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function entityVal(state: string | undefined): string | undefined {
  if (!state || state === 'unavailable' || state === 'unknown') return undefined
  return state
}

function entityUnit(attributes: unknown): string {
  const a = attributes as Record<string, unknown> | undefined
  return (a?.unit_of_measurement as string) ?? ''
}

function socColor(soc: number): string {
  if (soc >= 60) return '#2a8a82'
  if (soc < 20) return '#e07b4a'
  return '#1a1714'
}

function socGradient(soc: number): string {
  if (soc >= 60) return 'linear-gradient(90deg, #2a8a82, #3ab0a8)'
  if (soc < 20) return 'linear-gradient(90deg, #e07b4a, #f5a623)'
  return 'linear-gradient(90deg, #f5a623, #f5a623)'
}

export function CarCard({ config }: Props) {
  const e = config.entities

  const socEntity    = useHAStore((s) => e.soc            ? s.entities[e.soc]            : undefined)
  const rangeEntity  = useHAStore((s) => e.range          ? s.entities[e.range]          : undefined)
  const chargEntity  = useHAStore((s) => e.charging       ? s.entities[e.charging]       : undefined)
  const currentEntity= useHAStore((s) => e.charge_current ? s.entities[e.charge_current] : undefined)
  const targetEntity = useHAStore((s) => e.charge_target  ? s.entities[e.charge_target]  : undefined)
  const powerEntity  = useHAStore((s) => e.charge_power   ? s.entities[e.charge_power]   : undefined)
  const locEntity    = useHAStore((s) => e.location       ? s.entities[e.location]       : undefined)
  const lockEntity   = useHAStore((s) => e.locked         ? s.entities[e.locked]         : undefined)
  const odoEntity    = useHAStore((s) => e.odometer       ? s.entities[e.odometer]       : undefined)
  const cabinEntity  = useHAStore((s) => e.cabin_temp     ? s.entities[e.cabin_temp]     : undefined)
  const outsideEntity= useHAStore((s) => e.outside_temp   ? s.entities[e.outside_temp]   : undefined)
  const twelveEntity = useHAStore((s) => e.twelve_volt    ? s.entities[e.twelve_volt]    : undefined)

  // Derived values
  const socRaw    = entityVal(socEntity?.state)
  const socNum    = socRaw ? parseFloat(socRaw) : null
  const isCharging = chargEntity?.state === 'on'
  const isLocked   = lockEntity?.state === 'locked' || lockEntity?.state === 'on'
  const locState   = entityVal(locEntity?.state)
  const isHome     = locState === 'home'

  const rangeVal  = entityVal(rangeEntity?.state)
  const rangeNum  = rangeVal ? Math.round(parseFloat(rangeVal)) : null
  const rangeUnit = entityUnit(rangeEntity?.attributes)

  const powerVal  = entityVal(powerEntity?.state)
  const currentVal= entityVal(currentEntity?.state)
  const targetVal = entityVal(targetEntity?.state)

  const cabinVal   = entityVal(cabinEntity?.state)
  const outsideVal = entityVal(outsideEntity?.state)
  const twelveVal  = entityVal(twelveEntity?.state)
  const odoVal     = entityVal(odoEntity?.state)
  const odoUnit    = entityUnit(odoEntity?.attributes)

  // Stats for zone 3
  const stats: Array<{ icon: React.ElementType; value: string; unit: string; label: string; color?: string }> = []
  if (e.cabin_temp && cabinVal) stats.push({ icon: Thermometer, value: String(Math.round(parseFloat(cabinVal))), unit: '°C', label: 'Cabin' })
  if (e.outside_temp && outsideVal) stats.push({ icon: Cloud, value: String(Math.round(parseFloat(outsideVal))), unit: '°C', label: 'Outside' })
  if (e.twelve_volt && twelveVal) {
    const v = parseFloat(twelveVal)
    const twelveColor = v >= 13.0 ? '#2a8a82' : v < 12.0 ? '#e07b4a' : '#1a1714'
    stats.push({ icon: Cpu, value: v.toFixed(1), unit: 'V', label: '12V', color: twelveColor })
  }
  if (e.odometer && odoVal) stats.push({ icon: Gauge, value: Math.round(parseFloat(odoVal)).toLocaleString(), unit: odoUnit || 'mi', label: 'Odometer' })

  const showZone3 = stats.length >= 1

  // Card border based on state
  const borderColor = isCharging
    ? 'rgba(245,166,35,0.5)'
    : (socNum != null && socNum < 20)
      ? 'rgba(224,123,74,0.4)'
      : 'rgba(0,0,0,0.08)'
  const borderLeftWidth = isCharging ? '3px' : '1px'

  const allUnavailable = !socEntity && !rangeEntity && !chargEntity

  return (
    <motion.div
      animate={{ borderColor, boxShadow: SHADOW }}
      whileHover={{ boxShadow: SHADOW_HOVER, y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        backgroundColor: '#ffffff',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderLeftWidth,
        borderRadius: '10px',
        padding: '18px 20px 16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        height: '100%',
        opacity: allUnavailable ? 0.5 : 1,
      }}
    >
      {allUnavailable ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="font-body" style={{ color: '#a09890', fontSize: '0.85rem' }}>Vehicle unavailable</span>
        </div>
      ) : (
        <>
          {/* ── Zone 1: Header ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            {/* Left: car icon + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Car size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
              <span className="font-body" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898', fontWeight: 500, textTransform: 'uppercase' }}>
                {config.name ?? 'Car'}
              </span>
            </div>

            {/* Right: location + lock chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {locState && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} style={{ color: '#a09890', flexShrink: 0 }} />
                  <span className="font-body" style={{ fontSize: '0.75rem', color: isHome ? '#2a8a82' : '#6b6560' }}>
                    {isHome ? 'Home' : capitaliseWords(locState)}
                  </span>
                </div>
              )}
              {locState && lockEntity && (
                <span style={{ color: '#d0c8c0', fontSize: '0.7rem' }}>·</span>
              )}
              {lockEntity && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isLocked
                    ? <Lock size={12} style={{ color: '#2a8a82', flexShrink: 0 }} />
                    : <LockOpen size={12} style={{ color: '#e07b4a', flexShrink: 0 }} />
                  }
                  <span className="font-body" style={{ fontSize: '0.75rem', color: isLocked ? '#2a8a82' : '#e07b4a' }}>
                    {isLocked ? 'Locked' : 'Unlocked'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Zone 2: SOC + bar ── */}
          <div style={{ padding: '10px 0 14px' }}>
            {/* SOC + bar + range row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              {/* SOC value */}
              <motion.span
                animate={{ color: socNum != null ? socColor(socNum) : '#a09890' }}
                transition={{ duration: 0.5 }}
                className="font-value"
                style={{ fontSize: '3.5rem', fontWeight: 600, lineHeight: 1, flexShrink: 0, minWidth: '96px' }}
              >
                {socNum != null ? `${Math.round(socNum)}%` : '—'}
              </motion.span>

              {/* Bar */}
              <div style={{ flex: 1, margin: '0 16px', position: 'relative' }}>
                <div style={{ height: '8px', borderRadius: '4px', background: '#ece7e0', overflow: 'hidden', position: 'relative' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '4px',
                      background: socNum != null ? socGradient(socNum) : '#ece7e0',
                      width: `${socNum ?? 0}%`,
                      transition: 'width 600ms ease-out, background 500ms ease',
                    }}
                  />
                </div>
              </div>

              {/* Range */}
              <span className="font-value" style={{ fontSize: '1rem', color: '#6b6560', flexShrink: 0, minWidth: '80px', textAlign: 'right' }}>
                {rangeNum != null ? (
                  <>
                    <span style={{ color: '#a09890' }}>~</span>
                    {rangeNum} <span style={{ fontSize: '0.8rem', color: '#a09890' }}>{rangeUnit || 'mi'}</span>
                  </>
                ) : '—'}
              </span>
            </div>

            {/* Charging info row */}
            <AnimatePresence mode="wait">
              {e.charging && (
                <motion.div
                  key={isCharging ? 'charging' : 'idle'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}
                >
                  {isCharging ? (
                    <>
                      <Zap size={14} style={{ color: '#f5a623', flexShrink: 0 }} />
                      <span className="font-body" style={{ fontSize: '0.8rem', color: '#f5a623' }}>Charging</span>
                      {powerVal && (
                        <>
                          <span style={{ color: '#d0c8c0' }}>·</span>
                          <span className="font-value" style={{ fontSize: '0.8rem', color: '#6b6560' }}>{parseFloat(powerVal).toFixed(1)} kW</span>
                        </>
                      )}
                      {currentVal && (
                        <>
                          <span style={{ color: '#d0c8c0' }}>·</span>
                          <span className="font-value" style={{ fontSize: '0.8rem', color: '#6b6560' }}>{Math.round(parseFloat(currentVal))}A</span>
                        </>
                      )}
                      {targetVal && (
                        <>
                          <span style={{ color: '#d0c8c0' }}>·</span>
                          <span className="font-body" style={{ fontSize: '0.8rem', color: '#6b6560' }}>Target <span className="font-value">{Math.round(parseFloat(targetVal))}%</span></span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="font-body" style={{ fontSize: '0.8rem', color: '#a09890' }}>— Not charging</span>
                      {targetVal && (
                        <>
                          <span style={{ color: '#d0c8c0' }}>·</span>
                          <span className="font-body" style={{ fontSize: '0.8rem', color: '#a09890' }}>Target <span className="font-value">{Math.round(parseFloat(targetVal))}%</span></span>
                        </>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Zone 3: Stats bar ── */}
          {showZone3 && (
            <>
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', margin: '0 0 12px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                {stats.map((stat) => (
                  <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <stat.icon size={13} style={{ color: '#a09890', flexShrink: 0 }} />
                    <span className="font-value" style={{ fontSize: '0.85rem', color: stat.color ?? '#1a1714', fontWeight: 500 }}>
                      {stat.value}
                    </span>
                    <span className="font-body" style={{ fontSize: '0.7rem', color: '#a09890' }}>
                      {stat.unit}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </motion.div>
  )
}
