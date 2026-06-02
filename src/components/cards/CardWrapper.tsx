import { motion } from 'framer-motion'
import { useHAStore } from '@/store/useHAStore'
import { cn } from '@/lib/utils'

interface CardWrapperProps {
  entityId: string
  children: React.ReactNode
  className?: string
}

const SHADOW_BASE =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.09), 0 16px 40px rgba(0,0,0,0.06)'
const SHADOW_HOVER =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(0,0,0,0.08), 0 8px 28px rgba(0,0,0,0.12), 0 0 0 1.5px rgba(245,166,35,0.3)'
const SHADOW_ACTIVE =
  'inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.09), 0 0 0 1px rgba(245,166,35,0.2)'

export function CardWrapper({ entityId, children, className }: CardWrapperProps) {
  const entity = useHAStore((s) => s.entities[entityId])
  const unavailable =
    !entity || entity.state === 'unavailable' || entity.state === 'unknown'

  const domain = entityId.split('.')[0]
  const isActive =
    (domain === 'light' || domain === 'switch') && entity?.state === 'on'

  return (
    <motion.div
      animate={{
        backgroundColor: isActive ? '#fffdf5' : '#ffffff',
        borderColor: isActive ? 'rgba(245,166,35,0.25)' : 'rgba(0,0,0,0.08)',
        boxShadow: isActive ? SHADOW_ACTIVE : SHADOW_BASE,
      }}
      whileHover={{
        backgroundColor: isActive ? '#fffbee' : '#fffdf9',
        borderColor: isActive ? 'rgba(245,166,35,0.4)' : 'rgba(245,166,35,0.3)',
        boxShadow: SHADOW_HOVER,
        y: -2,
      }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '10px',
        padding: '18px 20px 16px 20px',
      }}
      className={cn(
        'flex flex-col gap-3 overflow-hidden h-full',
        unavailable && 'opacity-45 pointer-events-none',
        className,
      )}
    >
      {unavailable && entity && (
        <span
          className="self-start text-[10px] font-body px-2 py-0.5 rounded-full"
          style={{ background: '#f0ebe4', color: '#a09890' }}
        >
          Unavailable
        </span>
      )}
      {children}
    </motion.div>
  )
}
