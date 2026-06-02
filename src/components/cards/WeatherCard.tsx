import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, CloudSun, Cloud, Cloudy, CloudRain, Snowflake, CloudSnow,
  CloudHail, CloudLightning, CloudFog, Wind, AlertTriangle,
  Droplets, ArrowDownUp, type LucideIcon,
} from 'lucide-react'
import { useHAStore } from '@/store/useHAStore'
import { subscribeWeatherForecast } from '@/lib/ha'
import type { WeatherCardConfig, ForecastSlot } from '@/config/types'

interface Props {
  config: WeatherCardConfig
}

// ─── Condition map ────────────────────────────────────────────────────────────

interface ConditionDef { icon: LucideIcon; label: string; colour: string; anim?: string }

const CONDITIONS: Record<string, ConditionDef> = {
  'sunny':           { icon: Sun,              label: 'Sunny',        colour: '#f5a623', anim: 'anim-sun'  },
  'clear-night':     { icon: Moon,             label: 'Clear',        colour: '#7b8fd4'                    },
  'partlycloudy':    { icon: CloudSun,         label: 'Partly Cloudy',colour: '#8a9aaa'                    },
  'cloudy':          { icon: Cloudy,           label: 'Cloudy',       colour: '#8a9aaa'                    },
  'overcast':        { icon: Cloud,            label: 'Overcast',     colour: '#7a8a9a'                    },
  'rainy':           { icon: CloudRain,        label: 'Rainy',        colour: '#6a8aaa', anim: 'anim-rain' },
  'pouring':         { icon: CloudRain,        label: 'Pouring',      colour: '#4a6a8a', anim: 'anim-rain' },
  'drizzle':         { icon: CloudRain,        label: 'Drizzle',      colour: '#7a9aaa', anim: 'anim-rain' },
  'snowy':           { icon: Snowflake,        label: 'Snowy',        colour: '#a0b8cc', anim: 'anim-snow' },
  'snowy-rainy':     { icon: CloudSnow,        label: 'Sleet',        colour: '#8aaabe', anim: 'anim-snow' },
  'hail':            { icon: CloudHail,        label: 'Hail',         colour: '#7a9090'                    },
  'lightning':       { icon: CloudLightning,   label: 'Thunder',      colour: '#8a7aaa'                    },
  'lightning-rainy': { icon: CloudLightning,   label: 'Storms',       colour: '#7a6a9a', anim: 'anim-rain' },
  'windy':           { icon: Wind,             label: 'Windy',        colour: '#8aaa98'                    },
  'windy-variant':   { icon: Wind,             label: 'Windy',        colour: '#8aaa98'                    },
  'fog':             { icon: CloudFog,         label: 'Foggy',        colour: '#a0a8a8'                    },
  'exceptional':     { icon: AlertTriangle,    label: 'Severe',       colour: '#e07b4a'                    },
}

function getCondition(state: string): ConditionDef {
  return CONDITIONS[state] ?? { icon: Cloud, label: state, colour: '#a09890' }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bearingToCompass(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8]
}

