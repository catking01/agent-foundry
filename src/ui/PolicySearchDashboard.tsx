import React from 'react'
import {
  G30_POLICY_SEARCH_SUMMARY,
  G30_OBJECTIVE_RANKINGS,
  G30_PARETO_FRONTIER,
  G30_DOMINATED_POLICY_IDS,
  G30_DOMINANCE_PAIRS,
  G30_COMPLEXITY_BREAKDOWN,
  G30_POLICY_COMPACT_DETAILS,
  G30_SCORING_POLICY,
  G30_POLICY_RISK_SEMANTICS,
  G30_POLICY_NON_CLAIMS,
  type ParetoFrontierEntry,
  type PolicyComplexityBreakdownEntry,
} from '../data/policySearchSummaries'

const OBJECTIVE_LABELS: Record<string, string> = {
  speed: 'Speed',
  quality: 'Quality',
  risk_reduction: 'Risk Reduction',
  coordination_efficiency: 'Coordination Efficiency',
  balanced: 'Balanced',
}

export default function PolicySearchDashboard() {
  return (
    <div>
      <div className="metrics-bar">
        <div className="metric">
          <span className="label">Study mode</span>
          <span className="value">Read-only</span>
        </div>
        <div className="metric">
          <span className="label">G30 runs</span>
          <span className="value">{G30_POLICY_SEARCH_SUMMARY.runCount}</span>
        </div>
        <div className="metric">
          <span className="label">Policies</span>
          <span className="value">{G30_POLICY_SEARCH_SUMMARY.policyCount}</span>
        </div>
        <div className="metric">
          <span className="label">Seeds</span>
          <span className="value">{G30_POLICY_SEARCH_SUMMARY.seedCount}</span>
        </div>
        <div className="metric">
          <span className="label">Objectives</span>
          <span className="value">{G30_POLICY_SEARCH_SUMMARY.objectives.length}</span>
        </div>
        <div className="metric">
          <span className="label">Evidence</span>
          <span className="value good">sealed</span>
        </div>
      </div>

      <div className="panel">
        <h2>Deterministic policy search results</h2>
        <p style={{ color: 'var(--text)', marginBottom: 8 }}>
          G30 summarizes a deterministic policy search over {G30_POLICY_SEARCH_SUMMARY.matrixShape}.
          This view imports compact local static summaries only: no simulation, no API calls,
          and no real-world organization claims.
        </p>
        <div className="card">
          <div className="card-title">{G30_POLICY_SEARCH_SUMMARY.title}</div>
          <div className="card-subtitle">{G30_POLICY_SEARCH_SUMMARY.matrixShape}</div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-dim)' }}>
            source commit: {G30_POLICY_SEARCH_SUMMARY.sourceCommit}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Objective rankings</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 8, fontSize: 12 }}>
          Top 3 policies per objective, copied from verification/G30/POLICY_RANKING_BY_OBJECTIVE.json.
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Objective</th>
              <th>#1 Policy</th>
              <th>Score</th>
              <th>#2 Policy</th>
              <th>Score</th>
              <th>#3 Policy</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {G30_OBJECTIVE_RANKINGS.map((entry) => (
              <tr key={entry.objective}>
                <td style={{ fontWeight: 600 }}>
                  {OBJECTIVE_LABELS[entry.objective] ?? entry.objective}
                </td>
                {entry.topPolicies.map((policy) => (
                  <React.Fragment key={`${entry.objective}-${policy.rank}`}>
                    <td>
                      {policy.rank === 1 ? (
                        <span className="badge badge-pass">{policy.policyId}</span>
                      ) : (
                        policy.policyId
                      )}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatScore(policy.score)}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>Pareto frontier</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 8, fontSize: 12 }}>
          Non-dominated policies across quality, risk reduction, speed, and coordination efficiency.
          Dominated policies are listed separately so the frontier does not imply a universal best policy.
        </p>
        <div className="grid-2col">
          <ParetoFrontierTable entries={G30_PARETO_FRONTIER} />
          <ParetoSummary entries={G30_PARETO_FRONTIER} />
        </div>
      </div>

      <div className="panel">
        <h2>Order complexity breakdown</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 8, fontSize: 12 }}>
          Best policy and aggregate metrics per order complexity class (simple, medium, complex).
        </p>
        <div className="grid-3col">
          {G30_COMPLEXITY_BREAKDOWN.map((entry) => (
            <ComplexityCard key={entry.orderClass} entry={entry} />
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>Policy config details</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 8, fontSize: 12 }}>
          Compact view of the 12 curated organization policies searched in G30.
        </p>
        <div className="scrollable" style={{ maxHeight: 420 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Label</th>
                <th>Mode</th>
                <th>Leads</th>
                <th>Workers</th>
                <th>Span</th>
                <th>Fan-out</th>
                <th>Merge</th>
                <th>Handoff</th>
                <th>Audit</th>
                <th>Validation</th>
                <th>Risk</th>
                <th>Coord x</th>
              </tr>
            </thead>
            <tbody>
              {G30_POLICY_COMPACT_DETAILS.map((policy) => (
                <tr key={policy.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{policy.id}</td>
                  <td>{policy.label}</td>
                  <td>
                    <span className={`badge ${policy.mode === 'flat' ? 'badge-medium' : 'badge-pass'}`}>
                      {policy.mode}
                    </span>
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{policy.cellLeadCount}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{policy.workerCount}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{policy.spanOfControl}</td>
                  <td>{policy.fanoutStrategy}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatScore(policy.mergeJudgmentBonus)}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatScore(policy.handoffClarityBonus)}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatScore(policy.auditCoverageBonus)}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{formatScore(policy.validationStrictnessBonus)}</td>
                  <td>{policy.riskTolerance}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {policy.coordinationCostMultiplier.toFixed(2)}x
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h2>Scoring policy</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 8, fontSize: 12 }}>
          Formulas from verification/G30/SCORING_POLICY.md. Scores are deterministic simulator metrics, not real organization value functions.
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Objective</th>
              <th>Formula</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {G30_SCORING_POLICY.map((sp) => (
              <tr key={sp.objective}>
                <td style={{ fontWeight: 600 }}>
                  {OBJECTIVE_LABELS[sp.objective] ?? sp.objective}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{sp.formula}</td>
                <td style={{ fontSize: 11 }}>{sp.interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2col">
        <PolicyRiskSemanticsPanel />
        <PolicyNonClaimsPanel />
      </div>
    </div>
  )
}

function ParetoFrontierTable({ entries }: { entries: ParetoFrontierEntry[] }) {
  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Policy</th>
            <th>Speed</th>
            <th>Quality</th>
            <th>Risk Red.</th>
            <th>Coord Eff.</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.policyId}>
              <td>
                <span className="badge badge-pass">{entry.policyId}</span>
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatScore(entry.speedScore)}
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatScore(entry.qualityScore)}
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatScore(entry.riskReductionScore)}
              </td>
              <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatScore(entry.coordinationEfficiencyScore)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ParetoSummary({ entries }: { entries: ParetoFrontierEntry[] }) {
  // Compact textual summary of the Pareto frontier; no chart library needed.
  const topSpeed = entries.reduce((a, b) => (a.speedScore > b.speedScore ? a : b))
  const topQuality = entries.reduce((a, b) => (a.qualityScore > b.qualityScore ? a : b))
  const topRisk = entries.reduce((a, b) => (a.riskReductionScore > b.riskReductionScore ? a : b))
  const topCoord = entries.reduce((a, b) => (a.coordinationEfficiencyScore > b.coordinationEfficiencyScore ? a : b))

  return (
    <div>
      <div className="card">
        <div className="card-title">Frontier highlights</div>
        <div className="card-body" style={{ marginTop: 6 }}>
          <FrontierHighlightLine label="Best speed" policyId={topSpeed.policyId} value={topSpeed.speedScore} />
          <FrontierHighlightLine label="Best quality" policyId={topQuality.policyId} value={topQuality.qualityScore} />
          <FrontierHighlightLine label="Best risk reduction" policyId={topRisk.policyId} value={topRisk.riskReductionScore} />
          <FrontierHighlightLine label="Best coord efficiency" policyId={topCoord.policyId} value={topCoord.coordinationEfficiencyScore} />
        </div>
      </div>
      <div className="card" style={{ marginTop: 8 }}>
        <div className="card-title">Frontier size</div>
        <div className="card-subtitle">
          {entries.length} of {12} policies on the Pareto frontier
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-dim)' }}>
          Dominated policies: {G30_DOMINATED_POLICY_IDS.join(', ')}.
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-dim)' }}>
          Dominance pairs: {G30_DOMINANCE_PAIRS.length}
        </div>
      </div>
    </div>
  )
}

