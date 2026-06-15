import React from 'react'
import type { GameState } from '../sim/types'

interface Props {
  state: GameState
  dismissed: boolean
  onDismiss: () => void
}

interface TutorialStep {
  id: string
  label: string
  check: (state: GameState) => boolean
  hint: string
}

const STEPS: TutorialStep[] = [
  {
    id: 'accept',
    label: 'Accept your first order',
    check: (s) =>
      Object.values(s.orders).some((o) => o.status === 'accepted' || o.status === 'in_progress' || o.status === 'delivered'),
    hint: 'Go to the Orders tab and click "Accept" on any available order.',
  },
  {
    id: 'working',
    label: 'Watch agents start working',
    check: (s) =>
      Object.values(s.agents).some((a) => a.status === 'working'),
    hint: 'Check the AI Workers HUD (bottom-right) — agents automatically pick up queued tasks.',
  },
  {
    id: 'artifact',
    label: 'An artifact is produced',
    check: (s) => Object.keys(s.artifacts).length > 0,
    hint: 'Engineering produces artifacts. Watch the Agents or Tasks tab for progress.',
  },
  {
    id: 'validation',
    label: 'Validation runs on the artifact',
    check: (s) =>
      Object.values(s.artifacts).some((a) => a.validationPassed !== null),
    hint: 'Validation checks for defects. The Tasks tab shows validation progress.',
  },
  {
    id: 'audit',
    label: 'Audit reviews the artifact',
    check: (s) =>
      Object.values(s.artifacts).some((a) => a.auditPassed !== null),
    hint: 'Audit catches overclaim and evidence gaps. Skipping audit saves time but increases trust risk.',
  },
  {
    id: 'deliver',
    label: 'Deliver your first order',
    check: (s) =>
      Object.values(s.orders).some((o) => o.status === 'delivered'),
    hint: 'Once the pipeline completes, the order will be delivered automatically, or you can deliver manually from the Orders tab.',
  },
  {
    id: 'hud',
    label: 'Check the Agent HUD',
    check: (_s) => true, // informational — always checked
    hint: 'The floating HUD (bottom-right) shows agent status, workshop queues, and recent events at a glance.',
  },
]

const STORAGE_KEY = 'agent-foundry-tutorial-dismissed'

export function isTutorialDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function dismissTutorial(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // localStorage unavailable
  }
}

export default function TutorialChecklist({ state, dismissed, onDismiss }: Props) {
  if (dismissed) return null

  const completed = STEPS.filter((s) => s.check(state)).length
  const allDone = completed === STEPS.length

  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        top: 80,
        zIndex: 50,
        width: 280,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 14,
        fontSize: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: 'var(--text-bright)',
            fontSize: 13,
          }}
        >
          First Run
        </span>
        <span style={{ fontSize: 10, color: 'var(--accent-bright)' }}>
          {completed}/{STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: 10 }}>
        <div
          className="fill"
          style={{
            width: `${(completed / STEPS.length) * 100}%`,
            background: allDone ? 'var(--green)' : 'var(--accent)',
            transition: 'width 0.3s',
          }}
        />
      </div>

      {/* Steps */}
      {STEPS.map((step) => {
        const done = step.check(state)
        return (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '3px 0',
              opacity: done ? 0.6 : 1,
            }}
          >
            <span
              style={{
                color: done ? 'var(--green)' : 'var(--text-dim)',
                fontWeight: 600,
                minWidth: 16,
                textAlign: 'center',
              }}
            >
              {done ? '✓' : '○'}
            </span>
            <div>
              <div
                style={{
                  color: done ? 'var(--text-dim)' : 'var(--text)',
                  textDecoration: done ? 'line-through' : 'none',
                }}
              >
                {step.label}
              </div>
              {!done && (
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--text-dim)',
                    marginTop: 1,
                  }}
                >
                  {step.hint}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Actions */}
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          gap: 6,
          justifyContent: 'flex-end',
        }}
      >
        {allDone && (
          <button className="primary small" onClick={onDismiss}>
            Got it!
          </button>
        )}
        <button className="small" onClick={onDismiss}>
          {allDone ? 'Close' : 'Skip tutorial'}
        </button>
      </div>
    </div>
  )
}
