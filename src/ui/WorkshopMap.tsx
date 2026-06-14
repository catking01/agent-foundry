import React from 'react'
import type { GameState } from '../sim/types'
import { getWorkshopLoad, getTasksByStage } from '../game/selectors'

interface Props {
  state: GameState
}

export default function WorkshopMap({ state }: Props) {
  const workshops = Object.values(state.workshops)

  return (
    <div>
      <div className="grid-2col">
        {workshops.map((ws) => {
          const load = getWorkshopLoad(state, ws.id)
          const tasks = getTasksByStage(state, ws.stage)
          const loadPct = load.capacity > 0 ? load.current / load.capacity : 0
          const loadColor =
            loadPct >= 1 ? 'var(--red)' : loadPct >= 0.7 ? 'var(--yellow)' : 'var(--green)'

          return (
            <div key={ws.id} className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, border: 'none', padding: 0 }}>{ws.name}</h2>
                <span className="badge" style={{ background: 'var(--accent)', color: '#fff' }}>
                  Lv.{ws.level}
                </span>
              </div>

              {/* Load indicator */}
              <div style={{ margin: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                  <span style={{ color: 'var(--text-dim)' }}>Load</span>
                  <span style={{ color: loadColor }}>
                    {load.current} / {load.capacity}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="fill"
                    style={{
                      width: `${Math.min(100, loadPct * 100)}%`,
                      background: loadColor,
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 16, fontSize: 11, marginTop: 6 }}>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Efficiency: </span>
                  <span>{(ws.efficiencyBonus * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Maintenance: </span>
                  <span>${ws.maintenanceCost}/t</span>
                </div>
              </div>

              {/* Tasks in this workshop */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>
                  Tasks: {tasks.length} ({tasks.filter(t => t.status === 'in_progress').length} active,{' '}
                  {tasks.filter(t => t.status === 'queued').length} queued)
                </div>
                {tasks.filter(t => t.status === 'in_progress').slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    style={{
                      fontSize: 10,
                      color: 'var(--accent)',
                      padding: '2px 0',
                    }}
                  >
                    {task.id.split('-').slice(0, 3).join('-')} —{' '}
                    <span style={{ color: 'var(--text-dim)' }}>
                      {task.assignedAgentIds.length} agent(s)
                    </span>
                  </div>
                ))}
              </div>

              {/* Upgrade button */}
              <div style={{ marginTop: 10 }}>
                <button
                  className="small"
                  disabled={state.cash < ws.upgradeCost}
                  onClick={() => {
                    // upgrade handled via dispatch — but WorkshopMap is read-only
                  }}
                >
                  Upgrade (${ws.upgradeCost})
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
