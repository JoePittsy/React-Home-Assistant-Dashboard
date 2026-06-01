import { useHAStore } from '@/store/useHAStore'
import { cn } from '@/lib/utils'

interface CardWrapperProps {
  entityId: string
  children: React.ReactNode
  className?: string
}

export function CardWrapper({ entityId, children, className }: CardWrapperProps) {
  const entity = useHAStore((s) => s.entities[entityId])
  const unavailable =
    !entity || entity.state === 'unavailable' || entity.state === 'unknown'

  return (
    <div
      className={cn(
        'card-glass rounded-md p-5 flex flex-col gap-3 transition-all duration-300 overflow-hidden h-full',
        unavailable && 'opacity-40 pointer-events-none',
        className,
      )}
    >
      {unavailable && entity && (
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">
          Unavailable
        </span>
      )}
      {children}
    </div>
  )
}
