import React, { useState, useMemo } from 'react'
import type { GameState } from '../sim/types'
import { explainRun, type RunExplanation } from '../sim/explainRun'
import { STRATEGIES, type StrategyProfile } from '../data/strategyScenarios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import ShadowAdvisoryPanel from './ShadowAdvisoryPanel'
import type { CalibratedShadowAudit } from '../ai/shadowAuditCalibration'
import { useLang } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

interface Props { state: GameState }

const STAGE_T: Record<string, TranslationKey> = {
  planning: 'planningW', engineering: 'engineeringW', validation: 'validationW',
  audit: 'auditW', delivery: 'deliveryW',
}

export default function DebuggerPanel({ state }: Props) {
  const { t } = useLang()
  const [seed, setSeed] = useState(42)
  const [horizon, setHorizon] = useState(60)
  const [strategyId, setStrategyId] = useState('balanced')

  const explanation = useMemo(() => {
    const profile = STRATEGIES[strategyId]
    if (!profile) return null
    return explainRun(seed, horizon, profile)
  }, [seed, horizon, strategyId])

  return (
    <div>
      <div className="panel">
        <h2>{t('scenarioDebugger')}</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>{t('seed')}</label>
            <input type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value) || 0)}
              style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 13, width: 80 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>{t('horizon')}</label>
            <input type="number" value={horizon} onChange={(e) => setHorizon(Number(e.target.value) || 1)}
              style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 13, width: 70 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>{t('strategy')}</label>
            <select value={strategyId} onChange={(e) => setStrategyId(e.target.value)}
              style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 13 }}>
              {Object.values(STRATEGIES).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {explanation && (<>
        <div className="metrics-bar">
          <div className="metric"><span className="label">{t('outcome')}</span>
            <span className={`value ${explanation.gameOver ? 'bad' : 'good'}`}>{explanation.gameOver ? t('gameOver') : t('gameOverActive')}</span></div>
          <div className="metric"><span className="label">{t('cash')}</span>
            <span className={`value ${explanation.cashEnd < 0 ? 'bad' : explanation.cashEnd < 20000 ? 'warn' : 'good'}`}>${explanation.cashEnd.toLocaleString()}</span></div>
          <div className="metric"><span className="label">{t('reputation')}</span>
            <span className={`value ${explanation.reputationEnd < 30 ? 'bad' : explanation.reputationEnd < 60 ? 'warn' : 'good'}`}>{explanation.reputationEnd.toFixed(1)}</span></div>
          <div className="metric"><span className="label">{t('evidence')}</span>
            <span className={`value ${explanation.evidenceIntegrityEnd < 30 ? 'bad' : explanation.evidenceIntegrityEnd < 60 ? 'warn' : 'good'}`}>{explanation.evidenceIntegrityEnd}</span></div>
          <div className="metric"><span className="label">{t('orders')}</span>
            <span className="value">{explanation.ordersCompleted}</span></div>
        </div>

        {explanation.gameOver && (
          <div className="panel" style={{ borderColor: 'var(--red)' }}>
            <h2 style={{ color: 'var(--red)' }}>{t('gameOver')}</h2>
            <p style={{ color: 'var(--text)' }}>{explanation.gameOverReason}</p>
          </div>
        )}

        <div className="grid-2col">
          <div className="panel"><h2>{t('cashBreakdown')}</h2><CashBreakdownTable exp={explanation} /></div>
          <div className="panel"><h2>{t('bottlenecks')}</h2><BottleneckView exp={explanation} /></div>
        </div>

        <div className="grid-2col">
          <div className="panel">
            <h2>{t('topNegativeEvents')} ({explanation.topNegativeEvents.length})</h2>
            <div className="scrollable" style={{ maxHeight: 300 }}>
              {explanation.topNegativeEvents.slice(0, 15).map((e, i) => <NegativeEventCard key={i} event={e} />)}
              {explanation.topNegativeEvents.length === 0 && <div style={{ color: 'var(--text-dim)', padding: 12, textAlign: 'center' }}>{t('noNegativeEvents')}</div>}
            </div>
          </div>
          <div className="panel">
            <h2>{t('criticalArtifacts')} ({explanation.criticalArtifacts.length})</h2>
            <div className="scrollable" style={{ maxHeight: 300 }}>
              {explanation.criticalArtifacts.map((a) => <CriticalArtifactCard key={a.id} artifact={a} />)}
              {explanation.criticalArtifacts.length === 0 && <div style={{ color: 'var(--text-dim)', padding: 12, textAlign: 'center' }}>{t('noCriticalArtifacts')}</div>}
            </div>
          </div>
        </div>

        <div className="panel"><h2>{t('trustTimeline')}</h2><TrustTimeline exp={explanation} /></div>

        <div className="panel">
          <h2>{t('eventSummary')}</h2>
          <div className="grid-3col">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('evidenceDrops')}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: explanation.evidenceDrops.length > 0 ? 'var(--red)' : 'var(--green)' }}>{explanation.evidenceDrops.length}</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('reputationPenalties')}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: explanation.reputationPenalties.length > 0 ? 'var(--orange)' : 'var(--green)' }}>{explanation.reputationPenalties.length}</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{t('totalLedgerEvents')}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-bright)' }}>{explanation.totalLedgerEvents}</div>
            </div>
          </div>
        </div>

        <ShadowAdvisorySample />
      </>)}
    </div>
  )
}

