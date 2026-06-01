import { motion, AnimatePresence } from 'framer-motion'
import { useHAStore } from '@/store/useHAStore'
import { CardWrapper } from '@/components/cards/CardWrapper'
import { LightCard } from '@/components/cards/LightCard'
import { SwitchCard } from '@/components/cards/SwitchCard'
import { SensorCard } from '@/components/cards/SensorCard'
import { BinarySensorCard } from '@/components/cards/BinarySensorCard'
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
    case 'switch':
      return <SwitchCard config={card} />
    case 'sensor':
      return <SensorCard config={card} />
    case 'binary_sensor':
      return <BinarySensorCard config={card} />
  }
}

function SkeletonCard() {
  return (
    <div className="card-glass rounded-md p-5 flex flex-col gap-3 min-h-[120px]">
      <div className="shimmer h-3 w-24 rounded-sm" />
      <div className="shimmer h-8 w-16 rounded-sm mt-2" />
    </div>
  )
}

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
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold text-foreground tracking-wide">
          {page.name}
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div
            key="skeleton"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(200px, 1fr))`,
              gridAutoRows: '140px',
            }}
            className="grid gap-6"
          >
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
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(200px, 1fr))`,
              gridAutoRows: '140px',
            }}
            className="grid gap-6"
          >
            {page.cards.map((card, i) => (
              <motion.div key={`${card.entity}-${i}`} variants={item} className="h-full">
                <CardWrapper entityId={card.entity}>{renderCard(card)}</CardWrapper>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
