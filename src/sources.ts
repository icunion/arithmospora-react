import { arithmosporaActions } from './slice'
import { store } from './store'
import { Config, ConfigSet } from './interfaces'
import configsDefault from './configs-default'

interface Sockets {
  [key: string]: {
    socket: WebSocket | null,
    interval: any | null,
    shutdown: boolean
  }
}

interface ArithmosporaMessage {
  event: string,
  payload: any,
}

/**
 * Object to hold our arithmospora configs.
 */
let configs: ConfigSet = configsDefault

/**
 * Variable for the arithmospora config being used. Defaults to 'icu-dev'.
 */
let selectedConfigName: string = 'icu-dev'

/**
 * Object to hold our stats source WebSocket instances.
 * @type {Object.<string, {socket: WebSocket, interval: interval}>}
 */
let sockets: Sockets = {}

/**
 * Selects the named arithmospora config to use. If no matching name is
 * present in the config set, the default 'icu-dev' config is used.
 * @param {string} configName - Name of the config to select.
 */
export const selectConfig = (configName: string) => {
  const resolvedConfigName = (configName in configs) ? configName : 'icu-dev'
  if (resolvedConfigName != selectedConfigName)
  {
    selectedConfigName = resolvedConfigName
    reconnect()
  }
}

/**
 * Add a configuration to the config set.
 * @param {string} configName - Name of the config to add.
 * @param {Config} config - The configuration object.
 */
export const addConfig = (configName: string, config: Config) => {
  if (configName in configs) {
    throw "Cannot override existing config."
  }
  configs[configName] = config
}

/**
 * Connect a set of stats sources, ensuring the state object is prepared for
 * each source. We only connect a source if it doesn't already exist in state,
 * which allows us to call this from our components every time they render
 * and ensure we only actually connect the sockets once for each source.
 * An options object can be passed to enable or disable specific named stats.
 * If no options object is passed, all stats will be enabled by default.
 * Note that enable/disable mechanism steers towards enabling: explicit
 * disabling is only ever done on the first call, and later calls will only
 * ever enable some or all stats.
 * @param {string[]} statsSources - Array of stats source names corresponding
 *     to sources defined in config.
 * @param {Object} [options={}] - Options object.
 * @param {Object.<string, *>} options.only - Only enable stats specified by
 *     provided keys. e.g. {only: { 'other:totalvotes': true}}.
 * @param {Object.<string, *>} options.exclude - Disable stats specified by
 *     provided keys.
 * @see ../config
 */
export const connectSources = (statsSources: string[] = [], options = {}) => {
  const state = store.getState()
  const config = configs[selectedConfigName]

  for (const statsSource of statsSources) {
    if (!(statsSource in config.sources)) {
      console.log('Source not found in configuration', { statsSource })
      continue
    }
    if (!(statsSource in state.stats.sources)) {
      store.dispatch(arithmosporaActions.addSource({ statsSource, options }))
      connectSource(statsSource)
    } else {
      store.dispatch(
        arithmosporaActions.updateEnabled({ statsSource, options })
      )
    }
  }
}

/**
 * Connects a websocket for the named stats source, ensuring the socket gets
 * reconnected automatically if it becomes disconnected. Sets up an event
 * listener on the websocket to forward arithmospora events to the reducer.
 * @param {string} statsSource - The name of the stats source to connect.
 */
const connectSource = (statsSource: string) => {
  const config = configs[selectedConfigName]
  const sourceConf = config.sources[statsSource]

  if (!(statsSource in sockets)) {
    sockets[statsSource] = { socket: null, interval: null, shutdown: false }
  }

  // If the socket has been marked for shutdown don't try to connect it.
  if (sockets[statsSource].shutdown) {
    return
  }

  sockets[statsSource].socket = new WebSocket(
    `${config.arithmosporaUrl}/${sourceConf.path}`
  )

  // Attempt to reconnect on disconnect after a short delay
  sockets[statsSource].socket.onopen = (event) => {
    if (sockets[statsSource].interval) {
      clearInterval(sockets[statsSource].interval)
      sockets[statsSource].interval = null
    }
    store.dispatch(arithmosporaActions.connected({ source: statsSource }))
  }
  sockets[statsSource].socket.onclose = (event) => {
    store.dispatch(arithmosporaActions.disconnected({ source: statsSource }))
    sockets[statsSource].socket = null
    if (!sockets[statsSource].shutdown && !sockets[statsSource].interval) {
      sockets[statsSource].interval = setInterval(() => {
        if (!sockets[statsSource].socket) {
          connectSource(statsSource)
        }
      }, 5000)
    }
  }

  // Handle messages for this source
  sockets[statsSource].socket.onmessage = (event) => {
    const message: ArithmosporaMessage = JSON.parse(event.data)
    if (window
        && 'arithmospora' in window
        && typeof window.arithmospora == 'object'
        && window.arithmospora
        && 'debug' in window.arithmospora
        && window.arithmospora.debug) {
      console.log({ debug: 'Stats message received', statsSource, ...message })
    }
    const [messageEvent, ...messageArgs] = message.event.split(':')
    if (messageEvent in arithmosporaActions)
    {
      store.dispatch(
        arithmosporaActions[messageEvent as keyof typeof arithmosporaActions]({
          source: statsSource,
          args: messageArgs,
          payload: message.payload
        })
      )
    }
  }
}

/**
 * Disconnect all sources.
 */
export const disconnect = () => {
  for (const statsSource in sockets) {
    sockets[statsSource].shutdown = true
    sockets[statsSource].socket?.close()
  }
}

/**
 * Reconnect all sources.
 */
export const reconnect = () => {
  disconnect()
  for (const statsSource in sockets) {
    sockets[statsSource].shutdown = false
    connectSource(statsSource)
  }
}

export default connectSources