function CashBreakdownTable({ exp }: { exp: RunExplanation }) {
  const { t } = useLang()
  const { cashBreakdown: cb } = exp
  const rows = [
    { label: t('salaries'), value: cb.totalSalaries, color: 'var(--red)' },
    { label: t('maintenance'), value: cb.totalMaintenance, color: 'var(--orange)' },
    { label: t('parallelRoutes'), value: cb.totalParallelRouteCost, color: 'var(--yellow)' },
    { label: t('upgrades'), value: cb.totalUpgradeCost, color: 'var(--purple)' },
    { label: t('totalCosts'), value: cb.totalCost, color: 'var(--red)' },
    { label: t('revenue'), value: cb.totalRevenue, color: 'var(--green)' },
    { label: t('netPosition'), value: cb.netPosition, color: cb.netPosition >= 0 ? 'var(--green)' : 'var(--red)' },
  ]
  return (
    <table className="data-table">
      <thead><tr><th>{t('category')}</th><th>{t('amount')}</th></tr></thead>
      <tbody>{rows.map((r) => <tr key={r.label}><td>{r.label}</td><td style={{ color: r.color, fontWeight: r.label === t('totalCosts') || r.label === t('netPosition') ? 600 : 400 }}>${r.value.toLocaleString()}</td></tr>)}</tbody>
    </table>
  )
}

