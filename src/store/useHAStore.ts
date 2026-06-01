import { create } from 'zustand'
import type { HassEntities } from 'home-assistant-js-websocket'
import type { AppConfig } from '@/config/types'
import type { ConnectionStatus } from '@/lib/ha'

interface HAState {
  config: AppConfig | null
  configError: string | null
  configLoading: boolean
  connectionStatus: ConnectionStatus
  entities: HassEntities
  activePage: number

  setConfig: (config: AppConfig) => void
  setConfigError: (error: string) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setEntities: (entities: HassEntities) => void
  setActivePage: (index: number) => void
}

export const useHAStore = create<HAState>((set) => ({
  config: null,
  configError: null,
  configLoading: true,
  connectionStatus: 'idle',
  entities: {},
  activePage: 0,

  setConfig: (config) => set({ config, configLoading: false }),
  setConfigError: (error) => set({ configError: error, configLoading: false }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setEntities: (entities) => set({ entities }),
  setActivePage: (index) => set({ activePage: index }),
}))
