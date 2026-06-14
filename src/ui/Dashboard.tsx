import React from 'react'
import type { GameState } from '../sim/types'
import { computeFinalScore } from '../sim/scoring'
import {
  getActiveOrderCount,
  getWorkingAgents,
  getQueuedTasks,
} from '../game/selectors'

interface Props {
  state: GameState
}

export default function Dashboard({ state }: Props) {
  const m = state.metrics
  const activeOrders = getActiveOrderCount(state)
  const workingAgents = getWorkingAgents(state)
  const queuedTasks = getQueuedTasks(state)
  const totalAgents = Object.keys(state.agents).length
  const totalOrders = Object.keys(state.orders).length

  const cashClass =
    state.cash < 0 ? 'bad' : state.cash < 2000 ? 'warn' : 'good'
  const repClass =
    state.reputation < 30 ? 'bad' : state.reputation < 60 ? 'warn' : 'good'
  const eviClass =
    state.evidenceIntegrity < 30
      ? 'bad'
      : state.evidenceIntegrity < 60
      ? 'warn'
      : 'good'

  return (
    <div>
      {/* Key Metrics */}
      <div className="metrics-bar">
        <div className="metric">
          <span className="label">Cash</span>
          <span className={`value ${cashClass}`}>${state.cash}</span>
        </div>
        <div className="metric">
          <span className="label">Reputation</span>
          <span className={`value ${repClass}`}>{Math.round(state.reputation)}</span>
        </div>
        <div className="metric">
          <span className="label">Evidence</span>
          <span className={`value ${eviClass}`}>
            {Math.round(state.evidenceIntegrity)}
          </span>
        </div>
        <div className="metric">
          <span className="label">Tick</span>
          <span className="value">{state.tick}</span>
        </div>
        <div className="metric">
          <span className="label">Score</span>
          <span className="value">{computeFinalScore(state)}</span>
        </div>
      </div>

      <div className="grid-2col">
        {/* Orders Summary */}
        <div className="panel">
          <h2>Orders</h2>
          <div className="grid-3col" style={{ marginBottom: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-bright)' }}>
                {m.totalOrdersCompleted}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Completed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--yellow)' }}>
                {activeOrders}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Active</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--red)' }}>
                {m.totalOrdersFailed}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Failed</div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            Total orders in system: {totalOrders}
          </div>
        </div>

        {/* Agents Summary */}
        <div className="panel">
          <h2>AI Agents</h2>
          <div className="grid-3col" style={{ marginBottom: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>
                {totalAgents - workingAgents.length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Idle</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-bright)' }}>
                {workingAgents.length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Working</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>
                {Math.round(m.agentUtilization * 100)}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Utilization</div>
            </div>
          </div>
        </div>

        {/* Quality & Rework */}
        <div className="panel">
          <h2>Quality</h2>
          <div style={{ marginBottom: 8 }}>
            <div className="skill-row">
              <span className="skill-label">Avg Quality</span>
              <div className="skill-bar">
                <div
                  className="skill-fill"
                  style={{
                    width: `${(m.averageQuality / 10) * 100}%`,
                    background:
                      m.averageQuality >= 7
                        ? 'var(--green)'
                        : m.averageQuality >= 4
                        ? 'var(--yellow)'
                        : 'var(--red)',
                  }}
                />
              </div>
              <span className="skill-value">{m.averageQuality.toFixed(1)}</span>
            </div>
            <div className="skill-row">
              <span className="skill-label">Rework Rate</span>
              <div className="skill-bar">
                <div
                  className="skill-fill"
                  style={{
                    width: `${m.reworkRate * 100}%`,
                    background:
                      m.reworkRate < 0.2
                        ? 'var(--green)'
                        : m.reworkRate < 0.5
                        ? 'var(--yellow)'
                        : 'var(--red)',
                  }}
                />
              </div>
              <span className="skill-value">
                {Math.round(m.reworkRate * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Risks */}
        <div className="panel">
          <h2>Risks</h2>
          <div style={{ marginBottom: 8 }}>
            <div className="skill-row">
              <span className="skill-label">Major Incidents</span>
              <span
                className="skill-value"
                style={{
                  color:
                    m.majorIncidents <= 2
                      ? 'var(--green)'
                      : m.majorIncidents <= 5
                      ? 'var(--yellow)'
                      : 'var(--red)',
                }}
              >
                {m.majorIncidents}
              </span>
            </div>
            <div className="skill-row">
              <span className="skill-label">Queued Tasks</span>
              <span
                className="skill-value"
                style={{
                  color:
                    queuedTasks.length < 5
                      ? 'var(--green)'
                      : queuedTasks.length < 10
                      ? 'var(--yellow)'
                      : 'var(--red)',
                }}
              >
                {queuedTasks.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="panel">
        <h2>Financial Summary</h2>
        <div className="grid-3col">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Revenue</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)' }}>
              ${m.totalRevenue}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Costs</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--red)' }}>
              ${m.totalCost}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Net</div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color:
                  m.totalRevenue - m.totalCost >= 0
                    ? 'var(--green)'
                    : 'var(--red)',
              }}
            >
              ${m.totalRevenue - m.totalCost}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
