import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useHAStore } from '@/store/useHAStore'
import { haService } from '@/lib/ha'
import type { SwitchCardConfig } from '@/config/types'

interface Props {
  config: SwitchCardConfig
}

export function SwitchCard({ config }: Props) {
  const entity = useHAStore((s) => s.entities[config.entity])
  const isOn = entity?.state === 'on'

  function handleToggle() {
    haService.toggleSwitch(config.entity).catch(console.error)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Zap
            size={14}
            className="flex-shrink-0"
            style={{ color: isOn ? '#f5a623' : '#4a5568' }}
          />
          <span className="font-heading text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
            {config.name ?? config.entity}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.span
            animate={{
              backgroundColor: isOn ? '#f5a623' : '#4a5568',
              scale: isOn ? 1.15 : 1,
            }}
            transition={{ duration: 0.25 }}
            className="w-2 h-2 rounded-full"
          />
          <Switch
            checked={isOn}
            onCheckedChange={handleToggle}
            aria-label={`Toggle ${config.name ?? config.entity}`}
          />
        </div>
      </div>

      <span
        className="font-value text-3xl font-medium transition-colors duration-300"
        style={{ color: isOn ? '#f5a623' : '#4a5568' }}
      >
        {isOn ? 'On' : 'Off'}
      </span>
    </div>
  )
}
