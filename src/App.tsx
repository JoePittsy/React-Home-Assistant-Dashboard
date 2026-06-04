import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react'
import { useHAStore } from '@/store/useHAStore'
import { loadConfig } from '@/lib/yaml'
import { haService } from '@/lib/ha'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageGrid } from '@/components/layout/PageGrid'
import { ConnectionBadge } from '@/components/layout/ConnectionBadge'

function FullScreenLoader({ title }: { title: string }) {
  return (
    <div className="bg-page flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Wifi size={32} style={{ color: '#f5a623' }} />
        </motion.div>
        <p className="font-heading text-lg font-medium tracking-wide" style={{ color: 'var(--text-primary)' }}>
          Connecting to {title}
        </p>
        <p className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>
          Loading dashboard configuration…
        </p>
      </div>
    </div>
  )
}

function FullScreenError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-page flex h-screen w-screen items-center justify-center p-8">
      <div
        className="rounded-xl p-8 max-w-md w-full flex flex-col gap-5"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} style={{ color: '#e53e3e' }} className="flex-shrink-0" />
          <h2 className="font-heading text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Configuration Error
          </h2>
        </div>
        <p className="font-body text-sm leading-relaxed break-words" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-body text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: '#f5a623', color: '#1a1714' }}
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const config = useHAStore((s) => s.config)
  const configError = useHAStore((s) => s.configError)
  const configLoading = useHAStore((s) => s.configLoading)
  const setConfig = useHAStore((s) => s.setConfig)
  const setConfigError = useHAStore((s) => s.setConfigError)
  const setConnectionStatus = useHAStore((s) => s.setConnectionStatus)
  const setEntities = useHAStore((s) => s.setEntities)

  function initConfig() {
    useHAStore.setState({ configLoading: true, configError: null, config: null })
    loadConfig().then(setConfig).catch((e: unknown) => {
      setConfigError(e instanceof Error ? e.message : String(e))
    })
  }

  useEffect(() => {
    initConfig()
  }, [])

  useEffect(() => {
    if (!config) return
    haService
      .connect(config.ha.url, config.ha.token, setEntities, setConnectionStatus)
      .catch((e: unknown) => {
        setConnectionStatus('error')
        console.error('HA connection failed:', e)
      })
    return () => {
      haService.disconnect()
    }
  }, [config])

  if (configLoading) {
    return <FullScreenLoader title={config?.dashboard.title ?? 'Casa'} />
  }

  if (configError) {
    return <FullScreenError message={configError} onRetry={initConfig} />
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      <Sidebar />
      <main className="bg-page flex-1 overflow-y-auto pb-20 md:pb-0">
        <PageGrid />
      </main>
      <ConnectionBadge className="hidden md:flex" />
    </div>
  )
}
