import React from 'react'
import type { GameState, Artifact } from '../sim/types'
import { scoreArtifact } from '../sim/artifacts'

interface Props {
  state: GameState
}

export default function ArtifactPanel({ state }: Props) {
  const artifacts = Object.values(state.artifacts).sort(
    (a, b) => b.createdAtTick - a.createdAtTick
  )

  return (
    <div>
      <div className="panel">
        <h2>Artifacts ({artifacts.length})</h2>

        {artifacts.length === 0 && (
          <div style={{ color: 'var(--text-dim)', padding: 16, textAlign: 'center' }}>
            No artifacts yet. Assign agents to tasks to generate artifacts.
          </div>
        )}

        <div className="scrollable" style={{ maxHeight: 500 }}>
          {artifacts.map((a) => (
            <ArtifactRow key={a.id} artifact={a} state={state} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ArtifactRow({
  artifact,
  state,
}: {
  artifact: Artifact
  state: GameState
}) {
  const score = scoreArtifact(artifact)
  const overclaimGap = Math.max(
    0,
    artifact.claimLevel - artifact.evidenceStrength
  )

  const scoreColor =
    score >= 7 ? 'var(--green)' : score >= 4 ? 'var(--yellow)' : 'var(--red)'

  const qualityColor =
    artifact.quality >= 7
      ? 'var(--green)'
      : artifact.quality >= 4
      ? 'var(--yellow)'
      : 'var(--red)'

  const order = state.orders[artifact.orderId]

  return (
    <div
      className="card"
      style={
        artifact.validationPassed === false
          ? { borderLeft: '3px solid var(--red)' }
          : artifact.auditPassed === false
          ? { borderLeft: '3px solid var(--orange)' }
          : artifact.validationPassed === true && artifact.auditPassed === true
          ? { borderLeft: '3px solid var(--green)' }
          : undefined
      }
    >
      <div className="card-header">
        <div>
          <span className={`badge badge-${artifact.kind}`}>
            {artifact.kind}
          </span>{' '}
          <span style={{ fontSize: 11, color: 'var(--text)' }}>
            {artifact.id}
          </span>
          {artifact.routeId && (
            <span
              className="badge"
              style={{
                background: 'var(--purple)',
                color: '#fff',
                marginLeft: 4,
              }}
            >
              {artifact.routeId.split('-').pop()}
            </span>
          )}
        </div>
        <div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: scoreColor,
              marginRight: 12,
            }}
          >
            {score.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="card-body">
        {order && (
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>
            Order: {order.title}
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11 }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Quality: </span>
            <span style={{ color: qualityColor, fontWeight: 600 }}>
              {artifact.quality.toFixed(1)}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Evidence: </span>
            <span>{artifact.evidenceStrength.toFixed(1)}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Claim: </span>
            <span>{artifact.claimLevel.toFixed(1)}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Defects: </span>
            <span
              style={{
                color:
                  artifact.defectCount <= 1
                    ? 'var(--green)'
                    : artifact.defectCount <= 3
                    ? 'var(--yellow)'
                    : 'var(--red)',
              }}
            >
              {artifact.defectCount}
            </span>
          </div>
          {overclaimGap > 0.5 && (
            <div>
              <span style={{ color: 'var(--red)' }}>
                Overclaim Gap: {overclaimGap.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Validation & Audit status */}
        <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11 }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Validation: </span>
            {artifact.validationPassed === null ? (
              <span style={{ color: 'var(--text-dim)' }}>Pending</span>
            ) : artifact.validationPassed ? (
              <span className="badge badge-pass">PASS</span>
            ) : (
              <span className="badge badge-fail">
                FAIL ({artifact.validationScore})
              </span>
            )}
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Audit: </span>
            {artifact.auditPassed === null ? (
              <span style={{ color: 'var(--text-dim)' }}>Pending</span>
            ) : artifact.auditPassed ? (
              <span className="badge badge-pass">PASS</span>
            ) : (
              <span
                className={`badge badge-${
                  artifact.auditResult?.riskLevel ?? 'medium'
                }`}
              >
                FAIL ({artifact.auditResult?.riskLevel ?? '?'})
              </span>
            )}
          </div>
        </div>

        {/* Audit details */}
        {artifact.auditResult && !artifact.auditPassed && (
          <div
            style={{
              marginTop: 4,
              fontSize: 10,
              color: 'var(--orange)',
            }}
          >
            {artifact.auditResult.reason}
          </div>
        )}

        {/* Created by */}
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
          By: {artifact.createdByAgentIds.map((id) => state.agents[id]?.name ?? id).join(', ')}{' '}
          · Tick {artifact.createdAtTick}
        </div>
      </div>
    </div>
  )
}
