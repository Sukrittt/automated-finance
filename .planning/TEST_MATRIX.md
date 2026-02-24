# Test Matrix

## Coverage Table


| Area           | Scenario                                               | Requirement Link          | Status  | Evidence                                                                                                  |
| -------------- | ------------------------------------------------------ | ------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| Parser         | Extract amount/date/payee from GPay notification       | SUM-01, CAT-01            | Pass    | `tests/services/parsing/upiParser.corpus.test.ts`                                                         |
| Parser         | Extract amount/date/payee from PhonePe notification    | SUM-01, CAT-01            | Pass    | `tests/services/parsing/upiParser.corpus.test.ts`                                                         |
| Parser         | Extract amount/date/payee from Paytm notification      | SUM-01, CAT-01            | Pass    | `tests/services/parsing/upiParser.corpus.test.ts`                                                         |
| Parser         | Extract amount/date/payee from BHIM notification       | SUM-01, CAT-01            | Pass    | `tests/services/parsing/upiParser.corpus.test.ts`                                                         |
| Parser         | Deduplication replay test                              | SUM-01                    | Pass    | `tests/services/ingest/notificationIngestService.test.ts`                                                 |
| Ingest         | Low-confidence event is marked for review queue        | SUM-01, CAT-01            | Pass    | `tests/services/ingest/payloadMapper.test.ts`                                                             |
| Categorization | Rule-based category mapping accuracy                   | CAT-01, CAT-03            | Pass    | `tests/services/categorization/categoryRules.test.ts`                                                     |
| Categorization | Dashboard category amount + share breakdown visibility | CAT-02, CAT-03            | Pass    | `tests/ui/dashboard.summaryCategory.test.tsx`, `tests/ui/visuals.components.test.tsx`                    |
| Categorization | Single-tap manual recategorization                     | CAT-04, CAT-05            | Pass    | `tests/services/reviewQueue/api.test.ts`                                                                  |
| Summaries      | Daily summary totals and count                         | SUM-01                    | Pass    | `tests/services/summary/aggregation.test.ts`                                                              |
| Summaries      | Weekly day-by-day summary                              | SUM-02                    | Pass    | `tests/services/summary/aggregation.test.ts`                                                              |
| Summaries      | Monthly comparison summary                             | SUM-03                    | Pass    | `tests/services/summary/aggregation.test.ts`                                                              |
| Summaries      | Time range selector supports daily/weekly/monthly      | SUM-04                    | Pass    | `tests/services/dashboard/api.test.ts`                                                                    |
| Summaries      | Dashboard renders explicit range summary labels/stats  | SUM-01, SUM-02, SUM-03    | Pass    | `tests/ui/dashboard.summaryCategory.test.tsx`                                                             |
| Summaries      | Dashboard selector refetches selected range            | SUM-04                    | Pass    | `tests/ui/dashboard.summaryCategory.test.tsx`                                                             |
| Visuals        | Donut chart by category                                | VIS-01                    | Pass    | `tests/ui/visuals.components.test.tsx`                                                                    |
| Visuals        | Bar chart over period                                  | VIS-02                    | Pass    | `tests/ui/visuals.components.test.tsx`                                                                    |
| Visuals        | Line trend chart                                       | VIS-03                    | Pass    | `tests/ui/visuals.components.test.tsx`                                                                    |
| Insights       | Weekly spend-change insight generation                 | INS-01, INS-03            | Pass    | `tests/services/insights/generator.test.ts`                                                               |
| Insights       | Reduction recommendation explainability                | INS-04                    | Pass    | `tests/services/insights/generator.test.ts`                                                               |
| Budgeting      | 80% threshold warning                                  | BUD-02                    | Pass    | `tests/services/budget/thresholds.test.ts`                                                                |
| Budgeting      | 100% exceed alert                                      | BUD-03                    | Pass    | `tests/services/budget/thresholds.test.ts`                                                                |
| Budgeting      | Monthly budget setup/edit persistence                  | BUD-01                    | Pass    | `tests/services/budget/storage.test.ts`, `tests/ui/budgetFlow.test.tsx`                                  |
| UX             | Playful action feedback (save + correction flows)      | BUD-01, CAT-04            | Pass    | `tests/ui/budgetFlow.test.tsx`, `tests/ui/reviewQueue.states.test.tsx`, `tests/ui/screens.snapshot.test.tsx` |
| Auth           | OTP request/verify/retry flows                         | Platform constraint       | Pass    | `tests/services/auth/auth.integration.test.ts`                                                            |
| Monitoring     | OTP and ingest telemetry event emission baseline       | Beta monitoring checklist | Pass    | `tests/services/auth/auth.integration.test.ts`, `tests/services/ingest/notificationIngestService.test.ts` |
| Monitoring     | Crash telemetry handler install and capture forwarding | Beta monitoring checklist | Pass    | `tests/services/telemetry/crash.test.ts`                                                                  |
| Monitoring     | Runtime telemetry sink logs and retains recent events  | Beta monitoring checklist | Pass    | `tests/services/telemetry/runtimeReporter.test.ts`                                                        |
| Operations     | Rollback criteria and action dry-run rehearsal         | Beta rollback checklist   | Pass    | `.planning/ROLLBACK_REHEARSAL.md`                                                                         |
| Quality Gate   | KPI + issue threshold go/no-go decision                | Phase 6 gate              | Pass    | `tests/services/qualityGate/evaluator.test.ts`                                                            |


## KPI Gates

- Parser extraction: `>=95%`
- Category precision: `>=90%`

## Latest KPI Snapshot (2026-02-24)

- Parser extraction KPI: `100%` (`12/12` parseable corpus samples amount-matched).
- Category precision KPI baseline: `100%` (`10/10` baseline rules corpus matched; gate `>=90%`).
- Auth funnel baseline: request/verify/retry/timeout paths validated in integration tests.
- Event telemetry baseline: OTP + ingest structured event emission validated in tests.
- Crash telemetry baseline: startup crash handler installation and capture forwarding validated in tests.
- Runtime telemetry sink baseline: structured event logging and recent-event retention validated.
- Rollback rehearsal baseline: tabletop dry run completed for all rollback criteria.
- Monitoring validation checkpoint: focused monitoring and gate suite passed (`5/5` suites, `18/18` tests) on 2026-02-24.
- Quality gate baseline: evaluator and `GO/NO_GO` threshold behavior validated.
- Checkpoint decision snapshot: `GO` (`P0=0`, `P1=0`, no threshold failures).
