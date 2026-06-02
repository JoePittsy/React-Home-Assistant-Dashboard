import { useHAStore } from '@/store/useHAStore'

const statusConfig = {
  idle:         { dotColor: '#555',     label: 'Idle',          pulse: false },
  connecting:   { dotColor: '#f5a623', label: 'Connecting…',   pulse: true  },
  connected:    { dotColor: '#f5a623', label: 'Connected',      pulse: false },
  disconnected: { dotColor: '#666',     label: 'Reconnecting…', pulse: true  },
  error:        { dotColor: '#e53e3e', label: 'Error',          pulse: true  },
} as const

export function ConnectionBadge() {
  const status = useHAStore((s) => s.connectionStatus)
  const cfg = statusConfig[status]

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 select-none font-body"
      style={{
        background: '#1a1917',
        border: '1px solid #2d2a26',
        borderRadius: '999px',
        padding: '6px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        color: '#e8e0d4',
        fontSize: '0.75rem',
      }}
    >
      <span
        className={cfg.pulse ? 'animate-pulse' : ''}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: cfg.dotColor,
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      <span>{cfg.label}</span>
    </div>
  )
}
