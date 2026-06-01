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
    <div className="bg-dashboard flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Wifi size={32} className="text-primary" />
        </motion.div>
        <p className="font-heading text-lg font-medium tracking-wide text-foreground/80">
          Connecting to {title}
        </p>
        <p className="font-body text-xs text-muted-foreground">Loading dashboard configuration…</p>
      </div>
    </div>
  )
}

function FullScreenError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-dashboard flex h-screen w-screen items-center justify-center p-8">
      <div className="card-glass rounded-md p-8 max-w-md w-full flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-destructive flex-shrink-0" />
          <h2 className="font-heading text-base font-semibold text-foreground">
            Configuration Error
          </h2>
        </div>
        <p className="font-body text-sm text-muted-foreground leading-relaxed break-words">
          {message}
        </p>
        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 rounded-md px-4 py-2.5 bg-primary text-primary-foreground font-body text-sm font-medium hover:opacity-90 transition-opacity"
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
    <div className="bg-dashboard flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <PageGrid />
      </main>
      <ConnectionBadge />
    </div>
  )
}
