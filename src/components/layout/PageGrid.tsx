import { motion, AnimatePresence } from 'framer-motion'
import { useHAStore } from '@/store/useHAStore'
import { CardWrapper } from '@/components/cards/CardWrapper'
import { LightCard } from '@/components/cards/LightCard'
import { LightGroupCard } from '@/components/cards/LightGroupCard'
import { SwitchCard } from '@/components/cards/SwitchCard'
import { SensorCard } from '@/components/cards/SensorCard'
import { BinarySensorCard } from '@/components/cards/BinarySensorCard'
import { PersonCard } from '@/components/cards/PersonCard'
import { CarCard } from '@/components/cards/CarCard'
import { EnergyCard } from '@/components/cards/EnergyCard'
import { WeatherCard } from '@/components/cards/WeatherCard'
import { ServerCard } from '@/components/cards/ServerCard'
import { ScriptCard } from '@/components/cards/ScriptCard'
import { MediaCard } from '@/components/cards/MediaCard'
import type { CardConfig } from '@/config/types'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 22, stiffness: 280 },
  },
}

function renderCard(card: CardConfig) {
  switch (card.type) {
    case 'light':
      return <LightCard config={card} />
    case 'light_group':
      return <LightGroupCard config={card} />
    case 'switch':
      return <SwitchCard config={card} />
    case 'sensor':
      return <SensorCard config={card} />
    case 'binary_sensor':
      return <BinarySensorCard config={card} />
    case 'person':
      return <PersonCard config={card} />
    case 'car':
      return <CarCard config={card} />
    case 'energy':
      return <EnergyCard config={card} />
    case 'weather':
      return <WeatherCard config={card} />
    case 'server':
      return <ServerCard config={card} />
    case 'script':
      return <ScriptCard config={card} />
    case 'media':
      return <MediaCard config={card} />
  }
}

function cardSpan(card: CardConfig): number | undefined {
  if (card.type === 'light_group') return card.size ?? 2
  if (card.type === 'car') return card.size ?? 4
  if (card.type === 'energy') return card.size ?? 4
  if (card.type === 'weather') return card.size ?? 2
  if (card.type === 'server') return card.size ?? 4
  if (card.type === 'media')  return card.size ?? 4
  return card.size && card.size > 1 ? card.size : undefined
}

function SkeletonCard() {
  return (
    <div className="card-glass rounded-md p-5 flex flex-col gap-3">
      <div className="shimmer h-2.5 w-20 rounded-sm" />
      <div className="shimmer h-7 w-14 rounded-sm mt-2" />
    </div>
  )
}

const gridStyle = (cols: number) => ({
  gridTemplateColumns: `repeat(${cols}, minmax(200px, 1fr))`,
  gridAutoRows: 'minmax(120px, auto)',
  gap: '16px',
  alignItems: 'start' as const,
})

export function PageGrid() {
  const config = useHAStore((s) => s.config)
  const activePage = useHAStore((s) => s.activePage)
  const connectionStatus = useHAStore((s) => s.connectionStatus)

  if (!config) return null

  const page = config.dashboard.pages[activePage]
  if (!page) return null

  const cols = page.columns ?? 3
  const isLoading = connectionStatus === 'connecting' || connectionStatus === 'idle'

  return (
    <div className="p-6 md:p-8">
      <div className="mb-5">
        <h2
          className="font-heading"
          style={{ color: '#1a1714', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}
        >
          {page.name}
        </h2>
        <div style={{ width: '24px', height: '3px', background: '#f5a623', borderRadius: '2px', marginTop: '6px' }} />
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div key="skeleton" style={gridStyle(cols)} className="grid">
            {page.cards.map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            key={`page-${activePage}`}
            variants={container}
            initial="hidden"
            animate="show"
            style={gridStyle(cols)}
            className="grid"
          >
            {page.cards.map((card, i) => {
              const span = cardSpan(card)
              const inner = renderCard(card)
              const wrapped =
                card.type === 'car' || card.type === 'energy' ||
                card.type === 'server' || card.type === 'media'
                  ? inner
                  : <CardWrapper entityId={card.entity}>{inner}</CardWrapper>

              return (
                <motion.div
                  key={`${card.type}-${i}`}
                  variants={item}
                  className="h-full"
                  style={span ? { gridColumn: `span ${span}` } : undefined}
                >
                  {wrapped}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
