import React from 'react'
import type { GameState, Artifact } from '../sim/types'
import { scoreArtifact } from '../sim/artifacts'
import { useLang } from '../i18n/LanguageContext'

interface Props { state: GameState }

export default function ArtifactPanel({ state }: Props) {
  const { t } = useLang()
  const artifacts = Object.values(state.artifacts).sort((a, b) => b.createdAtTick - a.createdAtTick)
  return (
    <div>
      <div className="panel">
        <h2>{t('artifacts')} ({artifacts.length})</h2>
        {artifacts.length === 0 && (
          <div style={{ color: 'var(--text-dim)', padding: 16, textAlign: 'center' }}>{t('noArtifacts')}</div>
        )}
        <div className="scrollable" style={{ maxHeight: 500 }}>
          {artifacts.map((a) => <ArtifactRow key={a.id} artifact={a} state={state} />)}
        </div>
      </div>
    </div>
  )
}

function ArtifactRow({ artifact, state }: { artifact: Artifact; state: GameState }) {
  const { t } = useLang()
  const score = scoreArtifact(artifact)
  const overclaimGap = Math.max(0, artifact.claimLevel - artifact.evidenceStrength)
  const scoreColor = score >= 7 ? 'var(--green)' : score >= 4 ? 'var(--yellow)' : 'var(--red)'
  const qualityColor = artifact.quality >= 7 ? 'var(--green)' : artifact.quality >= 4 ? 'var(--yellow)' : 'var(--red)'
  const order = state.orders[artifact.orderId]

  return (
    <div className="card" style={artifact.validationPassed === false ? { borderLeft: '3px solid var(--red)' } : artifact.auditPassed === false ? { borderLeft: '3px solid var(--orange)' } : artifact.validationPassed === true && artifact.auditPassed === true ? { borderLeft: '3px solid var(--green)' } : undefined}>
      <div className="card-header">
        <div>
          <span className={`badge badge-${artifact.kind}`}>{artifact.kind}</span>{' '}
          <span style={{ fontSize: 11, color: 'var(--text)' }}>{artifact.id}</span>
          {artifact.routeId && <span className="badge" style={{ background: 'var(--purple)', color: '#fff', marginLeft: 4 }}>{artifact.routeId.split('-').pop()}</span>}
        </div>
        <div><span style={{ fontSize: 16, fontWeight: 700, color: scoreColor, marginRight: 12 }}>{score.toFixed(1)}</span></div>
      </div>
      <div className="card-body">
        {order && <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>{t('orders')}: {order.title}</div>}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11 }}>
          <div><span style={{ color: 'var(--text-dim)' }}>{t('quality')}: </span><span style={{ color: qualityColor, fontWeight: 600 }}>{artifact.quality.toFixed(1)}</span></div>
          <div><span style={{ color: 'var(--text-dim)' }}>{t('evidence2')}: </span><span>{artifact.evidenceStrength.toFixed(1)}</span></div>
          <div><span style={{ color: 'var(--text-dim)' }}>{t('claim')}: </span><span>{artifact.claimLevel.toFixed(1)}</span></div>
          <div><span style={{ color: 'var(--text-dim)' }}>{t('defects')}: </span><span style={{ color: artifact.defectCount <= 1 ? 'var(--green)' : artifact.defectCount <= 3 ? 'var(--yellow)' : 'var(--red)' }}>{artifact.defectCount}</span></div>
          {overclaimGap > 0.5 && <div><span style={{ color: 'var(--red)' }}>{t('overclaimGap')}: {overclaimGap.toFixed(1)}</span></div>}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11 }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>{t('validation')}: </span>
            {artifact.validationPassed === null ? <span style={{ color: 'var(--text-dim)' }}>{t('pending')}</span> : artifact.validationPassed ? <span className="badge badge-pass">{t('pass')}</span> : <span className="badge badge-fail">{t('fail')} ({artifact.validationScore})</span>}
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>{t('auditing')}: </span>
            {artifact.auditPassed === null ? <span style={{ color: 'var(--text-dim)' }}>{t('pending')}</span> : artifact.auditPassed ? <span className="badge badge-pass">{t('pass')}</span> : <span className={`badge badge-${artifact.auditResult?.riskLevel ?? 'medium'}`}>{t('fail')} ({artifact.auditResult?.riskLevel ?? '?'})</span>}
          </div>
        </div>
        {artifact.auditResult && !artifact.auditPassed && <div style={{ marginTop: 4, fontSize: 10, color: 'var(--orange)' }}>{artifact.auditResult.reason}</div>}
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{t('by')}: {artifact.createdByAgentIds.map((id) => state.agents[id]?.name ?? id).join(', ')} · Tick {artifact.createdAtTick}</div>
      </div>
    </div>
  )
}
