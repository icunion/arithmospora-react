import { ArithmosporaState } from './interfaces'
import { createSlice, freeze, PayloadAction } from '@reduxjs/toolkit'

const initialArithmosporaState: ArithmosporaState = {
  sources: {},
  sourceOptions: {},
  lastMilestone: {
    source: null,
    milestone: null,
    isNew: false
  }
}

const defaultOptions = {
  enableByDefault: true,
  enabled: {},
  disabled: {}
}

const arithmosporaSlice = createSlice({
  name: 'arithmospora',
  initialState: initialArithmosporaState,
  reducers: {
    addSource: (state, action: PayloadAction<any>) => {
      if (!(action.payload.statsSource in state.sources)) {
        state.sources[action.payload.statsSource] = { connected: false }
        state.sourceOptions[action.payload.statsSource] = Object.assign(
          {},
          defaultOptions
        )
        if ('options' in action.payload) {
          if ('only' in action.payload.options) {
            state.sourceOptions[
              action.payload.statsSource
            ].enableByDefault = false
            state.sourceOptions[action.payload.statsSource].enabled =
              Object.assign({}, action.payload.options.only)
          } else if ('except' in action.payload.options) {
            state.sourceOptions[action.payload.statsSource].disabled =
              Object.assign({}, action.payload.options.except)
          }
        }
      }
    },
    available: (state, action: PayloadAction<any>) => {
      for (const group in action.payload.payload) {
        if (!(group in state.sources[action.payload.source])) {
          state.sources[action.payload.source][group] = {}
        }
        action.payload.payload[group].forEach((stat: string) => {
          if (!(stat in state.sources[action.payload.source][group])) {
            state.sources[action.payload.source][group][stat] = {}
          }
        })
      }
    },
    connected: (state, action: PayloadAction<any>) => {
      state.sources[action.payload.source].connected = true
    },
    disconnected: (state, action: PayloadAction<any>) => {
      state.sources[action.payload.source].connected = false
    },
    milestone: (state, action: PayloadAction<any>) => {
      state.lastMilestone.source = action.payload.source
      state.lastMilestone.milestone = action.payload.payload
      state.lastMilestone.isNew = true
    },
    milestoneCompleted: (state) => {
      state.lastMilestone.isNew = false
    },
    stats: (state, action: PayloadAction<any>) => {
      const [group, ...statFragments] = action.payload.args
      const stat = statFragments.join(':')
      const groupStat = `${group}:${stat}`
      if (
        groupStat in state.sourceOptions[action.payload.source].enabled ||
        (state.sourceOptions[action.payload.source].enableByDefault &&
          !(groupStat in state.sourceOptions[action.payload.source].disabled))
      ) {
        // Pre-emptively freeze the received payload to let Immer know this
        // entire section of the state object has been changed and allow it
        // to add it to the final object tree faster.
        freeze(action.payload.payload)
        state.sources[action.payload.source][group][stat] =
          action.payload.payload
      }
    },
    updateEnabled: (state, action: PayloadAction<any>) => {
      // If empty options are supplied, we restore options to the default,
      // i.e. enable all stats in the source.
      // Otherwise, we respect the existing options but ensure any stats
      // specified in the 'only' object are enabled.
      if (Object.keys(action.payload.options).length === 0) {
        state.sourceOptions[action.payload.statsSource] = Object.assign(
          {},
          defaultOptions
        )
      } else if ('only' in action.payload.options) {
        state.sourceOptions[action.payload.statsSource].enabled = Object.assign(
          state.sourceOptions[action.payload.statsSource].enabled,
          action.payload.options.only
        )
      }
    },
    default: (state) => state
  }
})

export const arithmosporaActions = arithmosporaSlice.actions
export const arithmosporaReducer = arithmosporaSlice.reducer
export default arithmosporaReducer
