import React, { useState, useMemo } from 'react'
import type { GameState } from '../sim/types'
import {
  getAgentWorkStatusSummary,
  type AgentStatusCard,
  type AgentWorkStatusSummary,
  type WorkshopQueueStatus,
} from '../game/agentStatusSelectors'

interface Props {
  state: GameState
}

const STATUS_COLORS: Record<string, string> = {
  working: 'var(--accent-bright)',
  idle: 'var(--green)',
  fatigued: 'var(--orange)',
  blocked: 'var(--red)',
}

export default function AgentWorkStatusFloat({ state }: Props) {
  const [expanded, setExpanded] = useState(false)
  const summary = useMemo(() => getAgentWorkStatusSummary(state), [state])

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 50,
        maxWidth: expanded ? 380 : 240,
        fontFamily: 'inherit',
      }}
    >
      {/* Collapsed bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: expanded ? '8px 8px 0 0' : 8,
          padding: '8px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11 }}>
          <span style={{ fontWeight: 600, color: 'var(--text-bright)' }}>
            AI Workers
          </span>
          <span style={{ color: 'var(--accent-bright)' }}>
            {summary.workingAgents} working
          </span>
          <span style={{ color: 'var(--green)' }}>
            · {summary.idleAgents} idle
          </span>
          {summary.blockedAgents > 0 && (
            <span style={{ color: 'var(--red)' }}>
              · {summary.blockedAgents} blocked
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: 10,
            color: 'var(--text-dim)',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        >
          ▲
        </span>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            maxHeight: '65vh',
            overflowY: 'auto',
            padding: '0 12px 12px',
            fontSize: 11,
          }}
        >
          {/* Overview */}
          <Section title="Overview">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2px 12px',
              }}
            >
              <KV label="Tick" value={summary.tick} />
              <KV label="Fatigue avg" value={summary.averageFatigue.toFixed(1)} />
              <KV label="Active tasks" value={summary.activeTasks} />
              <KV label="Queued tasks" value={summary.queuedTasks} />
              <KV label="Bottleneck" value={summary.bottleneckStage ?? 'none'} />
              <KV label="Total agents" value={summary.totalAgents} />
            </div>
          </Section>

          {/* Agents */}
          <Section title={`Agents (${summary.totalAgents})`}>
            {summary.agents.map((agent) => (
              <AgentCard key={agent.agentId} agent={agent} />
            ))}
          </Section>

          {/* Workshop Queues */}
          <Section title="Workshops">
            {summary.workshopQueues.map((wq) => (
              <WorkshopQueueRow key={wq.workshopId} wq={wq} />
            ))}
          </Section>

          {/* Recent Events */}
          <Section title={`Recent Events (${summary.recentEvents.length})`}>
            {summary.recentEvents.slice(0, 8).map((e, i) => (
              <div
                key={`${e.tick}-${i}`}
                style={{
                  padding: '2px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  fontFamily: 'monospace',
                  fontSize: 10,
                }}
              >
                <span style={{ color: 'var(--text-dim)' }}>T{e.tick}</span>{' '}
                <span style={{ color: 'var(--accent)' }}>{e.eventType}</span>{' '}
                <span style={{ color: 'var(--text-dim)' }}>{e.targetId.split('-').slice(0, 3).join('-')}</span>
              </div>
            ))}
          </Section>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Sub-components
// ============================================================

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 4,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 2,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function KV({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-dim)' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function AgentCard({ agent }: { agent: AgentStatusCard }) {
  const color = STATUS_COLORS[agent.status] || 'var(--text-dim)'

  return (
    <div
      style={{
        padding: '4px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: 'var(--text-bright)', fontWeight: 500 }}>
          {agent.name}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color,
          }}
        >
          {agent.status.toUpperCase()}
        </span>
      </div>

      {agent.currentTaskId && (
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>
          {agent.taskStage} ·{' '}
          {agent.currentOrderId?.split('-').slice(0, 3).join('-')}
          {agent.remainingWork !== null && (
            <span> · {Math.round(agent.remainingWork)} left</span>
          )}
        </div>
      )}

      {agent.status === 'fatigued' && (
        <div style={{ fontSize: 10, color: 'var(--orange)', marginTop: 1 }}>
          Fatigue: {agent.fatigue.toFixed(1)}/10
        </div>
      )}

      {agent.status === 'blocked' && (
        <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 1 }}>
          Task missing or handoff broken
        </div>
      )}
    </div>
  )
}

function WorkshopQueueRow({ wq }: { wq: WorkshopQueueStatus }) {
  const load = wq.capacity > 0 ? (wq.activeCount + wq.queuedCount) / wq.capacity : 0
  const loadColor =
    load >= 1 ? 'var(--red)' : load >= 0.7 ? 'var(--yellow)' : 'var(--green)'

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2px 0',
        fontSize: 10,
      }}
    >
      <span style={{ color: 'var(--text)', textTransform: 'capitalize', minWidth: 80 }}>
        {wq.stage}
      </span>
      <span style={{ color: 'var(--text-dim)', minWidth: 80, textAlign: 'right' }}>
        {wq.activeCount} active / {wq.queuedCount} queued
      </span>
      <div
        style={{
          width: 50,
          height: 4,
          background: 'var(--bg)',
          borderRadius: 2,
          marginLeft: 6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, load * 100)}%`,
            height: '100%',
            borderRadius: 2,
            background: loadColor,
          }}
        />
      </div>
    </div>
  )
}
