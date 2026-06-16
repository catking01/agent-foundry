import React from 'react'
import type { GameState, PlayerAction, Task } from '../sim/types'
import { getAgentsForStage } from '../game/selectors'
import { useLang } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

interface Props { state: GameState; onDispatch: (action: PlayerAction) => void }

const STAGE_KEYS: Record<string, TranslationKey> = {
  planning: 'planning', engineering: 'coding', validation: 'validation',
  audit: 'auditing', delivery: 'deliveryW',
}

export default function TaskBoard({ state, onDispatch }: Props) {
  const { t } = useLang()
  const stages: Task['stage'][] = ['planning', 'engineering', 'validation', 'audit', 'delivery']

  return (
    <div>
      {stages.map((stage) => {
        const tasks = Object.values(state.tasks).filter((t) => t.stage === stage)
        if (tasks.length === 0) return null
        const availableAgents = getAgentsForStage(state, stage)
        return (
          <div key={stage} className="panel">
            <h2>
              {t(STAGE_KEYS[stage])} ({tasks.length} {t('tasks')})
              <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>
                {availableAgents.length} {t('agentsAvailable')}
              </span>
            </h2>
            <div className="scrollable" style={{ maxHeight: 250 }}>
              {tasks.sort((a, b) => b.createdAtTick - a.createdAtTick).map((task) => (
                <TaskRow key={task.id} task={task} state={state} stage={stage} availableAgents={availableAgents} onDispatch={onDispatch} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TaskRow({ task, state, stage, availableAgents, onDispatch }: {
  task: Task; state: GameState; stage: Task['stage']
  availableAgents: ReturnType<typeof getAgentsForStage>
  onDispatch: (action: PlayerAction) => void
}) {
  const { t } = useLang()
  const statusBadge = task.status === 'completed' ? 'badge-pass' : task.status === 'in_progress' ? 'badge-medium' : task.status === 'failed' ? 'badge-fail' : 'badge-low'
  const totalWork = task.complexity * (stage === 'planning' ? 50 : stage === 'delivery' ? 10 : 25)
  const progress = task.remainingWork > 0 ? 1 - task.remainingWork / (totalWork || 1) : 1
  const progressColor = task.status === 'completed' ? 'var(--green)' : task.status === 'in_progress' ? 'var(--accent)' : 'var(--border)'
  const assignedAgents = task.assignedAgentIds.map((id) => state.agents[id]).filter(Boolean)

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{task.id.split('-').slice(0, 4).join('-')}</span>
          {task.routeId && <span className="badge" style={{ background: 'var(--purple)', color: '#fff', marginLeft: 6 }}>{task.routeId.split('-').pop()}</span>}
        </div>
        <span className={`badge ${statusBadge}`}>{t(task.status === 'completed' ? 'completedStatus' : task.status === 'in_progress' ? 'in_progress' : task.status === 'failed' ? 'failed' : 'queued')}</span>
      </div>
      <div className="progress-bar"><div className="fill" style={{ width: `${progress * 100}%`, background: progressColor }} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
        <span>{t('remaining')}: {Math.round(task.remainingWork)} | {t('complexity')}:{task.complexity} {t('ambiguity')}:{task.ambiguity}</span>
        <span>{assignedAgents.length > 0 ? assignedAgents.map((a) => a?.name).join(', ') : t('noAgents')}</span>
      </div>
      {task.status === 'queued' && availableAgents.length > 0 && (
        <div className="card-actions">
          {availableAgents.slice(0, 3).map((agent) => (
            <button key={agent.id} className="small" onClick={() => onDispatch({ type: 'ASSIGN_AGENT', taskId: task.id, agentId: agent.id, workshopId: `workshop-${stage}`, tick: state.tick })}>
              {t('assign')} {agent.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
