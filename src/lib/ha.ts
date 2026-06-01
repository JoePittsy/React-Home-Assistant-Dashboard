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
}
