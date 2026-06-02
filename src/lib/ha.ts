import {
  createConnection,
  createLongLivedTokenAuth,
  subscribeEntities,
  callService,
  type HassEntities,
  type Connection,
} from 'home-assistant-js-websocket'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

let connection: Connection | null = null
let unsubEntities: (() => void) | null = null

export interface HAServiceInterface {
  connect(
    url: string,
    token: string,
    onEntities: (entities: HassEntities) => void,
    onStatus: (status: ConnectionStatus) => void,
  ): Promise<void>
  disconnect(): void
  toggleLight(entityId: string): Promise<void>
  setBrightness(entityId: string, brightness: number): Promise<void>
  toggleSwitch(entityId: string): Promise<void>
  callScript(entityId: string): Promise<void>
}

/**
 * Fetch yesterday's peak value for a cumulative sensor that resets at midnight.
 * Uses the existing WebSocket connection (no CORS issues) via the
 * history/history_during_period command. Looks back 26 hours, detects the
 * midnight reset (large value drop), and returns the max before the reset
 * — which equals the previous day's accumulated total.
 */
export async function fetchYesterdayPeak(entityId: string): Promise<number | null> {
  if (!connection) return null

  const end = new Date()
  const start = new Date(end.getTime() - 26 * 60 * 60 * 1000)

  try {
    const result = await connection.sendMessagePromise<Record<string, Array<{ s: string }>>>({
      type: 'history/history_during_period',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      entity_ids: [entityId],
      minimal_response: true,
      no_attributes: true,
    })

    const series = result?.[entityId]
    if (!series?.length) return null

    const values = series.map((item) => parseFloat(item.s)).filter((v) => !isNaN(v) && v >= 0)
    if (values.length < 2) return null

    // Find the largest single-step drop — that's the midnight reset.
    // Using largest-drop instead of a fixed % handles cases like gas where the
    // sensor resets from 0.49 → 0.33 (standing charge carries over, only ~33% drop).
    let resetIdx = -1
    let maxDrop = 0
    for (let i = 1; i < values.length; i++) {
      const drop = values[i - 1] - values[i]
      if (drop > maxDrop) { maxDrop = drop; resetIdx = i }
    }

    // Require a meaningful drop (>= 0.05 units) to avoid false positives from corrections
    if (resetIdx === -1 || maxDrop < 0.05) return null
    return Math.max(...values.slice(0, resetIdx))
  } catch {
    return null
  }
}

import type { ForecastSlot } from '@/config/types'

/**
 * Subscribe to weather forecast via the HA WebSocket subscription API
 * (weather/subscribe_forecast — the correct API since HA 2024.1).
 * Returns a Promise that resolves to an unsubscribe function, or null if not connected.
 * The callback fires immediately with the current forecast, then on every update.
 */
export function subscribeWeatherForecast(
  entityId: string,
  forecastType: 'daily' | 'hourly',
  callback: (forecast: ForecastSlot[]) => void,
): Promise<() => void> | null {
  if (!connection) return null
  return connection.subscribeMessage(
    (msg: { forecast?: ForecastSlot[] }) => {
      if (msg?.forecast) callback(msg.forecast)
    },
    {
      type: 'weather/subscribe_forecast',
      entity_id: entityId,
      forecast_type: forecastType,
    },
  )
}

export const haService: HAServiceInterface = {
  async connect(url, token, onEntities, onStatus) {
    onStatus('connecting')
    try {
      const httpsUrl = url.replace(/^wss?:\/\//, (m) =>
        m.startsWith('wss') ? 'https://' : 'http://'
      )
      const auth = createLongLivedTokenAuth(httpsUrl, token)
      connection = await createConnection({ auth })

      connection.addEventListener('disconnected', () => onStatus('disconnected'))
      connection.addEventListener('ready', () => onStatus('connected'))

      unsubEntities = subscribeEntities(connection, (entities) => {
        onEntities(entities)
        onStatus('connected')
      })
    } catch (e) {
      onStatus('error')
      throw e
    }
  },

  disconnect() {
    unsubEntities?.()
    unsubEntities = null
    connection?.close()
    connection = null
  },

  async toggleLight(entityId) {
    if (!connection) return
    await callService(connection, 'light', 'toggle', {}, { entity_id: entityId })
  },

  async setBrightness(entityId, brightness) {
    if (!connection) return
    await callService(
      connection,
      'light',
      'turn_on',
      { brightness: Math.round(brightness) },
      { entity_id: entityId },
    )
  },

  async toggleSwitch(entityId) {
    if (!connection) return
    await callService(connection, 'switch', 'toggle', {}, { entity_id: entityId })
  },

  async callScript(entityId) {
    if (!connection) return
    await callService(connection, 'script', 'turn_on', {}, { entity_id: entityId })
  },
}
