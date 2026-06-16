import React, { useState } from 'react'
import type { GameState } from '../sim/types'
import { useLang } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

interface Props {
  state: GameState
  dismissed: boolean
  onDismiss: () => void
}

interface TutorialStep {
  id: string
  labelKey: TranslationKey
  hintKey: TranslationKey
  check: (state: GameState) => boolean
  needsConfirm?: boolean
}

const STORAGE_KEY = 'agent-foundry-tutorial-dismissed'

export function isTutorialDismissed(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
}

export function dismissTutorial(): void {
  try { localStorage.setItem(STORAGE_KEY, 'true') } catch {}
}

export default function TutorialChecklist({ state, dismissed, onDismiss }: Props) {
  const { t } = useLang()
  const [collapsed, setCollapsed] = useState(false)
  const [hudConfirmed, setHudConfirmed] = useState(false)

  const STEPS: TutorialStep[] = [
    {
      id: 'accept', labelKey: 'acceptFirstOrder', hintKey: 'acceptHint',
      check: (s) => Object.values(s.orders).some((o) => o.status === 'accepted' || o.status === 'in_progress' || o.status === 'delivered'),
    },
    {
      id: 'working', labelKey: 'watchAgent', hintKey: 'watchHint',
      check: (s) => Object.values(s.agents).some((a) => a.status === 'working'),
    },
    {
      id: 'artifact', labelKey: 'artifactStep', hintKey: 'artifactHint',
      check: (s) => Object.keys(s.artifacts).length > 0,
    },
    {
      id: 'validation', labelKey: 'validationStep', hintKey: 'validationHint',
      check: (s) => Object.values(s.artifacts).some((a) => a.validationPassed !== null),
    },
    {
      id: 'audit', labelKey: 'auditStep', hintKey: 'auditHint',
      check: (s) => Object.values(s.artifacts).some((a) => a.auditPassed !== null),
    },
    {
      id: 'deliver', labelKey: 'deliverStep', hintKey: 'deliverHint',
      check: (s) => Object.values(s.orders).some((o) => o.status === 'delivered'),
    },
    {
      id: 'upgrade', labelKey: 'upgradeWorkshopStep', hintKey: 'upgradeHint',
      check: (s) => Object.values(s.workshops).some((w) => w.level >= 2),
    },
    {
      id: 'hud', labelKey: 'hudStep', hintKey: 'hudHint',
      check: () => hudConfirmed,
      needsConfirm: true,
    },
  ]

  if (dismissed) return null

  const gameSteps = STEPS.filter((s) => !s.needsConfirm)
  const confirmSteps = STEPS.filter((s) => s.needsConfirm)
  const completed = STEPS.filter((s) => s.check(state)).length
  const allDone = completed === STEPS.length

  return (
    <div style={{
      position: 'fixed', right: 16, top: 80, zIndex: 50, width: collapsed ? 180 : 280,
      background: 'var(--bg-panel)', border: '1px solid var(--border)',
      borderRadius: 8, padding: collapsed ? '8px 12px' : 14,
      fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      cursor: collapsed ? 'pointer' : 'default',
      transition: 'width 0.2s',
    }} onClick={collapsed ? () => setCollapsed(false) : undefined}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : 10 }}>
        <span style={{ fontWeight: 700, color: 'var(--text-bright)', fontSize: 13 }}>
          {t('firstRun')}
        </span>
        {!collapsed && (
          <span style={{ fontSize: 10, color: 'var(--accent-bright)' }}>{completed}/{STEPS.length}</span>
        )}
        <span
          onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed) }}
          style={{
            marginLeft: 8, cursor: 'pointer', fontSize: 16, lineHeight: 1,
            color: 'var(--accent-bright)', userSelect: 'none',
            background: 'var(--bg-card)', borderRadius: 4,
            padding: '2px 8px', fontWeight: 700,
          }}
          title={collapsed ? '展开教程' : '收起教程'}
        >
          {collapsed ? '＋' : '－'}
        </span>
      </div>

      {collapsed ? (
        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          {completed}/{STEPS.length} · {allDone ? '✓' : '...'}
        </div>
      ) : (
        <>
          <div className="progress-bar" style={{ marginBottom: 10 }}>
            <div className="fill" style={{ width: `${(completed / STEPS.length) * 100}%`, background: allDone ? 'var(--green)' : 'var(--accent)', transition: 'width 0.3s' }} />
          </div>

          {STEPS.map((step) => {
            const done = step.check(state)
            return (
              <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '3px 0', opacity: done ? 0.6 : 1 }}>
                <span style={{ color: done ? 'var(--green)' : 'var(--text-dim)', fontWeight: 600, minWidth: 16, textAlign: 'center' }}>
                  {done ? '✓' : '○'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: done ? 'var(--text-dim)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none' }}>
                    {t(step.labelKey)}
                  </div>
                  {!done && step.needsConfirm && (
                    <button className="primary small" style={{ marginTop: 4 }}
                      onClick={(e) => { e.stopPropagation(); setHudConfirmed(true) }}>
                      确认已查看
                    </button>
                  )}
                  {!done && !step.needsConfirm && (
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>
                      {t(step.hintKey)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          <div style={{ marginTop: 10, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            {allDone && <button className="primary small" onClick={onDismiss}>{t('gotIt')}</button>}
            <button className="small" onClick={onDismiss}>
              {allDone ? '关闭' : t('skipTutorial')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
