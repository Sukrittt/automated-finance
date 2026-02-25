# Task Board

## Status Legend

- `TODO`
- `IN_PROGRESS`
- `BLOCKED`
- `DONE`

## Active Backlog

| Task ID | Phase | Task | Status | Dependency | Acceptance Criteria |
|---|---|---|---|---|---|
| P0-T1 | 0 | Create planning docs suite | DONE | None | All required `.planning` docs exist |
| P0-T2 | 0 | Define session workflow and templates | DONE | P0-T1 | Kickoff/close templates available |
| P0-T3 | 0 | Establish branch/PR policy | DONE | P0-T1 | Policy documented in execution system |
| P0-T4 | 0 | Seed decision log from current strategy | DONE | P0-T1 | Decisions log includes locked architecture choices |
| P0-T5 | 0 | Define first implementation session in app repo | DONE | P0-T4 | Session plan includes tasks, checks, and handoff |
| P1-T1 | 1 | Build parser corpus for top 4 apps | DONE | P0-T5 | Corpus includes success and edge notifications |
| P1-T2 | 1 | Validate extraction against corpus | DONE | P1-T1 | >=95% amount extraction |
| P2-T1 | 2 | Category rules engine baseline | DONE | P1-T2 | Core categories mapped with precision tests |
| P3-T1 | 3 | Daily/weekly/monthly summary service | DONE | P2-T1 | Totals reconcile with ledger |
| P4-T1 | 4 | Weekly insights generation v1 | DONE | P3-T1 | Explainable and metric-backed output |
| P5-T1 | 5 | OTP funnel hardening | DONE | P4-T1 | Stable auth flow + retry coverage |
| P6-T1 | 6 | Quality gate and go/no-go | DONE | P5-T1 | KPI gate + issue threshold satisfied |
| P7-T1 | 7 | Event telemetry baseline for OTP + ingest flows | DONE | P6-T1 | OTP/ingest success-failure signals emitted with tests |
| P7-T2 | 7 | Crash telemetry provider integration baseline | DONE | P7-T1 | Crash capture path defined and verified in app startup |
| P7-T3 | 7 | Release readiness package (notes/cohort/support) | DONE | P7-T2 | Release checklist items mapped/tracked; remaining cohort onboarding captured as explicit deferred blocker in release readiness |
| P7-T4 | 7 | Monitoring + rollback runbook validation | DONE | P7-T3 | Monitoring signals and rollback triggers validated with checklist evidence |
| APP-ITER-01 | 8 | Core screen preview resilience parity | DONE | P7-T4 | Dashboard/Transactions/Review/Insights all have usable fallback mode when live APIs fail |
| APP-ITER-02 | 8 | End-to-end happy-path UX tightening | DONE | APP-ITER-01 | Primary user flows work smoothly with clear loading/empty/error states and consistent action copy |
| APP-ITER-03 | 8 | Device-run iteration loop and polish backlog | DONE | APP-ITER-02 | Repeated test-and-polish cycle captured with concrete UX fixes and evidence |

## Current Session Focus

- Goal: Complete app development iterations and keep execution fully product-focused.
- In scope: app UX, behavior, and reliability improvements with fast implementation/test loops.
- Out of scope: release/cohort/beta-ops execution until final pre-release pass.
