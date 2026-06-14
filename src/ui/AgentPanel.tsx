import React from 'react'
import type { GameState, Agent } from '../sim/types'

interface Props {
  state: GameState
}

export default function AgentPanel({ state }: Props) {
  const agents = Object.values(state.agents)

  return (
    <div>
      <div className="grid-3col">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  const statusColor =
    agent.status === 'working'
      ? 'var(--accent-bright)'
      : agent.status === 'fatigued'
      ? 'var(--red)'
      : 'var(--green)'

  const fatigueColor =
    agent.fatigue >= 7
      ? 'var(--red)'
      : agent.fatigue >= 4
      ? 'var(--yellow)'
      : 'var(--green)'

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, border: 'none', padding: 0, fontSize: 13 }}>
          {agent.name}
        </h2>
        <span
          className="badge"
          style={{
            background: statusColor,
            color: '#fff',
          }}
        >
          {agent.status}
        </span>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
        {agent.role} · ${agent.salaryPerTick}/tick
      </div>

      {/* Specializations */}
      <div style={{ marginTop: 4, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {agent.specialization.map((s) => (
          <span key={s} className={`badge badge-${s}`}>
            {s}
          </span>
        ))}
      </div>

      {/* Skill bars */}
      <div style={{ marginTop: 8 }}>
        <SkillBar label="Planning" value={agent.planning} />
        <SkillBar label="Coding" value={agent.coding} />
        <SkillBar label="Validation" value={agent.validation} />
        <SkillBar label="Auditing" value={agent.auditing} />
        <SkillBar label="Creativity" value={agent.creativity} />
        <SkillBar label="Reliability" value={agent.reliability} />
        <SkillBar label="Speed" value={agent.speed} />
      </div>

      {/* Risk indicators */}
      <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 11 }}>
        <div>
          <span style={{ color: 'var(--text-dim)' }}>Overclaim: </span>
          <span
            style={{
              color:
                agent.overclaimRisk >= 6
                  ? 'var(--red)'
                  : agent.overclaimRisk >= 3
                  ? 'var(--yellow)'
                  : 'var(--green)',
            }}
          >
            {agent.overclaimRisk}/10
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)' }}>Fatigue: </span>
          <span style={{ color: fatigueColor }}>
            {agent.fatigue.toFixed(1)}/10
          </span>
        </div>
      </div>

      {/* Fatigue bar */}
      <div className="progress-bar" style={{ marginTop: 4 }}>
        <div
          className="fill"
          style={{
            width: `${(agent.fatigue / 10) * 100}%`,
            background: fatigueColor,
          }}
        />
      </div>

      {agent.currentTaskId && (
        <div
          style={{
            marginTop: 6,
            fontSize: 10,
            color: 'var(--accent)',
          }}
        >
          Task: {agent.currentTaskId.split('-').slice(0, 4).join('-')}
        </div>
      )}
    </div>
  )
}

function SkillBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 7 ? 'var(--green)' : value >= 4 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div className="skill-row">
      <span className="skill-label">{label}</span>
      <div className="skill-bar">
        <div
          className="skill-fill"
          style={{ width: `${(value / 10) * 100}%`, background: color }}
        />
      </div>
      <span className="skill-value">{value}</span>
    </div>
  )
}