function FrontierHighlightLine({
  label,
  policyId,
  value,
}: {
  label: string
  policyId: string
  value: number
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11, marginTop: 2 }}>
      <span style={{ color: 'var(--text-dim)' }}>{label}</span>
      <span>
        <span className="badge badge-pass" style={{ marginRight: 4 }}>
          {policyId}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--green)' }}>
          {formatScore(value)}
        </span>
      </span>
    </div>
  )
}

function ComplexityCard({ entry }: { entry: PolicyComplexityBreakdownEntry }) {
  return (
    <div className="card">
      <div className="card-title" style={{ textTransform: 'capitalize' }}>
        {entry.orderClass}
      </div>
      <div className="card-subtitle">
        Best: <span className="badge badge-pass">{entry.bestPolicyId}</span>
      </div>
      <div className="card-body" style={{ marginTop: 6 }}>
        <MetricLine label="Balanced score" value={entry.bestBalancedScore} />
        <MetricLine label="Final quality" value={entry.meanFinalQuality} />
        <MetricLine label="Latent risk" value={entry.meanLatentRiskEstimate} lowerIsBetter />
        <MetricLine label="Coordination cost" value={entry.meanCoordinationCost} lowerIsBetter />
        <MetricLine label="Delivery ticks" value={entry.meanDeliveryTicks} lowerIsBetter />
        <MetricLine label="Risk-adjusted quality" value={entry.meanRiskAdjustedQuality} />
      </div>
    </div>
  )
}

