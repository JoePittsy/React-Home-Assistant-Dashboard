import { motion } from 'framer-motion'
import { Film, Tv, HardDrive, type LucideIcon } from 'lucide-react'
import { useHAStore } from '@/store/useHAStore'
import type { MediaCardConfig } from '@/config/types'

interface Props {
  config: MediaCardConfig
}

const SHADOW =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.09), 0 16px 40px rgba(0,0,0,0.06)'
const SHADOW_HOVER =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.08), 0 8px 28px rgba(0,0,0,0.12), 0 0 0 1.5px rgba(245,166,35,0.3)'

function safeInt(state: string | undefined): number | null {
  if (!state || state === 'unavailable' || state === 'unknown') return null
  const v = parseInt(state, 10)
  return isNaN(v) ? null : v
}

function safeFloat(state: string | undefined): number | null {
  if (!state || state === 'unavailable' || state === 'unknown') return null
  const v = parseFloat(state)
  return isNaN(v) ? null : v
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.12em', color: '#a09890', textTransform: 'uppercase', marginBottom: '10px' }}>
      {text}
    </div>
  )
}

function StatLine({ icon: Icon, value, unit, muted }: { icon: LucideIcon; value: string; unit: string; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
      <Icon size={12} style={{ color: '#a09890', flexShrink: 0 }} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.88rem', color: muted ? '#6b6560' : '#1a1714', fontWeight: 500 }}>
        {value}
      </span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#a09890' }}>
        {unit}
      </span>
    </div>
  )
}

export function MediaCard({ config }: Props) {
  const e = config.entities

  const sessions       = safeInt(useHAStore((s) => e.active_sessions    ? s.entities[e.active_sessions]?.state    : undefined))
  const unwatchedMovies = safeInt(useHAStore((s) => e.unwatched_movies  ? s.entities[e.unwatched_movies]?.state   : undefined))
  const unwatchedEps   = safeInt(useHAStore((s) => e.unwatched_episodes ? s.entities[e.unwatched_episodes]?.state : undefined))
  const movies         = safeInt(useHAStore((s) => e.movies    ? s.entities[e.movies]?.state    : undefined))
  const shows          = safeInt(useHAStore((s) => e.shows     ? s.entities[e.shows]?.state     : undefined))
  const radarrQ        = safeInt(useHAStore((s) => e.radarr_queue  ? s.entities[e.radarr_queue]?.state  : undefined))
  const sonarrQ        = safeInt(useHAStore((s) => e.sonarr_queue  ? s.entities[e.sonarr_queue]?.state  : undefined))
  const diskTv         = safeFloat(useHAStore((s) => e.disk_tv     ? s.entities[e.disk_tv]?.state     : undefined))
  const diskMovies     = safeFloat(useHAStore((s) => e.disk_movies ? s.entities[e.disk_movies]?.state : undefined))

  const totalQueue = (radarrQ ?? 0) + (sonarrQ ?? 0)

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
        <Film size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898', fontWeight: 500, textTransform: 'uppercase' }}>
          {config.name ?? 'Media'}
        </span>
      </div>

      {/* 3-column body */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Column 1 — Now Playing */}
        <div style={{ flex: 1, paddingRight: '20px', borderRight: '1px solid rgba(0,0,0,0.07)' }}>
          <SectionLabel text="Now Playing" />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '6px' }}>
            <motion.span
              animate={{ color: sessions != null && sessions > 0 ? '#f5a623' : '#1a1714' }}
              transition={{ duration: 0.3 }}
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '2rem', fontWeight: 600, lineHeight: 1 }}
            >
              {sessions ?? '—'}
            </motion.span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#a09890' }}>
              {sessions === 1 ? 'session' : 'sessions'}
            </span>
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: sessions != null && sessions > 0 ? '#f5a623' : '#a09890' }}>
            {sessions != null && sessions > 0 ? `${sessions} stream${sessions > 1 ? 's' : ''} active` : 'Nothing playing'}
          </div>
        </div>

        {/* Column 2 — Library */}
        <div style={{ flex: 1, padding: '0 20px', borderRight: '1px solid rgba(0,0,0,0.07)' }}>
          <SectionLabel text="Library" />
          {movies != null && <StatLine icon={Film} value={String(movies)} unit="films" />}
          {unwatchedMovies != null && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#a09890', marginBottom: '6px', marginLeft: '17px' }}>
              {unwatchedMovies} unwatched
            </div>
          )}
          {shows != null && <StatLine icon={Tv} value={String(shows)} unit="shows" />}
          {unwatchedEps != null && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#a09890', marginLeft: '17px' }}>
              {unwatchedEps} episodes
            </div>
          )}
        </div>

        {/* Column 3 — Downloads */}
        <div style={{ flex: 1, paddingLeft: '20px' }}>
          <SectionLabel text="Downloads" />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '6px' }}>
            <motion.span
              animate={{ color: totalQueue > 0 ? '#f5a623' : '#1a1714' }}
              transition={{ duration: 0.3 }}
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '2rem', fontWeight: 600, lineHeight: 1 }}
            >
              {totalQueue}
            </motion.span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#a09890' }}>queued</span>
          </div>
          {radarrQ != null && <StatLine icon={Film} value={String(radarrQ)} unit="films"   muted={radarrQ === 0} />}
          {sonarrQ != null && <StatLine icon={Tv}   value={String(sonarrQ)} unit="episodes" muted={sonarrQ === 0} />}
          {(diskTv != null || diskMovies != null) && (
            <div style={{ marginTop: '8px' }}>
              {diskTv    != null && <StatLine icon={HardDrive} value={Math.round(diskTv).toLocaleString()}    unit="GB TV"    muted />}
              {diskMovies!= null && <StatLine icon={HardDrive} value={Math.round(diskMovies).toLocaleString()} unit="GB films" muted />}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
