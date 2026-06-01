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
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col card-glass border-r border-r-border/60 h-screen sticky top-0 z-40">
        <div className="px-6 py-7 border-b border-border/40">
          <h1 className="font-heading text-lg font-semibold tracking-wider text-foreground">
            {config.dashboard.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-body">Dashboard</p>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ page, i, Icon, isActive }) => (
            <motion.button
              key={i}
              onClick={() => setActivePage(i)}
              whileHover={{ x: 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-left w-full',
                'transition-colors duration-150 text-sm font-body relative',
                isActive
                  ? 'text-foreground bg-white/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary"
                />
              )}
              <Icon
                size={16}
                className={cn('flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}
              />
              <span className="truncate">{page.name}</span>
            </motion.button>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground/50 font-body">Home Assistant</p>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 card-glass border-t border-border/60 h-16">
        {navItems.map(({ page, i, Icon, isActive }) => (
          <button
            key={i}
            onClick={() => setActivePage(i)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon size={18} />
            <span className="text-[10px] font-body truncate px-1">{page.name}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
