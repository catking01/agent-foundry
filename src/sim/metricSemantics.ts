// ============================================================
// G26-0: Metric Semantics
// ============================================================
//
// This module defines the semantic meaning of each simulation metric.
// Critical for research interpretation:
//   "detected" ≠ "actual"
//   "finding count" ≠ "risk level"
//   "high detection" can mean good audit coverage, not bad output.
// ============================================================

/**
 * Semantic categorization of a metric.
 *
 * DETECTION  — counts what audit/validation FOUND (depends on audit coverage)
 * ACTUAL     — measures the true underlying state (not filtered by detection)
 * OUTCOME    — end-state result of simulation run
 * COST       — resource expenditure
 * RATE       — per-order or per-tick normalized value
 * EXPOSURE   — estimated latent risk not yet detected
 */
export type MetricCategory =
  | 'DETECTION'
  | 'ACTUAL'
  | 'OUTCOME'
  | 'COST'
  | 'RATE'
  | 'EXPOSURE'

export interface MetricDefinition {
  /** Field name in scenario runner output */
  field: string
  /** Human-readable label (Chinese) */
  labelZh: string
  /** Human-readable label (English) */
  labelEn: string
  /** Semantic category */
  category: MetricCategory
  /** What this metric actually measures */
  definition: string
  /** Common misinterpretation to avoid */
  warning: string | null
}

/**
 * All metrics defined with their semantics.
 *
 * IMPORTANT: overclaimFindings is DETECTION, not ACTUAL.
 * It counts audit events where reason includes "Overclaim".
 * More audit → more findings. Fewer audit → fewer findings.
 * A low value does NOT mean the artifacts are safe.
 * Use evidenceIntegrityEnd for actual risk assessment.
 */
