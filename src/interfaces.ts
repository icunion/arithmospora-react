export interface Source {
  connected: boolean,
  [key: string]: any | {
    [key:string]: any
  }
}

export interface SourceOptions {
  enableByDefault: boolean,
  enabled: {
    [key: string]: boolean
  },
  disabled: {
    [key: string]: boolean
  },
}

export interface Milestone {
  source: string | null,
  milestone: string | null,
  isNew: boolean,
}

export interface ArithmosporaState {
  sources: {
    [key: string]: Source,
  },
  sourceOptions: {
    [key: string]: SourceOptions,
  }
  lastMilestone: Milestone,
}

export interface Stat {
  [key: string]: any,
  dataPoints?: {
    [key: string | number]: any
  },
}

export interface ProportionStat extends Stat {
  current: number,
  total: number,
  proportion: number,
  percentage: number,
  dataPoints?: {
    [key: string]: ProportionStat,
  }
}

export interface RollingStat extends ProportionStat {
  peak: number,
  peakProportion: number,
  peakPercentage: number,
  dataPoints?: {
    [key: string]: RollingStat,
  }
}

export interface Config {
  arithmosporaUrl: string,
  sources: {
    [key: string]: {
      path: string
    }
  }
}

export interface ConfigSet {
  [key: string]: Config,
}