function fmtForecastDay(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffH = (d.getTime() - now.getTime()) / 3600000
  if (diffH < 1) return 'Now'
  // If hours are 0/12 it's likely a daily forecast
  if (d.getHours() === 0 || d.getHours() === 12) {
    return d.toLocaleDateString('en-GB', { weekday: 'short' })
  }
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getAttr<T>(attrs: unknown, key: string): T | undefined {
  return (attrs as Record<string, unknown>)?.[key] as T | undefined
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatRow({ icon: Icon, value, unit }: { icon: LucideIcon; value: string; unit: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <Icon size={13} style={{ color: '#a09890', flexShrink: 0 }} />
      <span className="font-value" style={{ fontSize: '0.85rem', color: '#1a1714', fontWeight: 500 }}>
        {value}
      </span>
      <span className="font-body" style={{ fontSize: '0.72rem', color: '#a09890' }}>
        {unit}
      </span>
    </div>
  )
}

function ForecastSlotView({ slot, isFirst }: { slot: ForecastSlot; isFirst: boolean }) {
  const cond = getCondition(slot.condition)
  const Icon = cond.icon
  const isDaily = slot.templow !== undefined
  const precip = slot.precipitation_probability ?? 0

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <span className="font-body" style={{ fontSize: '0.7rem', color: '#a09890', textTransform: 'capitalize' }}>
        {isFirst ? 'Now' : fmtForecastDay(slot.datetime)}
      </span>
      <Icon size={20} style={{ color: cond.colour }} />
      {isDaily ? (
        <span className="font-value" style={{ fontSize: '0.82rem', color: '#1a1714' }}>
          {Math.round(slot.temperature)}°
          <span style={{ color: '#a09890' }}> / {Math.round(slot.templow!)}°</span>
        </span>
      ) : (
        <span className="font-value" style={{ fontSize: '0.82rem', color: '#1a1714' }}>
          {Math.round(slot.temperature)}°
        </span>
      )}
      {precip > 10 && (
        <span className="font-value" style={{ fontSize: '0.7rem', color: '#6a8aaa' }}>
          💧{precip}%
        </span>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WeatherCard({ config }: Props) {
  const entity = useHAStore((s) => s.entities[config.entity])
  const connected = useHAStore((s) => s.connectionStatus === 'connected')
  const showForecast = config.show_forecast !== false

  const [forecast, setForecast] = useState<ForecastSlot[] | null>(null)

  useEffect(() => {
    if (!connected || !showForecast) return
    let unsub: (() => void) | null = null
    const subPromise = subscribeWeatherForecast(config.entity, 'daily', setForecast)
    if (subPromise) {
      subPromise.then((fn) => { unsub = fn }).catch(() => null)
    }
    return () => { unsub?.() }
  }, [connected, config.entity])

  if (!entity) return null

  const state = entity.state
  const attrs = entity.attributes as Record<string, unknown>
  const cond = getCondition(state)
  const Icon = cond.icon

  const temp       = getAttr<number>(attrs, 'temperature')
  const humidity   = getAttr<number>(attrs, 'humidity')
  const windSpeed  = getAttr<number>(attrs, 'wind_speed')
  const windBear   = getAttr<number>(attrs, 'wind_bearing')
  const pressure   = getAttr<number>(attrs, 'pressure')
  const windUnit   = getAttr<string>(attrs, 'wind_speed_unit') ?? 'km/h'
  const tempUnit   = getAttr<string>(attrs, 'temperature_unit') ?? '°C'
  const feelsLike  = getAttr<number>(attrs, 'feelslike')
  const uvIndex    = getAttr<number>(attrs, 'uv_index')

  const compass = windBear != null ? bearingToCompass(windBear) : ''
  const visibleForecast = forecast?.slice(0, 3) ?? []
  const hasForecast = showForecast && visibleForecast.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icon size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
        <span className="font-body" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898', fontWeight: 500, textTransform: 'uppercase' }}>
          {config.name ?? 'Weather'}
        </span>
      </div>

      {/* Main weather display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: hasForecast ? 'none' : 1 }}>

        {/* Condition icon with crossfade */}
        <div style={{ flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <div className={cond.anim ?? ''}>
                <Icon size={56} style={{ color: cond.colour }} strokeWidth={1.5} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Temperature + label */}
        <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', flexWrap: 'nowrap' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '2.8rem', fontWeight: 600, color: '#1a1714', lineHeight: 1 }}>
              {temp != null ? Math.round(temp) : '—'}
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.2rem', color: '#a09890', lineHeight: 1 }}>
              {tempUnit}
            </span>
          </div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 600, color: cond.colour, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {cond.label}
          </div>
          {feelsLike != null && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#a09890', marginTop: '2px' }}>
              Feels like {Math.round(feelsLike)}{tempUnit}
            </div>
          )}
        </div>

        {/* Secondary stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', flexShrink: 0 }}>
          {humidity != null && (
            <StatRow icon={Droplets} value={`${Math.round(humidity)}`} unit="%" />
          )}
          {windSpeed != null && (
            <StatRow icon={Wind} value={`${Math.round(windSpeed)} ${windUnit}${compass ? ` · ${compass}` : ''}`} unit="" />
          )}
          {pressure != null && (
            <StatRow icon={ArrowDownUp} value={`${Math.round(pressure)}`} unit="hPa" />
          )}
          {uvIndex != null && (
            <StatRow icon={Sun} value={`UV ${uvIndex.toFixed(0)}`} unit="" />
          )}
        </div>
      </div>

      {/* Forecast strip */}
      {hasForecast && (
        <>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }} />
          <div style={{ display: 'flex' }}>
            {visibleForecast.map((slot, i) => (
              <motion.div
                key={slot.datetime}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                style={{ flex: 1 }}
              >
                <ForecastSlotView slot={slot} isFirst={i === 0} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
