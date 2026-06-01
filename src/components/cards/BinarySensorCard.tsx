import { motion } from 'framer-motion'
import {
  DoorOpen,
  DoorClosed,
  PersonStanding,
  Activity,
  AppWindow,
  Flame,
  Droplets,
  ShieldCheck,
  ShieldAlert,
  type LucideProps,
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
  door: { on: DoorOpen, off: DoorClosed },
  window: { on: AppWindow, off: AppWindow },
  motion: { on: PersonStanding, off: Activity },
  smoke: { on: Flame, off: Flame },
  moisture: { on: Droplets, off: Droplets },
  safety: { on: ShieldAlert, off: ShieldCheck },
}

export function BinarySensorCard({ config }: Props) {
  const entity = useHAStore((s) => s.entities[config.entity])
  const isActive = entity?.state === 'on'
  const deviceClass = config.device_class ?? ''
  const icons = deviceClassIcons[deviceClass] ?? { on: Activity, off: Activity }
  const Icon = isActive ? icons.on : icons.off

  const activeColor = '#f5a623'
  const inactiveColor = '#4a5568'

  return (
    <div className="flex flex-col gap-3">
      <span className="font-heading text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
        {config.name ?? config.entity}
      </span>

      <div className="flex items-center gap-4 py-2">
        <motion.div
          animate={{ color: isActive ? activeColor : inactiveColor }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            key={entity?.state}
            initial={{ scale: 0.85, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Icon size={40} strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        <div className="flex flex-col gap-1">
          <span
            className="font-value text-2xl font-medium transition-colors duration-300"
            style={{ color: isActive ? activeColor : inactiveColor }}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {deviceClass && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-body">
              {deviceClass}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
