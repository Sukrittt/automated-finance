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
| P0-T5 | 0 | Define first implementation session in app repo | TODO | P0-T4 | Session plan includes tasks, checks, and handoff |
| P1-T1 | 1 | Build parser corpus for top 4 apps | TODO | P0-T5 | Corpus includes success and edge notifications |
| P1-T2 | 1 | Validate extraction against corpus | TODO | P1-T1 | >=95% amount extraction |
| P2-T1 | 2 | Category rules engine baseline | TODO | P1-T2 | Core categories mapped with precision tests |
| P3-T1 | 3 | Daily/weekly/monthly summary service | TODO | P2-T1 | Totals reconcile with ledger |
| P4-T1 | 4 | Weekly insights generation v1 | TODO | P3-T1 | Explainable and metric-backed output |
| P5-T1 | 5 | OTP funnel hardening | TODO | P4-T1 | Stable auth flow + retry coverage |
| P6-T1 | 6 | Quality gate and go/no-go | TODO | P5-T1 | KPI gate + issue threshold satisfied |

## Current Session Focus

- Goal: establish execution system and planning artifacts.
- In scope: planning docs only.
- Out of scope: app code implementation.
