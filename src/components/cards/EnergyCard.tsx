import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Flame } from 'lucide-react'
import { useHAStore } from '@/store/useHAStore'
import { fetchYesterdayPeak } from '@/lib/ha'
import type { EnergyCardConfig } from '@/config/types'

interface Props {
  config: EnergyCardConfig
}

const SHADOW =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.09), 0 16px 40px rgba(0,0,0,0.06)'
const SHADOW_HOVER =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.08), 0 8px 28px rgba(0,0,0,0.12), 0 0 0 1.5px rgba(245,166,35,0.3)'

function safeFloat(state: string | undefined): number | null {
  if (!state || state === 'unavailable' || state === 'unknown') return null
  const v = parseFloat(state)
  return isNaN(v) ? null : v
}

function powerColor(w: number): string {
  if (w < 500) return '#2a8a82'
  if (w > 2000) return '#e07b4a'
  return '#1a1714'
}

function DeltaRow({ today, yesterday }: { today: number | null; yesterday: number | null }) {
  if (today == null || yesterday == null) return null
  const delta = today - yesterday
  const pct = yesterday !== 0 ? Math.abs(delta / yesterday) : 0
  const isSame = pct < 0.02

  if (isSame) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
        <span className="font-value" style={{ fontSize: '0.8rem', color: '#a09890' }}>—</span>
        <span className="font-body" style={{ fontSize: '0.7rem', color: '#a09890' }}>same as yesterday</span>
      </div>
    )
  }

  const more = delta > 0
  const arrow = more ? '▲' : '▼'
  const arrowColor = more ? '#e07b4a' : '#2a8a82'
  const label = more ? 'more today' : 'less today'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
      <span className="font-value" style={{ fontSize: '0.8rem', color: arrowColor }}>{arrow} £{Math.abs(delta).toFixed(2)}</span>
      <span className="font-body" style={{ fontSize: '0.7rem', color: '#a09890' }}>{label}</span>
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div
      className="font-body"
      style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: '#a09890', textTransform: 'uppercase', marginBottom: '10px' }}
    >
      {text}
    </div>
  )
}

function CostBlock({ cost, usage, small }: { cost: number | null; usage: number | null; small?: boolean }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
        <span className="font-body" style={{ fontSize: small ? '0.9rem' : '1.2rem', color: '#a09890' }}>£</span>
        <span className="font-value" style={{ fontSize: small ? '1.5rem' : '2rem', fontWeight: 600, color: '#1a1714', lineHeight: 1 }}>
          {cost != null ? cost.toFixed(2) : '—'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
        <span className="font-value" style={{ fontSize: small ? '0.78rem' : '1rem', color: '#6b6560' }}>
          {usage != null ? usage.toFixed(2) : '—'}
        </span>
        <span className="font-body" style={{ fontSize: '0.75rem', color: '#a09890' }}>kWh</span>
      </div>
    </div>
  )
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 640)
    window.addEventListener('resize', h, { passive: true })
    return () => window.removeEventListener('resize', h)
  }, [])
  return mobile
}

