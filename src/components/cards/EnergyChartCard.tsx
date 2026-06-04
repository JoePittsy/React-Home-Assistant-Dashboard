import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Flame } from 'lucide-react'
import { useHAStore } from '@/store/useHAStore'
import { fetchDailyHistory, type DailyTotal } from '@/lib/ha'
import type { EnergyChartCardConfig } from '@/config/types'

interface Props {
  config: EnergyChartCardConfig
}

const SHADOW =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.09), 0 16px 40px rgba(0,0,0,0.06)'
const SHADOW_HOVER =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.08), 0 8px 28px rgba(0,0,0,0.12), 0 0 0 1.5px rgba(245,166,35,0.3)'

const BAR_AREA_H = 140  // px — fixed height for the bar zone
const BAR_MIN_H  = 4    // px — minimum visible bar

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function fmtValue(v: number, unit: string): string {
  if (unit === '£') return `£${v.toFixed(2)}`
  return `${v.toFixed(1)}`
}

function barColour(total: number, avg: number, isToday: boolean): string {
  if (isToday) return 'rgba(245,166,35,0.55)'
  if (total <= avg) return '#2a8a82'
  return '#f5a623'
}

export function EnergyChartCard({ config }: Props) {
  const connected = useHAStore((s) => s.connectionStatus === 'connected')
  const isElec = !config.entity.includes('gas')
  const Icon = isElec ? Zap : Flame
  const unit = config.unit ?? '£'
  const days = config.days ?? 7

  const [history, setHistory] = useState<DailyTotal[] | null>(null)

  useEffect(() => {
    if (!connected) return
    fetchDailyHistory(config.entity, days).then(setHistory).catch(() => null)
  }, [connected, config.entity, days])

  const totals = history ?? []
  const maxVal = totals.length > 0 ? Math.max(...totals.map((d) => d.total), 0.01) : 1
  const completeDays = totals.filter((d) => !d.isToday)
  const avgVal = completeDays.length > 0
    ? completeDays.reduce((s, d) => s + d.total, 0) / completeDays.length
    : 0
  // Average line Y position from bottom of bar zone (in px)
  const avgLineBottom = avgVal > 0 ? Math.max((avgVal / maxVal) * BAR_AREA_H, 2) : 0

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
        gap: '10px',
        minHeight: '260px',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898', fontWeight: 500, textTransform: 'uppercase' }}>
            {config.name ?? 'Energy'}
          </span>
        </div>
        {avgVal > 0 && (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#a09890' }}>
            avg {fmtValue(avgVal, unit)} /day
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {history === null ? (
          /* Loading skeleton */
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: BAR_AREA_H, flexShrink: 0 }}
          >
            {Array.from({ length: days }).map((_, i) => {
              const h = 30 + [40, 70, 55, 25, 65, 50, 35][i % 7]
              return (
                <div key={i} style={{ flex: 1, height: h, borderRadius: '4px 4px 0 0', background: '#ece7e0' }} />
              )
            })}
          </motion.div>
        ) : totals.length === 0 ? (
          <div key="empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: BAR_AREA_H, color: '#a09890', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem' }}>
            No data available
          </div>
        ) : (
          <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0', flex: 1 }}
          >
            {/* Value labels row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexShrink: 0 }}>
              {totals.map((day, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.68rem',
                    color: day.isToday ? '#f5a623' : '#6b6560',
                    whiteSpace: 'nowrap',
                  }}>
                    {fmtValue(day.total, unit)}{day.isToday ? '▸' : ''}
                  </span>
                </div>
              ))}
            </div>

            {/* Bar zone — fixed pixel height, bars grow from bottom */}
            <div style={{ position: 'relative', height: BAR_AREA_H, flexShrink: 0 }}>
              {/* Average line */}
              {avgLineBottom > 0 && (
                <div style={{
                  position: 'absolute',
                  left: 0, right: 0,
                  bottom: avgLineBottom,
                  borderTop: '1.5px dashed rgba(0,0,0,0.15)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }} />
              )}

              {/* Bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100%' }}>
                {totals.map((day, i) => {
                  const barH = Math.max((day.total / maxVal) * BAR_AREA_H, BAR_MIN_H)
                  const colour = barColour(day.total, avgVal, day.isToday)

                  return (
                    <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: barH }}
                        transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
                        style={{
                          width: '100%',
                          background: colour,
                          borderRadius: '4px 4px 0 0',
                          flexShrink: 0,
                          transition: 'background 0.4s ease',
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Day labels row */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexShrink: 0 }}>
              {totals.map((day, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.65rem',
                    color: day.isToday ? '#6b6560' : '#a09890',
                  }}>
                    {day.isToday ? 'Today' : SHORT_DAYS[day.date.getDay()]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