function BottleneckView({ exp }: { exp: RunExplanation }) {
  const { t } = useLang()
  const maxTicks = Math.max(...exp.bottlenecks.map((b) => b.totalQueuedTicks), 1)
  return (
    <div>
      {exp.bottlenecks.map((b) => (
        <div key={b.stage} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
            <span style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{t(STAGE_T[b.stage] || b.stage)}</span>
            <span style={{ color: 'var(--text-dim)' }}>{t('maxQueue')}: {b.maxQueueDepth} | {t('total')}: {b.totalQueuedTicks}</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="fill" style={{ width: `${(b.totalQueuedTicks / maxTicks) * 100}%`, background: b.stage === exp.bottlenecks[0]?.stage ? 'var(--red)' : 'var(--yellow)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function NegativeEventCard({ event }: { event: RunExplanation['topNegativeEvents'][0] }) {
  const severityColor = event.severity === 'high' ? 'var(--red)' : event.severity === 'medium' ? 'var(--orange)' : 'var(--yellow)'
  return (
    <div className="card" style={{ borderLeft: `3px solid ${severityColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-bright)' }}>{event.eventType}</span>
        <span className={`badge badge-${event.severity === 'high' ? 'high' : event.severity === 'medium' ? 'medium' : 'low'}`}>{event.severity}</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Tick {event.tick} · {event.detail}</div>
    </div>
  )
}

function CriticalArtifactCard({ artifact }: { artifact: RunExplanation['criticalArtifacts'][0] }) {
  const { t } = useLang()
  const gapColor = artifact.overclaimGap > 4 ? 'var(--red)' : artifact.overclaimGap > 1 ? 'var(--orange)' : 'var(--text-dim)'
  return (
    <div className="card" style={artifact.overclaimGap > 3 ? { borderLeft: '3px solid var(--red)' } : undefined}>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 2 }}>{artifact.id.split('-').slice(0, 4).join('-')}</div>
      <div style={{ display: 'flex', gap: 12, fontSize: 11, flexWrap: 'wrap' }}>
        <span>{t('quality')}: <span style={{ color: artifact.quality < 4 ? 'var(--red)' : 'var(--green)' }}>{artifact.quality.toFixed(1)}</span></span>
        <span>{t('evidence2')}: {artifact.evidenceStrength.toFixed(1)}</span>
        <span>{t('claim')}: {artifact.claimLevel.toFixed(1)}</span>
        <span>{t('overclaimGap')}: <span style={{ color: gapColor, fontWeight: 600 }}>{artifact.overclaimGap.toFixed(1)}</span></span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 3, fontSize: 10 }}>
        {artifact.validationPassed !== null && (
          <span className={`badge ${artifact.validationPassed ? 'badge-pass' : 'badge-fail'}`}>{t('validation')}: {artifact.validationPassed ? t('pass') : t('fail')}</span>
        )}
        {artifact.auditPassed !== null && (
          <span className={`badge ${artifact.auditPassed ? 'badge-pass' : 'badge-fail'}`}>{t('auditing')}: {artifact.auditPassed ? t('pass') : t('fail')}</span>
        )}
        {artifact.riskLevel && <span className={`badge badge-${artifact.riskLevel}`}>{artifact.riskLevel}</span>}
      </div>
    </div>
  )
}

function TrustTimeline({ exp }: { exp: RunExplanation }) {
  const { t } = useLang()
  const points: Array<{ tick: number; reputation: number; evidence: number }> = []
  let currentRep = 70; let currentEvi = 80
  const allDeltas: Array<{ tick: number; type: 'rep' | 'evi'; delta: number; reason: string }> = [
    ...exp.evidenceDrops.map((d) => ({ tick: d.tick, type: 'evi' as const, delta: d.delta, reason: d.reason })),
    ...exp.reputationPenalties.map((p) => ({ tick: p.tick, type: 'rep' as const, delta: p.delta, reason: p.reason })),
  ].sort((a, b) => a.tick - b.tick)
  points.push({ tick: 0, reputation: 70, evidence: 80 })
  let lastTick = 0
  for (const d of allDeltas) {
    if (d.tick > lastTick + 1 && lastTick > 0) points.push({ tick: lastTick + 1, reputation: currentRep, evidence: currentEvi })
    if (d.type === 'rep') currentRep = Math.max(0, Math.min(100, currentRep + d.delta))
    if (d.type === 'evi') currentEvi = Math.max(0, Math.min(100, currentEvi + d.delta))
    points.push({ tick: d.tick, reputation: currentRep, evidence: currentEvi })
    lastTick = d.tick
  }
  if (lastTick < exp.finalTick) points.push({ tick: exp.finalTick, reputation: Math.round(currentRep * 10) / 10, evidence: Math.round(currentEvi) })
  if (points.length <= 1) return <div style={{ color: 'var(--text-dim)', padding: 12, textAlign: 'center' }}>{t('noTrustChanges')}</div>

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={points} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="tick" stroke="var(--text-dim)" fontSize={11} />
        <YAxis domain={[0, 100]} stroke="var(--text-dim)" fontSize={11} />
        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }} />
        <Legend />
        <Line type="stepAfter" dataKey="reputation" stroke="var(--accent-bright)" name={t('reputation')} strokeWidth={2} dot={false} />
        <Line type="stepAfter" dataKey="evidence" stroke="var(--green)" name={t('evidence')} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

const SAMPLE_OVERCLAIM_ADVISORY: CalibratedShadowAudit = {
  advisoryLevel: 'critical', primaryIssue: 'overclaim', secondaryIssues: ['evidence_gap', 'quality'],
  shouldBlockDelivery: false, shouldRequestHumanReview: true, falsePositiveRisk: 'low',
  explanation: 'Shadow audit: The artifact significantly overclaims its capabilities. Advisory: critical, primary=overclaim. Also flagged: evidence_gap, quality. Recommendation: human review suggested.',
  modelConfidence: 8, callSucceeded: true, model: 'qwen2.5-coder:14b',
}
const SAMPLE_CLEAN_ADVISORY: CalibratedShadowAudit = {
  advisoryLevel: 'info', primaryIssue: 'clean', secondaryIssues: [],
  shouldBlockDelivery: false, shouldRequestHumanReview: false, falsePositiveRisk: 'low',
  explanation: 'Shadow audit: The artifact meets the criteria with strong evidence. Advisory: info, primary=clean.',
  modelConfidence: 9, callSucceeded: true, model: 'qwen2.5-coder:14b',
}

function ShadowAdvisorySample() {
  const { t } = useLang()
  const [showSample, setShowSample] = useState(false)
  const [sampleType, setSampleType] = useState<'overclaim' | 'clean'>('overclaim')
  const sample = sampleType === 'overclaim' ? SAMPLE_OVERCLAIM_ADVISORY : SAMPLE_CLEAN_ADVISORY
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <button className="small" onClick={() => setShowSample(!showSample)}>
          {showSample ? t('hideShadowSample') : t('showShadowSample')}
        </button>
        {showSample && (
          <select value={sampleType} onChange={(e) => setSampleType(e.target.value as 'overclaim' | 'clean')}
            style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', fontSize: 11 }}>
            <option value="overclaim">{t('overclaimSample')}</option>
            <option value="clean">{t('cleanSample')}</option>
          </select>
        )}
      </div>
      {showSample && <ShadowAdvisoryPanel advisory={sample} />}
    </div>
  )
}
