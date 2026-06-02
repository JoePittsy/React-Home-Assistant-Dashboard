import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useHAStore } from '@/store/useHAStore'
import { haService } from '@/lib/ha'
import type { SwitchCardConfig } from '@/config/types'

interface Props {
  config: SwitchCardConfig
}

const ON_COLOR  = '#f5a623'
const OFF_COLOR = '#c8c0b8'

export function SwitchCard({ config }: Props) {
  const entity = useHAStore((s) => s.entities[config.entity])
  const isOn = entity?.state === 'on'

  function handleToggle() {
    haService.toggleSwitch(config.entity).catch(console.error)
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Zap size={14} style={{ color: '#f5a623', opacity: 0.7, flexShrink: 0 }} />
          <span
            className="font-body truncate"
            style={{ color: '#b0a898', fontSize: '0.65rem', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase' }}
          >
            {config.name ?? config.entity}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.span
            animate={{ backgroundColor: isOn ? ON_COLOR : OFF_COLOR, scale: isOn ? 1.15 : 1 }}
            transition={{ duration: 0.2 }}
            className="rounded-full"
            style={{ width: '6px', height: '6px' }}
          />
          <Switch
            checked={isOn}
            onCheckedChange={handleToggle}
            aria-label={`Toggle ${config.name ?? config.entity}`}
          />
        </div>
      </div>

      <span
        className="font-value font-medium transition-colors duration-300"
        style={{ color: isOn ? ON_COLOR : OFF_COLOR, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', lineHeight: 1 }}
      >
        {isOn ? 'On' : 'Off'}
      </span>
    </div>
  )
}
