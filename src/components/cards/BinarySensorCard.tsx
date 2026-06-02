import { motion } from 'framer-motion'
import {
  DoorOpen, DoorClosed, PersonStanding, Activity, AppWindow,
  Flame, Droplets, ShieldCheck, ShieldAlert, Plug, type LucideProps,
} from 'lucide-react'
import { useHAStore } from '@/store/useHAStore'
import type { BinarySensorCardConfig } from '@/config/types'

interface Props {
  config: BinarySensorCardConfig
}

type IconPair = {
  on: React.ComponentType<LucideProps>
  off: React.ComponentType<LucideProps>
}

const deviceClassIcons: Record<string, IconPair> = {
  door:     { on: DoorOpen,       off: DoorClosed  },
  window:   { on: AppWindow,      off: AppWindow   },
  motion:   { on: PersonStanding, off: Activity    },
  smoke:    { on: Flame,          off: Flame       },
  moisture: { on: Droplets,       off: Droplets    },
  safety:   { on: ShieldAlert,    off: ShieldCheck },
  plug:     { on: Plug,           off: Plug        },
  power:    { on: Activity,       off: Activity    },
  lock:     { on: ShieldCheck,    off: ShieldAlert },
  running:  { on: Activity,       off: Activity    },
}

export function BinarySensorCard({ config }: Props) {
  const entity = useHAStore((s) => s.entities[config.entity])
  const isActive = entity?.state === 'on'
  const deviceClass = config.device_class ?? ''
  const icons = deviceClassIcons[deviceClass] ?? { on: Activity, off: Activity }
  const Icon = isActive ? icons.on : icons.off

  return (
    <div className="flex flex-col h-full" style={{ gap: '8px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icon size={12} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898', fontWeight: 500, textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
          {config.name ?? config.entity}
        </span>
      </div>

      {/* State icon + label */}
      <div className="flex items-center gap-3 flex-1">
        <motion.div
          animate={{
            color: isActive ? '#f5a623' : '#c8c0b8',
            opacity: isActive ? 1 : 0.6,
            filter: isActive
              ? 'drop-shadow(0 0 6px rgba(245,166,35,0.5))'
              : 'none',
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <motion.div
            key={entity?.state}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Icon size={32} strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        <div className="flex flex-col gap-0.5">
          <span
            className="font-value font-medium"
            style={{
              color: isActive ? '#1a1714' : '#c8c0b8',
              fontSize: '1.25rem',
              transition: 'color 0.3s',
            }}
          >
            {isActive ? 'Active' : 'Clear'}
          </span>
          {deviceClass && (
            <span
              className="font-body uppercase"
              style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: '#b0a898' }}
            >
              {deviceClass}
            </span>
          )}
        </div>
      </div>

      {/* Bottom label — HA friendly_name, only when different from card name */}
      {(() => {
        const friendlyName = entity?.attributes && (entity.attributes as Record<string, unknown>).friendly_name as string | undefined
        return friendlyName && friendlyName !== config.name ? (
          <span
            className="font-body truncate"
            style={{ color: '#9a9088', fontSize: '0.72rem', marginTop: 'auto', letterSpacing: '0.01em' }}
          >
            {friendlyName}
          </span>
        ) : <span style={{ marginTop: 'auto' }} />
      })()}
    </div>
  )
}
