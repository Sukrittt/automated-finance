export type GateDecision = 'GO' | 'NO_GO';

export interface QualityGateMetrics {
  parserExtractionPct: number;
  categoryPrecisionPct: number;
  authFunnelValidated: boolean;
  summaryReconciliationValidated: boolean;
  insightExplainabilityValidated: boolean;
  openP0Issues: number;
  openP1Issues: number;
}

export interface QualityGateThresholds {
  parserExtractionMinPct: number;
  categoryPrecisionMinPct: number;
  maxOpenP0Issues: number;
  maxOpenP1Issues: number;
}

export interface QualityGateFailure {
  key:
    | 'parser_extraction'
    | 'category_precision'
    | 'auth_funnel'
    | 'summary_reconciliation'
    | 'insight_explainability'
    | 'open_p0_issues'
    | 'open_p1_issues';
  severity: 'P0' | 'P1';
  message: string;
}

export interface QualityGateResult {
  decision: GateDecision;
  checkedAtISO: string;
  thresholds: QualityGateThresholds;
  metrics: QualityGateMetrics;
  failures: QualityGateFailure[];
}

export const DEFAULT_QUALITY_GATE_THRESHOLDS: QualityGateThresholds = {
  parserExtractionMinPct: 95,
  categoryPrecisionMinPct: 90,
  maxOpenP0Issues: 0,
  maxOpenP1Issues: 3
};

export function evaluateQualityGate(
  metrics: QualityGateMetrics,
  thresholds: Partial<QualityGateThresholds> = {}
): QualityGateResult {
  const effectiveThresholds: QualityGateThresholds = {
    ...DEFAULT_QUALITY_GATE_THRESHOLDS,
    ...thresholds
  };

  const failures: QualityGateFailure[] = [];

  if (metrics.parserExtractionPct < effectiveThresholds.parserExtractionMinPct) {
    failures.push({
      key: 'parser_extraction',
      severity: 'P0',
      message: `Parser extraction ${metrics.parserExtractionPct.toFixed(1)}% is below ${effectiveThresholds.parserExtractionMinPct}%.`
    });
  }

  if (metrics.categoryPrecisionPct < effectiveThresholds.categoryPrecisionMinPct) {
    failures.push({
      key: 'category_precision',
      severity: 'P1',
      message: `Category precision ${metrics.categoryPrecisionPct.toFixed(1)}% is below ${effectiveThresholds.categoryPrecisionMinPct}%.`
    });
  }

  if (!metrics.authFunnelValidated) {
    failures.push({
      key: 'auth_funnel',
      severity: 'P0',
      message: 'Auth funnel validation is incomplete or failing.'
    });
  }

  if (!metrics.summaryReconciliationValidated) {
    failures.push({
      key: 'summary_reconciliation',
      severity: 'P1',
      message: 'Summary reconciliation checks are incomplete or failing.'
    });
  }

  if (!metrics.insightExplainabilityValidated) {
    failures.push({
      key: 'insight_explainability',
      severity: 'P1',
      message: 'Insight explainability checks are incomplete or failing.'
    });
  }

  if (metrics.openP0Issues > effectiveThresholds.maxOpenP0Issues) {
    failures.push({
      key: 'open_p0_issues',
      severity: 'P0',
      message: `Open P0 issues ${metrics.openP0Issues} exceeds threshold ${effectiveThresholds.maxOpenP0Issues}.`
    });
  }

  if (metrics.openP1Issues > effectiveThresholds.maxOpenP1Issues) {
    failures.push({
      key: 'open_p1_issues',
      severity: 'P1',
      message: `Open P1 issues ${metrics.openP1Issues} exceeds threshold ${effectiveThresholds.maxOpenP1Issues}.`
    });
  }

  return {
    decision: failures.length === 0 ? 'GO' : 'NO_GO',
    checkedAtISO: new Date().toISOString(),
    thresholds: effectiveThresholds,
    metrics,
    failures
  };
}
