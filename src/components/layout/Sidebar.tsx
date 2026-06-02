import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'
import { useHAStore } from '@/store/useHAStore'
import { cn } from '@/lib/utils'

function getIcon(name: string | undefined): React.ElementType {
  if (!name) return Icons.LayoutDashboard
  const key = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  return (Icons as unknown as Record<string, React.ElementType>)[key] ?? Icons.LayoutDashboard
}

export function Sidebar() {
  const config = useHAStore((s) => s.config)
  const activePage = useHAStore((s) => s.activePage)
  const setActivePage = useHAStore((s) => s.setActivePage)

  if (!config) return null

  const navItems = config.dashboard.pages.map((page, i) => {
    const Icon = getIcon(page.icon)
    const isActive = i === activePage
    return { page, i, Icon, isActive }
  })

  return (
    <>
      {/* Desktop sidebar — stays dark */}
      <aside
        className="hidden md:flex w-[220px] flex-shrink-0 flex-col h-screen sticky top-0 z-40"
        style={{ background: '#1a1917', borderRight: '1px solid #2d2a26' }}
      >
        {/* Amber top rule */}
        <div style={{ height: '1px', background: '#f5a623', width: '100%' }} />

        <div className="px-6 py-6" style={{ borderBottom: '1px solid #2d2a26' }}>
          <h1
            className="font-heading font-semibold tracking-[0.08em] uppercase"
            style={{ color: '#ffffff', fontSize: '1.1rem' }}
          >
            {config.dashboard.title}
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
              style={{ backgroundColor: '#f5a623' }}
            />
            <span
              className="font-body uppercase tracking-widest"
              style={{ fontSize: '10px', color: 'rgba(245,166,35,0.7)' }}
            >
              Live
            </span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ page, i, Icon, isActive }) => (
            <motion.button
              key={i}
              onClick={() => setActivePage(i)}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-left w-full relative transition-all duration-150 text-sm font-body"
              style={{
                color: isActive ? '#ffffff' : '#8a8278',
                background: isActive ? '#221f16' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#252219'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#e8e0d4'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#8a8278'
                }
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                  style={{ width: '3px', height: '24px', background: '#f5a623' }}
                />
              )}
              <Icon
                size={16}
                className="flex-shrink-0"
                style={{ color: isActive ? '#f5a623' : 'inherit' }}
              />
              <span className="truncate">{page.name}</span>
            </motion.button>
          ))}
        </nav>

        <div className="px-6 py-4" style={{ borderTop: '1px solid #2d2a26' }}>
          <p
            className="font-body uppercase tracking-[0.1em]"
            style={{ fontSize: '10px', color: '#4a4540' }}
          >
            Home Assistant
          </p>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 h-16"
        style={{ background: '#1a1917', borderTop: '1px solid #2d2a26' }}
      >
        {navItems.map(({ page, i, Icon, isActive }) => (
          <button
            key={i}
            onClick={() => setActivePage(i)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 transition-colors',
            )}
            style={{ color: isActive ? '#f5a623' : '#8a8278' }}
          >
            <Icon size={18} />
            <span className="font-body truncate px-1" style={{ fontSize: '10px' }}>
              {page.name}
            </span>
          </button>
        ))}
      </nav>
    </>
  )
}
