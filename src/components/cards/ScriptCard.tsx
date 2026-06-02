import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { Play } from 'lucide-react'
import { useHAStore } from '@/store/useHAStore'
import { haService } from '@/lib/ha'
import type { ScriptCardConfig } from '@/config/types'

interface Props {
  config: ScriptCardConfig
}

function getIcon(name: string | undefined): React.ElementType {
  if (!name) return Play
  const key = name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('')
  return (Icons as unknown as Record<string, React.ElementType>)[key] ?? Play
}

function timeAgo(iso: string | undefined): string | null {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

export function ScriptCard({ config }: Props) {
  const entity = useHAStore((s) => s.entities[config.entity])
  const isRunning = entity?.state === 'on'
  const lastTriggered = (entity?.attributes as Record<string, unknown>)?.last_triggered as string | undefined
  const Icon = getIcon(config.icon)

  function handleRun() {
    haService.callScript(config.entity).catch(console.error)
  }

  return (
    <div className="flex flex-col h-full" style={{ gap: '8px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icon size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898', fontWeight: 500, textTransform: 'uppercase' }}>
          {config.name ?? config.entity}
        </span>
      </div>

      {/* Tap area */}
      <motion.button
        onClick={handleRun}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
        }}
        aria-label={`Run ${config.name ?? config.entity}`}
      >
        {isRunning ? (
          <>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f5a623', flexShrink: 0 }}
            />
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 600, color: '#f5a623' }}>
              Running
            </span>
          </>
        ) : (
          <>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(245,166,35,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Play size={16} style={{ color: '#f5a623', marginLeft: '2px' }} />
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#a09890' }}>
              Tap to run
            </span>
          </>
        )}
      </motion.button>

      {/* Last triggered */}
      {lastTriggered && (
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', color: '#c0b8b0', marginTop: 'auto', textAlign: 'center' }}>
          {timeAgo(lastTriggered)}
        </span>
      )}
    </div>
  )
}