function formatScore(value: number): string {
  return value.toFixed(2)
}

function PolicyRiskSemanticsPanel() {
  return (
    <div className="panel">
      <h2>Risk semantics</h2>
      <div className="card" style={{ borderLeft: '3px solid var(--yellow)' }}>
        <div className="card-title">{G30_POLICY_RISK_SEMANTICS.header}</div>
        <div className="card-body" style={{ marginTop: 6 }}>
          <p style={{ marginTop: 4 }}>{G30_POLICY_RISK_SEMANTICS.scoringNote}</p>
          <p style={{ marginTop: 6 }}>{G30_POLICY_RISK_SEMANTICS.paretoNote}</p>
          <p style={{ marginTop: 6 }}>{G30_POLICY_RISK_SEMANTICS.latentRiskNote}</p>
          <p style={{ marginTop: 6 }}>{G30_POLICY_RISK_SEMANTICS.detectionNote}</p>
        </div>
      </div>
    </div>
  )
}

function PolicyNonClaimsPanel() {
  return (
    <div className="panel">
      <h2>Non-claims</h2>
      <div className="grid-3col">
        {G30_POLICY_NON_CLAIMS.map((claim) => (
          <div className="card" key={claim}>
            <span className="badge badge-medium">boundary</span>
            <div style={{ marginTop: 6 }}>{claim}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricLine({
  label,
  value,
  lowerIsBetter,
}: {
  label: string
  value: number
  lowerIsBetter?: boolean
}) {
  const color = lowerIsBetter
    ? value < 10
      ? 'var(--green)'
      : value < 25
        ? 'var(--yellow)'
        : 'var(--orange)'
    : value >= 7
      ? 'var(--green)'
      : value >= 5
        ? 'var(--yellow)'
        : 'var(--orange)'

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11 }}>
      <span style={{ color: 'var(--text-dim)' }}>{label}</span>
      <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>
        {value.toFixed(2)}
        {lowerIsBetter ? ' lower is better' : ''}
      </span>
    </div>
  )
}
