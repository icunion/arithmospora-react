import React from 'react'

import {
  useSources,
  useStat,
  useProportionStat
} from './index'

const source = 'le2024'
const sourceOptions = {
  only: {
    'other:totalvotes': true,
    'proportion:total': true
  }
}

const TestComponent = () => {
  // Ensure stats source connected.
  useSources([source], sourceOptions)

  // Gets data from redux state.
  const totalVotes = useStat(
    source,
    'other',
    'totalvotes',
    (stat) => stat.data.totalvotes
  )
  const totalVoters = useProportionStat(source, 'total')

  return (
    <div>
      <div>{totalVotes ? 'data received' : ''}</div>
      <div>{totalVotes && totalVotes == 60820 ? 'icu-production data received' : ''}</div>
      <div>
        <div className="label">turnout</div>
        <div className="data" data-testid="turnout">{totalVoters ? totalVoters.percentage.toFixed(2) : '...'}</div>
      </div>
      <div>
        <div className="label">votes cast</div>
        <div className="data" data-testid="votes">{totalVotes ? totalVotes.toFixed(0) : '...'}</div>
      </div>
      <div>
        <div className="label">voters</div>
        <div className="data" data-testid="voters">{totalVoters ? totalVoters.current.toFixed(0) : '...'}</div>
      </div>
    </div>
  )
}

export default TestComponent
