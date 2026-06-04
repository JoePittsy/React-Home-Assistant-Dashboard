export interface HAConfig {
  url: string
  token: string
}

interface BaseCard {
  entity: string
  name?: string
  icon?: string
  size?: number
}

export interface LightCardConfig extends BaseCard {
  type: 'light'
  show_brightness?: boolean
}

export interface SwitchCardConfig extends BaseCard {
  type: 'switch'
}

export interface SensorCardConfig extends BaseCard {
  type: 'sensor'
  unit?: string
  decimals?: number
}

export interface BinarySensorCardConfig extends BaseCard {
  type: 'binary_sensor'
  device_class?: string
}

export interface PersonCardConfig extends BaseCard {
  type: 'person'
  travel_time?: string
  battery?: string
}

export interface LightGroupMember {
  entity: string
  name: string
}

export interface LightGroupCardConfig extends BaseCard {
  type: 'light_group'
  members: LightGroupMember[]
}

export interface CarEntityMap {
  soc?: string
  range?: string
  charging?: string
  charge_current?: string
  charge_target?: string
  charge_power?: string
  location?: string
  locked?: string
  odometer?: string
  cabin_temp?: string
  outside_temp?: string
  twelve_volt?: string
}

export interface CarCardConfig {
  type: 'car'
  name?: string
  size?: number
  entities: CarEntityMap
}

export interface WeatherCardConfig extends BaseCard {
  type: 'weather'
  show_forecast?: boolean
}

export interface ForecastSlot {
  datetime: string
  condition: string
  temperature: number
  templow?: number
  precipitation_probability?: number
  wind_speed?: number | string
}

export interface EnergyEntityMap {
  power_now?: string
  cost_today?: string
  usage_today?: string
  unit_rate?: string
  off_peak?: string
}

export interface EnergyCardConfig {
  type: 'energy'
  name?: string
  size?: number
  entities: EnergyEntityMap
}

export interface ServerEntityMap {
  cpu?: string
  memory?: string
  disk?: string
  temperature?: string
  containers?: string
  download?: string
  upload?: string
  jellyfin_sessions?: string
  movies?: string
  shows?: string
}

export interface ServerCardConfig {
  type: 'server'
  name?: string
  size?: number
  entities: ServerEntityMap
}

export interface ScriptCardConfig extends BaseCard {
  type: 'script'
}

export interface MediaEntityMap {
  active_sessions?: string
  unwatched_movies?: string
  unwatched_episodes?: string
  movies?: string
  shows?: string
  radarr_queue?: string
  sonarr_queue?: string
  disk_tv?: string
  disk_movies?: string
}

export interface MediaCardConfig {
  type: 'media'
  name?: string
  size?: number
  entities: MediaEntityMap
}

export interface EnergyChartCardConfig {
  type: 'energy_chart'
  name?: string
  size?: number
  entity: string
  days?: number
  unit?: string
}

export type CardConfig =
  | LightCardConfig
  | SwitchCardConfig
  | SensorCardConfig
  | BinarySensorCardConfig
  | PersonCardConfig
  | LightGroupCardConfig
  | CarCardConfig
  | WeatherCardConfig
  | EnergyCardConfig
  | ServerCardConfig
  | ScriptCardConfig
  | MediaCardConfig
  | EnergyChartCardConfig

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
