import { arithmosporaReducer } from './slice'
import { configureStore, Action, ConfigureStoreOptions, EnhancedStore } from '@reduxjs/toolkit'

/**
 * We keep a reference to the store here to allow us to access it
 * independently, i.e. in our socket event dispatcher.
 */
let store: EnhancedStore

/**
 * Wrapper for configureStore which adds in our reducer and allows us to keep
 * a reference to the created store object.
 * @param {Object} args - The data structure to pass to configureStore.
 * @returns {Object} - The newly created Redux store.
 */
const configureArithmosporaStore = (args: ConfigureStoreOptions) => {
  let { reducer = {}, middleware, devTools } = args
  if (typeof reducer !== 'function') {
    reducer.stats = arithmosporaReducer
  }
  if (!middleware) {
    middleware = (getDefaultMiddleware: Function) =>
      getDefaultMiddleware({
        serializableCheck: false
      })
  }
  if (!devTools) {
    // Devtools optimisation: don't include large time bucket objects in
    // devTools actions. See
    // https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/Troubleshooting.md#excessive-use-of-memory-and-cpu
    devTools = {
      actionSanitizer: <A extends Action>(action: A & { payload: any} | A): A => {
        if (action.type === 'arithmospora/stats' && 'payload' in action && action.payload.args[0] === 'timed') {
          return {
            ...action,
            payload: {
              ...action.payload,
              payload: {
                ...action.payload.payload,
                dataPoints: {
                  60: {
                    name: '60',
                    data: '<<TIME BUCKETS OBJECT>>',
                    dataPoints: {}
                  },
                  300: {
                    name: '60',
                    data: '<<TIME BUCKETS OBJECT>>',
                    dataPoints: {}
                  },
                  3600: {
                    name: '60',
                    data: '<<TIME BUCKETS OBJECT>>',
                    dataPoints: {}
                  }
                }
              }
            }
          }
        }
        return action;
      }
    }
  }
  store = configureStore({ ...args, reducer, middleware, devTools })
  return store
}

export { store }
export default configureArithmosporaStore
