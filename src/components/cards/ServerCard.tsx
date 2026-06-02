import { motion } from 'framer-motion'
import { Server, Package, ArrowDownToLine, ArrowUpFromLine, Film, Tv, PlayCircle, type LucideIcon } from 'lucide-react'
import { useHAStore } from '@/store/useHAStore'
import type { ServerCardConfig } from '@/config/types'

interface Props {
  config: ServerCardConfig
}

const SHADOW =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.09), 0 16px 40px rgba(0,0,0,0.06)'
const SHADOW_HOVER =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.08), 0 8px 28px rgba(0,0,0,0.12), 0 0 0 1.5px rgba(245,166,35,0.3)'

function metricColour(pct: number): string {
  if (pct < 60) return '#2a8a82'
  if (pct < 80) return '#f5a623'
  return '#e07b4a'
}

function tempColour(c: number): string {
  if (c < 60) return '#2a8a82'
  if (c < 75) return '#f5a623'
  return '#e07b4a'
}

function safeNum(state: string | undefined): number | null {
  if (!state || state === 'unavailable' || state === 'unknown') return null
  const v = parseFloat(state)
  return isNaN(v) ? null : v
}

interface BarMetricProps { label: string; value: number | null; unit: string; colour: string }

function BarMetric({ label, value, unit, colour }: BarMetricProps) {
  const pct = Math.min(value ?? 0, 100)
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898', textTransform: 'uppercase', fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: value == null ? '#a09890' : colour, fontWeight: 500 }}>
          {value == null ? '—' : `${value % 1 === 0 ? value : value.toFixed(1)}`}
          <span style={{ fontSize: '0.65rem', color: '#a09890', marginLeft: '2px' }}>{unit}</span>
        </span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: '#ece7e0', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: '3px', background: colour, transition: 'background 0.5s' }}
        />
      </div>
    </div>
  )
}

interface ServiceStatProps { icon: LucideIcon; value: string; unit: string; highlight?: boolean }

function ServiceStat({ icon: Icon, value, unit, highlight }: ServiceStatProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Icon size={13} style={{ color: '#a09890', flexShrink: 0 }} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: highlight ? '#f5a623' : '#1a1714', fontWeight: 500 }}>
        {value}
      </span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', color: '#a09890' }}>
        {unit}
      </span>
    </div>
  )
}

export function ServerCard({ config }: Props) {
  const e = config.entities

  const cpu    = safeNum(useHAStore((s) => e.cpu         ? s.entities[e.cpu]?.state         : undefined))
  const memory = safeNum(useHAStore((s) => e.memory      ? s.entities[e.memory]?.state      : undefined))
  const disk   = safeNum(useHAStore((s) => e.disk        ? s.entities[e.disk]?.state        : undefined))
  const temp   = safeNum(useHAStore((s) => e.temperature ? s.entities[e.temperature]?.state : undefined))
  const containers = safeNum(useHAStore((s) => e.containers ? s.entities[e.containers]?.state : undefined))
  const download   = safeNum(useHAStore((s) => e.download    ? s.entities[e.download]?.state    : undefined))
  const upload     = safeNum(useHAStore((s) => e.upload      ? s.entities[e.upload]?.state      : undefined))
  const sessions   = safeNum(useHAStore((s) => e.jellyfin_sessions ? s.entities[e.jellyfin_sessions]?.state : undefined))
  const movies     = safeNum(useHAStore((s) => e.movies ? s.entities[e.movies]?.state : undefined))
  const shows      = safeNum(useHAStore((s) => e.shows  ? s.entities[e.shows]?.state  : undefined))

  const services = [
    containers != null && { icon: Package,          value: String(Math.round(containers)), unit: 'containers' },
    download   != null && { icon: ArrowDownToLine,  value: download.toFixed(1),            unit: 'MB/s ↓',    highlight: download > 0.1 },
    upload     != null && { icon: ArrowUpFromLine,  value: upload.toFixed(1),              unit: 'MB/s ↑',    highlight: upload > 0.1 },
    movies     != null && { icon: Film,             value: String(Math.round(movies)),     unit: 'films' },
    shows      != null && { icon: Tv,               value: String(Math.round(shows)),      unit: 'shows' },
    sessions   != null && { icon: PlayCircle,       value: String(Math.round(sessions)),   unit: 'playing',   highlight: sessions > 0 },
  ].filter(Boolean) as Array<{ icon: LucideIcon; value: string; unit: string; highlight?: boolean }>

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
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Server size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898', fontWeight: 500, textTransform: 'uppercase' }}>
          {config.name ?? 'Server'}
        </span>
      </div>

      {/* Health bars */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {e.cpu         && <BarMetric label="CPU"    value={cpu}    unit="%"  colour={metricColour(cpu ?? 0)} />}
        {e.memory      && <BarMetric label="Memory" value={memory} unit="%"  colour={metricColour(memory ?? 0)} />}
        {e.disk        && <BarMetric label="Disk"   value={disk}   unit="%"  colour={metricColour(disk ?? 0)} />}
        {e.temperature && <BarMetric label="Temp"   value={temp}   unit="°C" colour={tempColour(temp ?? 0)} />}
      </div>

      {/* Services row */}
      {services.length > 0 && (
        <>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {services.map((s, i) => (
              <ServiceStat key={i} icon={s.icon} value={s.value} unit={s.unit} highlight={s.highlight} />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
