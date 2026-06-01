export interface HAConfig {
  url: string
  token: string
}

export interface LightCardConfig {
  type: 'light'
  entity: string
  name?: string
  show_brightness?: boolean
}

export interface SwitchCardConfig {
  type: 'switch'
  entity: string
  name?: string
  icon?: string
}

export interface SensorCardConfig {
  type: 'sensor'
  entity: string
  name?: string
  unit?: string
  icon?: string
  decimals?: number
}

export interface BinarySensorCardConfig {
  type: 'binary_sensor'
  entity: string
  name?: string
  icon?: string
  device_class?: string
}

export type CardConfig =
  | LightCardConfig
  | SwitchCardConfig
  | SensorCardConfig
  | BinarySensorCardConfig

export interface PageConfig {
  name: string
  icon?: string
  columns?: number
  cards: CardConfig[]
}

export interface DashboardConfig {
  title: string
  pages: PageConfig[]
}

export interface AppConfig {
  ha: HAConfig
  dashboard: DashboardConfig
}
