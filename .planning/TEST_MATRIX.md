# Test Matrix

## Coverage Table

| Area | Scenario | Requirement Link | Status | Evidence |
|---|---|---|---|---|
| Parser | Extract amount/date/payee from GPay notification | SUM-01, CAT-01 | Pass | `tests/services/parsing/upiParser.corpus.test.ts` |
| Parser | Extract amount/date/payee from PhonePe notification | SUM-01, CAT-01 | Pass | `tests/services/parsing/upiParser.corpus.test.ts` |
| Parser | Extract amount/date/payee from Paytm notification | SUM-01, CAT-01 | Pass | `tests/services/parsing/upiParser.corpus.test.ts` |
| Parser | Extract amount/date/payee from BHIM notification | SUM-01, CAT-01 | Pass | `tests/services/parsing/upiParser.corpus.test.ts` |
| Parser | Deduplication replay test | SUM-01 | Pass | `tests/services/ingest/notificationIngestService.test.ts` |
| Ingest | Low-confidence event is marked for review queue | SUM-01, CAT-01 | Pass | `tests/services/ingest/payloadMapper.test.ts` |
| Categorization | Rule-based category mapping accuracy | CAT-01, CAT-03 | Not Run | Pending implementation |
| Categorization | Single-tap manual recategorization | CAT-04, CAT-05 | Not Run | Pending implementation |
| Summaries | Daily summary totals and count | SUM-01 | Not Run | Pending implementation |
| Summaries | Weekly day-by-day summary | SUM-02 | Not Run | Pending implementation |
| Summaries | Monthly comparison summary | SUM-03 | Not Run | Pending implementation |
| Visuals | Donut chart by category | VIS-01 | Not Run | Pending implementation |
| Visuals | Bar chart over period | VIS-02 | Not Run | Pending implementation |
| Visuals | Line trend chart | VIS-03 | Not Run | Pending implementation |
| Insights | Weekly spend-change insight generation | INS-01, INS-03 | Not Run | Pending implementation |
| Insights | Reduction recommendation explainability | INS-04 | Not Run | Pending implementation |
| Budgeting | 80% threshold warning | BUD-02 | Not Run | Pending implementation |
| Budgeting | 100% exceed alert | BUD-03 | Not Run | Pending implementation |
| Auth | OTP request/verify/retry flows | Platform constraint | Not Run | Pending implementation |

## KPI Gates

- Parser extraction: `>=95%`
- Category precision: `>=90%`

## Latest KPI Snapshot (2026-02-24)

- Parser extraction KPI: `100%` (`12/12` parseable corpus samples amount-matched).