export const METRIC_DEFINITIONS: MetricDefinition[] = [
  // ---- Detection metrics (count what was FOUND) ----
  {
    field: 'overclaimFindings',
    labelZh: 'Overclaim 发现数',
    labelEn: 'Overclaim Findings',
    category: 'DETECTION',
    definition:
      'Count of AUDIT_COMPLETED events where reason includes "Overclaim". Depends on audit coverage — strategies that audit more find more.',
    warning:
      'NOT a measure of actual overclaim production. Low overclaimFindings with low audit coverage may indicate undetected risk, not safety.',
  },
  {
    field: 'validationFailures',
    labelZh: '验证失败数',
    labelEn: 'Validation Failures',
    category: 'DETECTION',
    definition:
      'Count of VALIDATION_COMPLETED events where passed=false. Depends on validation coverage.',
    warning:
      'Low validation failures may mean high quality OR skipped validation.',
  },
  {
    field: 'auditFailures',
    labelZh: '审计失败数',
    labelEn: 'Audit Failures',
    category: 'DETECTION',
    definition:
      'Count of AUDIT_COMPLETED events where passed=false. Depends on audit coverage.',
    warning:
      'Low audit failures with low audit coverage = undetected risk.',
  },

  // ---- Actual metrics (true underlying state) ----
  {
    field: 'evidenceIntegrityEnd',
    labelZh: '证据完整性（终值）',
    labelEn: 'Evidence Integrity (final)',
    category: 'ACTUAL',
    definition:
      'Quantifies how well artifacts are supported by evidence. Degrades from overclaim, fabrication, or weak methodology. NOT dependent on detection coverage.',
    warning: null,
  },
  {
    field: 'reputationEnd',
    labelZh: '声誉（终值）',
    labelEn: 'Reputation (final)',
    category: 'ACTUAL',
    definition:
      'Client trust score (0-100). Decreases from defects, overclaims, missed deadlines. Increases from successful deliveries.',
    warning: null,
  },

  // ---- Outcome metrics ----
  {
    field: 'ordersCompleted',
    labelZh: '完成订单数',
    labelEn: 'Orders Completed',
    category: 'OUTCOME',
    definition: 'Total orders delivered by horizon.',
    warning: 'Raw count — does not reflect quality or profitability.',
  },
  {
    field: 'gameOverRate',
    labelZh: '破产率',
    labelEn: 'Game Over Rate',
    category: 'OUTCOME',
    definition: 'Fraction of runs ending in bankruptcy before horizon.',
    warning: null,
  },
  {
    field: 'missedDeadlines',
    labelZh: '逾期数',
    labelEn: 'Missed Deadlines',
    category: 'OUTCOME',
    definition: 'Orders delivered after deadlineTick.',
    warning: null,
  },
  {
    field: 'majorIncidents',
    labelZh: '重大事故数',
    labelEn: 'Major Incidents',
    category: 'OUTCOME',
    definition: 'Critical failures (e.g., delivery with audit-failed artifact, severe overclaim).',
    warning: null,
  },

  // ---- Cost metrics ----
  {
    field: 'cashEnd',
    labelZh: '现金（终值）',
    labelEn: 'Cash (final)',
    category: 'OUTCOME',
    definition: 'Cash remaining at horizon.',
    warning: 'High cash with low reputation may indicate short-term profit over trust.',
  },
  {
    field: 'totalSalaries',
    labelZh: '总工资支出',
    labelEn: 'Total Salaries',
    category: 'COST',
    definition: 'Cumulative agent salary payments over the run.',
    warning: null,
  },
  {
    field: 'totalMaintenance',
    labelZh: '总维护支出',
    labelEn: 'Total Maintenance',
    category: 'COST',
    definition: 'Cumulative workshop maintenance payments.',
    warning: null,
  },
  {
    field: 'parallelRouteSpend',
    labelZh: '并行路线支出',
    labelEn: 'Parallel Route Spend',
    category: 'COST',
    definition: 'Cost of starting parallel routes.',
    warning: null,
  },
  {
    field: 'coordinationCost',
    labelZh: '协调成本',
    labelEn: 'Coordination Cost',
    category: 'COST',
    definition:
      'Time/resource overhead from hierarchy handoffs, fan-out merge, and cross-unit communication. Defined for G26+ hierarchical scenarios.',
    warning: null,
  },

  // ---- Exposure metrics (estimated latent risk, G26+) ----
  {
    field: 'auditCoverageRate',
    labelZh: '审计覆盖率',
    labelEn: 'Audit Coverage Rate',
    category: 'EXPOSURE',
    definition:
      'Fraction of artifacts that underwent audit. (audited artifacts / total artifacts). Low coverage = more undetected risk.',
    warning:
      '100% coverage is expensive. 0% coverage means overclaimFindings is meaningless.',
  },
  {
    field: 'undetectedOverclaimExposure',
    labelZh: '未检出 Overclaim 暴露',
    labelEn: 'Undetected Overclaim Exposure',
    category: 'EXPOSURE',
    definition:
      'Estimated latent overclaims not caught by audit. Computed as: evidenceIntegrity degradation rate × (1 - auditCoverageRate) × artifact count. Higher = more hidden risk.',
    warning: 'This is an ESTIMATE, not a measured value. It is a research heuristic.',
  },
]

/** Look up a metric definition by field name. */
export function getMetricDefinition(field: string): MetricDefinition | undefined {
  return METRIC_DEFINITIONS.find((m) => m.field === field)
}

/** Get all DETECTION-category metrics (depend on audit/validation coverage). */
export function getDetectionMetrics(): MetricDefinition[] {
  return METRIC_DEFINITIONS.filter((m) => m.category === 'DETECTION')
}

/** Get all ACTUAL-category metrics (true underlying state). */
export function getActualMetrics(): MetricDefinition[] {
  return METRIC_DEFINITIONS.filter((m) => m.category === 'ACTUAL')
}

/** Get all EXPOSURE-category metrics (estimated latent risk). */
export function getExposureMetrics(): MetricDefinition[] {
  return METRIC_DEFINITIONS.filter((m) => m.category === 'EXPOSURE')
}
