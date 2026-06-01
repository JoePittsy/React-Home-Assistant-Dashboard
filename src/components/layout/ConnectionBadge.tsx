import { useHAStore } from '@/store/useHAStore'
import { cn } from '@/lib/utils'

const statusConfig = {
  idle: { dot: 'bg-zinc-500', label: 'Idle', pulse: false },
  connecting: { dot: 'bg-amber-400', label: 'Connecting…', pulse: true },
  connected: { dot: 'bg-emerald-400', label: 'Connected', pulse: false },
  disconnected: { dot: 'bg-amber-400', label: 'Reconnecting…', pulse: true },
  error: { dot: 'bg-red-500', label: 'Error', pulse: true },
} as const

export function ConnectionBadge() {
  const status = useHAStore((s) => s.connectionStatus)
  const cfg = statusConfig[status]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-3 py-1.5 card-glass text-xs font-body text-muted-foreground select-none">
      <span
        className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot, cfg.pulse && 'animate-pulse')}
      />
      <span>{cfg.label}</span>
    </div>
  )
}
