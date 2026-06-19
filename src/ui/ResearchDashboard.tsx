import React from 'react'
import {
  G27_ORG_STUDY_SUMMARY,
  G28_INTERVENTION_SUMMARY,
  ORG_STUDY_NON_CLAIMS,
  ORG_STUDY_RISK_SEMANTICS,
  type InterventionDeltaSummary,
} from '../data/orgStudySummaries'

export default function ResearchDashboard() {
  const rankingRows = [
    ['Best quality intervention', G28_INTERVENTION_SUMMARY.ranking.bestQualityIntervention],
    ['Best risk reduction intervention', G28_INTERVENTION_SUMMARY.ranking.bestRiskReductionIntervention],
    ['Best coordination efficiency intervention', G28_INTERVENTION_SUMMARY.ranking.bestCoordinationEfficiencyIntervention],
    ['Fastest intervention', G28_INTERVENTION_SUMMARY.ranking.fastestIntervention],
    ['Best risk-adjusted quality intervention', G28_INTERVENTION_SUMMARY.ranking.bestRiskAdjustedQualityIntervention],
  ]

  return (
    <div>
      <div className="metrics-bar">
        <div className="metric">
          <span className="label">Study mode</span>
          <span className="value">Read-only</span>
        </div>
        <div className="metric">
          <span className="label">G27 runs</span>
          <span className="value">{G27_ORG_STUDY_SUMMARY.runCount}</span>
        </div>
        <div className="metric">
          <span className="label">G28 runs</span>
          <span className="value">{G28_INTERVENTION_SUMMARY.runCount}</span>
        </div>
        <div className="metric">
          <span className="label">Evidence</span>
          <span className="value good">sealed</span>
        </div>
      </div>

      <div className="panel">
        <h2>Deterministic study results</h2>
        <p style={{ color: 'var(--text)', marginBottom: 8 }}>
          G27 and G28 summarize deterministic organization research runs. This view imports local static summaries only.
        </p>
        <div className="grid-2col">
          <StudyShapeCard
            title={G27_ORG_STUDY_SUMMARY.title}
            shape={G27_ORG_STUDY_SUMMARY.matrixShape}
            commit={G27_ORG_STUDY_SUMMARY.sourceCommit.slice(0, 7)}
          />
          <StudyShapeCard
            title={G28_INTERVENTION_SUMMARY.title}
            shape={G28_INTERVENTION_SUMMARY.matrixShape}
            commit={G28_INTERVENTION_SUMMARY.sourceCommit.slice(0, 7)}
          />
        </div>
      </div>

      <div className="grid-2col">
        <div className="panel">
          <h2>G27 Flat vs Hierarchy</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Quality</th>
                <th>Evidence</th>
                <th>Latent Risk</th>
                <th>Coord Cost</th>
                <th>Ticks</th>
              </tr>
            </thead>
            <tbody>
              {[G27_ORG_STUDY_SUMMARY.flat, G27_ORG_STUDY_SUMMARY.hierarchical].map((row) => (
                <tr key={row.mode}>
                  <td>{row.mode}</td>
                  <td>{row.meanQuality.toFixed(2)}</td>
                  <td>{row.meanEvidenceStrength.toFixed(2)}</td>
                  <td>{row.meanLatentRisk.toFixed(2)}</td>
                  <td>{row.meanCoordinationCost.toFixed(2)}</td>
                  <td>{row.meanDeliveryTicks.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <h2>G28 Intervention Ranking</h2>
          <div className="scrollable" style={{ maxHeight: 260 }}>
            {rankingRows.map(([label, value]) => (
              <div className="card" key={label}>
                <div className="card-header">
                  <div>
                    <div className="card-title">{label}</div>
                    <div className="card-subtitle">144-run deterministic matrix</div>
                  </div>
                  <span className="badge badge-pass">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Delta metrics</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Intervention</th>
              <th>Delta Quality</th>
              <th>Delta Evidence</th>
              <th>Delta Latent Risk</th>
              <th>Delta Coordination Cost</th>
              <th>Delta Delivery Ticks</th>
              <th>Delta Risk-Adjusted Quality</th>
            </tr>
          </thead>
          <tbody>
            {G28_INTERVENTION_SUMMARY.interventions.map((item) => (
              <InterventionRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2col">
        <div className="panel">
          <h2>Order complexity breakdown</h2>
          <div className="grid-3col">
            {G28_INTERVENTION_SUMMARY.complexityHighlights.map((item) => (
              <div className="card" key={`${item.orderClass}-${item.interventionId}`}>
                <div className="card-title">{item.orderClass}</div>
                <div className="card-subtitle">{item.interventionId}</div>
                <div className="card-body" style={{ marginTop: 6 }}>
                  <MetricLine label="Delta Quality" value={item.deltaQuality} />
                  <MetricLine label="Delta Latent Risk" value={item.deltaLatentRisk} />
                  <MetricLine label="Delta Coord Cost" value={item.deltaCoordinationCost} />
                  <MetricLine label="Delta RAQ" value={item.deltaRiskAdjustedQuality} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <RiskSemanticsPanel />
      </div>

      <div className="panel">
        <h2>Non-claims</h2>
        <div className="grid-3col">
          {ORG_STUDY_NON_CLAIMS.map((claim) => (
            <div className="card" key={claim}>
              <span className="badge badge-medium">boundary</span>
              <div style={{ marginTop: 6 }}>{claim}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function RiskSemanticsPanel() {
  return (
    <div className="panel">
      <h2>Risk semantics</h2>
      <div className="card" style={{ borderLeft: '3px solid var(--yellow)' }}>
        <div className="card-title">Do not read detections as actual risk</div>
        <div className="card-body" style={{ marginTop: 6 }}>
          <p>{ORG_STUDY_RISK_SEMANTICS.detectedFindings}</p>
          <p style={{ marginTop: 6 }}>Latent risk is the preferred risk-outcome metric for comparison.</p>
          <p style={{ marginTop: 6 }}>{ORG_STUDY_RISK_SEMANTICS.evidenceIntegrity}</p>
        </div>
      </div>
    </div>
  )
}

function StudyShapeCard({ title, shape, commit }: { title: string; shape: string; commit: string }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-subtitle">{shape}</div>
      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-dim)' }}>source commit: {commit}</div>
    </div>
  )
}

function InterventionRow({ item }: { item: InterventionDeltaSummary }) {
  return (
    <tr>
      <td>{item.id}</td>
      <td>{formatSigned(item.deltaQuality)}</td>
      <td>{formatSigned(item.deltaEvidenceStrength)}</td>
      <td>{formatSigned(item.deltaLatentRisk)}</td>
      <td>{formatSigned(item.deltaCoordinationCost)}</td>
      <td>{formatSigned(item.deltaDeliveryTicks)}</td>
      <td>{formatSigned(item.deltaRiskAdjustedQuality)}</td>
    </tr>
  )
}

function MetricLine({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11 }}>
      <span style={{ color: 'var(--text-dim)' }}>{label}</span>
      <span style={{ color: value >= 0 ? 'var(--green)' : 'var(--orange)', fontVariantNumeric: 'tabular-nums' }}>
        {formatSigned(value)}
      </span>
    </div>
  )
}

function formatSigned(value: number): string {
  if (value > 0) return `+${value.toFixed(2)}`
  return value.toFixed(2)
}
