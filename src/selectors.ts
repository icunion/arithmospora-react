import { ProportionStat, RollingStat, Stat } from "./interfaces"
import { createSelector } from "@reduxjs/toolkit"

const checkStatExists = (state: any, source: string, group: string, stat: string) => {
  return (
    state &&
    'stats' in state &&
    source in state.stats.sources &&
    group in state.stats.sources[source] &&
    stat in state.stats.sources[source][group] &&
    Object.keys(state.stats.sources[source][group][stat]).length !== 0
  )
}

export const arithmosporaSelector = (
  state: any,
  source: string,
  group: string,
  stat: string,
  statSelector = (stat: any) => stat
) => {
  if (checkStatExists(state, source, group, stat)) {
    return statSelector(state.stats.sources[source][group][stat])
  } else {
    return undefined
  }
}

const makeProportionStat = (stateStat: any): ProportionStat => {
  let proportionStat = { ...stateStat.data, dataPoints: {} }
  if ('dataPoints' in stateStat && Object.keys(stateStat.dataPoints).length !== 0) {
    for (const dpKey in stateStat.dataPoints) {
      proportionStat.dataPoints[dpKey] = makeProportionStat(
        stateStat.dataPoints[dpKey]
      )
    }
  }
  return proportionStat
}

const makeRollingStat = (stateStat: any): RollingStat => {
  let proportionStat = { ...stateStat.data, dataPoints: {} }
  if ('dataPoints' in stateStat && Object.keys(stateStat.dataPoints).length !== 0) {
    for (const dpKey in stateStat.dataPoints) {
      proportionStat.dataPoints[dpKey] = makeRollingStat(
        stateStat.dataPoints[dpKey]
      )
    }
  }
  return proportionStat
}

export const proportionStatSelector = (
  state: any,
  source: string,
  stat: string,
  statSelector = (stat: ProportionStat) => stat
) => {
  if (checkStatExists(state, source, 'proportion', stat)) {
    return statSelector(
      makeProportionStat(state.stats.sources[source]['proportion'][stat])
    )
  } else {
    return statSelector({
      current: 0,
      total: 0,
      proportion: 0,
      percentage: 0,
      dataPoints: {}
    })
  }
}

export const rollingStatSelector = (
  state: any,
  source: string,
  interval: string,
  stat: string,
  statSelector = (stat: RollingStat) => stat
) => {
  const rollingStat = `${interval}:${stat}`
  if (checkStatExists(state, source, 'rolling', rollingStat)) {
    return statSelector(
      makeRollingStat(state.stats.sources[source]['rolling'][rollingStat])
    )
  } else {
    return statSelector({
      current: 0,
      total: 0,
      proportion: 0,
      percentage: 0,
      peak: 0,
      peakProportion: 0,
      peakPercentage: 0,
      dataPoints: {}
    })
  }
}

export const timedStatSelector = (
  state: any,
  source: string,
  stat: string,
  dataPoint: string | number,
  statSelector = (stat: Stat) => stat
) => {
  if (
    checkStatExists(state, source, 'timed', stat) &&
    dataPoint in state.stats.sources[source]['timed'][stat].dataPoints
  ) {
    return statSelector(state.stats.sources[source]['timed'][stat].dataPoints[dataPoint].data)
  } else {
    return statSelector({})
  }
}

export const milestoneSelector = createSelector(
  (state) => state.stats.lastMilestone,
  (lastMilestone) => lastMilestone
)

export const connectionStatusSelector = createSelector(
  (state) => state.stats.sources,
  (_, source) => source,
  (sources, source) => source in sources ? sources[source].connected : false
)

export const makeStatSelector = (statSelector = (stateStat: Stat) => stateStat) => createSelector(
  (state: any, source: string, group: string, stat: string) => {
    if (checkStatExists(state, source, group, stat)) {
      return state.stats.sources[source][group][stat]
    } else {
      return undefined
    }
  },
  (stateStat) => {
    return stateStat ? statSelector(stateStat) : stateStat
  }
)

const proportionStatDefault = {
  data: {
    current: 0,
    total: 0,
    proportion: 0,
    percentage: 0
  },
  dataPoints: {}
}

export const makeProportionStatSelector = (statSelector = (stateStat: Stat) => stateStat) => createSelector(
  (state: any, source: string, stat: string) => {
    if (checkStatExists(state, source, 'proportion', stat)) {
      return state.stats.sources[source]['proportion'][stat]
    } else {
      return proportionStatDefault
    }
  },
  (stateStat) => {
    return statSelector(
      makeProportionStat(stateStat)
    )
  }
)

const rollingStatDefault = {
  data: {
    current: 0,
    total: 0,
    proportion: 0,
    percentage: 0,
    peakProportion: 0,
    peakPercentage: 0
    },
  dataPoints: {}
}

export const makeRollingStatSelector = (statSelector = (stateStat: Stat) => stateStat) => createSelector(
  (state: any, source: string, interval: string, stat: string) => {
    const rollingStat = `${interval}:${stat}`
    if (['5m', '1h', '6h', '1d'].includes(interval) && checkStatExists(state, source, 'rolling', rollingStat)) {
      return state.stats.sources[source]['rolling'][rollingStat]
    } else if (!['5m', '1h', '6h', '1d'].includes(interval) && checkStatExists(state, source, 'proportion', stat)) {
      return state.stats.sources[source]['proportion'][stat]
    } else {
      return rollingStatDefault
    }
  },
  (stateStat) => {
    return statSelector(
      makeProportionStat(stateStat)
    )
  }
)

const timedStatDefault = {}

export const makeTimedStatSelector = (statSelector = (stateStat: Stat) => stateStat) => createSelector(
  (state: any, source: string, stat: string, dataPoint: string | number) => {
    if (
      checkStatExists(state, source, 'timed', stat) &&
      dataPoint in state.stats.sources[source]['timed'][stat].dataPoints
    ) {
      return state.stats.sources[source]['timed'][stat].dataPoints[dataPoint].data
    } else {
      return timedStatDefault
    }
  },
  (stateStat) => {
    return statSelector(stateStat)
  }
)