export function EnergyCard({ config }: Props) {
  const e = config.entities
  const isElec = !!e.power_now
  const isMobile = useIsMobile()
  const connected = useHAStore((s) => s.connectionStatus === 'connected')

  const powerEntity   = useHAStore((s) => e.power_now  ? s.entities[e.power_now]  : undefined)
  const costEntity    = useHAStore((s) => e.cost_today ? s.entities[e.cost_today] : undefined)
  const usageEntity   = useHAStore((s) => e.usage_today? s.entities[e.usage_today]: undefined)
  const rateEntity    = useHAStore((s) => e.unit_rate  ? s.entities[e.unit_rate]  : undefined)
  const offPeakEntity = useHAStore((s) => e.off_peak   ? s.entities[e.off_peak]   : undefined)

  const powerNow  = safeFloat(powerEntity?.state)
  const costToday = safeFloat(costEntity?.state)
  const usageToday= safeFloat(usageEntity?.state)
  const rateVal   = safeFloat(rateEntity?.state)
  const isOffPeak = offPeakEntity?.state === 'on'

  // Fetch accurate yesterday totals via WebSocket history command (no CORS)
  const [costYest, setCostYest]   = useState<number | null>(null)
  const [usageYest, setUsageYest] = useState<number | null>(null)

  useEffect(() => {
    if (!connected) return
    if (e.cost_today)  fetchYesterdayPeak(e.cost_today).then(setCostYest).catch(() => null)
    if (e.usage_today) fetchYesterdayPeak(e.usage_today).then(setUsageYest).catch(() => null)
  }, [connected])

  // Power W→kW conversion
  const { powerDisplay, powerUnit } = (() => {
    if (powerNow == null) return { powerDisplay: '—', powerUnit: 'W' }
    if (powerNow >= 1000) return { powerDisplay: (powerNow / 1000).toFixed(1), powerUnit: 'kW' }
    return { powerDisplay: Math.round(powerNow).toString(), powerUnit: 'W' }
  })()

  // Pulse animation on power change
  const [pulse, setPulse] = useState(false)
  const [prevPower, setPrevPower] = useState(powerNow)
  useEffect(() => {
    if (powerNow !== prevPower && powerNow != null) {
      setPrevPower(powerNow)
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 300)
      return () => clearTimeout(t)
    }
  }, [powerNow])

  const allUnavailable = powerNow == null && costToday == null && usageToday == null

  return (
    <motion.div
      animate={{ boxShadow: SHADOW }}
      whileHover={{ boxShadow: SHADOW_HOVER, y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        backgroundColor: '#ffffff',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(0,0,0,0.08)',
        borderRadius: '10px',
        padding: '18px 20px 16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        height: '100%',
        opacity: allUnavailable ? 0.5 : 1,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isElec
            ? <Zap size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
            : <Flame size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
          }
          <span className="font-body" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898', fontWeight: 500, textTransform: 'uppercase' }}>
            {config.name ?? (isElec ? 'Electricity' : 'Gas')}
          </span>
        </div>

        {e.off_peak && (
          <AnimatePresence mode="wait">
            <motion.div
              key={isOffPeak ? 'offpeak' : 'peak'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '4px',
                background: isOffPeak ? 'rgba(42,138,130,0.08)' : 'rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: '8px', color: isOffPeak ? '#2a8a82' : '#c0b8b0' }}>●</span>
              <span className="font-body" style={{ fontSize: '0.75rem', color: isOffPeak ? '#2a8a82' : '#a09890' }}>
                {isOffPeak ? 'Off-Peak' : 'Peak Rate'}
              </span>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Body — always horizontal, smaller fonts on mobile */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Column 1 — LIVE (electricity only) */}
        {isElec && (
          <div style={{ flex: 1, paddingRight: isMobile ? '12px' : '20px', borderRight: '1px solid rgba(0,0,0,0.07)' }}>
            <SectionLabel text="Live" />
            <motion.div
              animate={{ scale: pulse ? 1.04 : 1, color: powerNow != null ? powerColor(powerNow) : '#a09890' }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}
            >
              <span className="font-value" style={{ fontSize: isMobile ? '1.8rem' : '2.8rem', fontWeight: 600, lineHeight: 1 }}>
                {powerDisplay}
              </span>
              <span className="font-body" style={{ fontSize: isMobile ? '0.8rem' : '1rem', color: '#a09890' }}>
                {powerUnit}
              </span>
            </motion.div>

            {rateVal != null && (
              <div style={{ marginTop: isMobile ? '6px' : '10px' }}>
                <div className="font-body" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: '#c0b8b0', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Rate
                </div>
                <span className="font-value" style={{ fontSize: '0.75rem', color: '#6b6560' }}>
                  {(rateVal * 100).toFixed(2)}p
                </span>
              </div>
            )}
          </div>
        )}

        {/* Column 2 — TODAY */}
        <div style={{
          flex: 1,
          padding: isElec ? `0 ${isMobile ? '12px' : '20px'}` : `0 ${isMobile ? '12px' : '20px'} 0 0`,
          borderRight: '1px solid rgba(0,0,0,0.07)',
        }}>
          <SectionLabel text="Today" />
          <CostBlock cost={costToday} usage={usageToday} small={isMobile} />
          {!isElec && rateVal != null && (
            <div style={{ marginTop: '6px' }}>
              <span className="font-value" style={{ fontSize: '0.75rem', color: '#6b6560' }}>
                {(rateVal * 100).toFixed(2)}p /kWh
              </span>
            </div>
          )}
        </div>

        {/* Column 3 — YESTERDAY */}
        <div style={{ flex: 1, paddingLeft: isMobile ? '12px' : '20px' }}>
          <SectionLabel text="Yesterday" />
          <CostBlock cost={costYest} usage={usageYest} small={isMobile} />
          <DeltaRow today={costToday} yesterday={costYest} />
        </div>
      </div>
    </motion.div>
  )
}
