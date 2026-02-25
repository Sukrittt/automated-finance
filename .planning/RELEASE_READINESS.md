# Release Readiness Package

## Scope

- Closed beta operational readiness for release checklist and support/monitoring setup.

## Parking Note

- This checklist is intentionally parked during active app-development iterations.
- Resume only during final pre-release pass when cohort onboarding execution starts.

## Checklist Tracker

| Item | Status | Owner | Evidence | Notes |
|---|---|---|---|---|
| Build signed and versioned | DONE | Engineering | `.planning/SIGNED_BUILD_EVIDENCE.md`, `.planning/RELEASE_EXECUTION_RUNBOOK.md`, `eas.json`, `app.json` | Production Android AAB build finished (`dcec2ad2-d908-4750-87e4-511c7e1fb9a5`) with artifact URL and SHA-256 captured (2026-02-24) |
| Release notes include known limitations | DONE | Product | `.planning/RELEASE_NOTES_DRAFT.md` | Drafted from implemented scope and known gaps (2026-02-24) |
| Test cohort selected and onboarded | BLOCKED | Product Ops | `.planning/COHORT_INVITE_EXECUTION.md`, `.planning/RELEASE_EXECUTION_RUNBOOK.md` | Deferred until final pre-release pass due to no active tester roster data (names/emails/acceptance). Unblock by collecting cohort roster + invite evidence and running `npm run cohort:summary && npm run cohort:evidence && npm run cohort:closeout` (target: 2026-03-06). |
| Support channel and issue intake path defined | DONE | Product Ops | `.planning/BETA_OPERATIONS.md` | Canonical channel, intake template, severity escalation, and SLA documented |
| Crash and event telemetry enabled | DONE | Engineering | `src/services/telemetry/*`, `App.tsx`, telemetry tests | Runtime structured console sink wired through auth/ingest/crash paths |
| Monitoring checklist metrics ownership | DONE | Engineering + Product Ops | `.planning/BETA_OPERATIONS.md` | Owners assigned for OTP, parse failures, backlog, and crash-free sessions |
| Monitoring signals validated against checklist | DONE | Engineering | `npm test -- tests/services/auth/auth.integration.test.ts tests/services/ingest/notificationIngestService.test.ts tests/services/telemetry/crash.test.ts tests/services/telemetry/runtimeReporter.test.ts tests/services/qualityGate/evaluator.test.ts`, `.planning/TEST_MATRIX.md` | Focused validation run passed (`5/5` suites, `18/18` tests) on 2026-02-25 and monitoring/rollback evidence is linked |
| Rollback criteria and action rehearsal | DONE | Engineering | `.planning/ROLLBACK_REHEARSAL.md` | Tabletop dry run completed against all rollback criteria (2026-02-24) |


## Known Gaps

- Tester invite execution and final roster lock are deferred to final pre-release pass (owner: Product Ops, target: 2026-03-06).

## Exit Rule For P7-T3

- Move all release checklist rows to `DONE` or explicit `BLOCKED` with owner + target date.
- Capture links/evidence for each done row in this file.
