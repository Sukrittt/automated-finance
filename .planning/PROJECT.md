# Auto Finance

## What This Is

Android-only Expo React Native app that automatically tracks UPI spending in India by capturing payment notifications (GPay, PhonePe, Paytm, BHIM, bank apps) and delivering weekly spending insights. Uses Supabase for auth and a custom REST API backend.

## Core Value

Automatically capture and categorize UPI payment notifications to provide users with effortless spending tracking without manual entry.

## Requirements

### Validated

- ✓ UPI notification capture via Android NotificationListenerService — existing
- ✓ Template-based UPI parser for common apps (GPay, PhonePe, Paytm, BHIM) — existing
- ✓ Deduplication via FNV-1a fingerprint hashing — existing
- ✓ Offline queue with exponential backoff — existing
- ✓ Email OTP authentication — existing
- ✓ Phone OTP authentication (feature-flagged) — existing
- ✓ Google Sign-In via Firebase — existing
- ✓ API client with Bearer token auth — existing
- ✓ Dashboard, Transactions, Review Queue, Insights, Settings screens — existing
- ✓ Tab-based navigation (no router) — existing

### Active

- Execution system and canonical planning docs established in `.planning/`
- MVP phase roadmap and task board initialized
- UI direction locked: playful-light, layered summaries, low-overwhelm design

### Out of Scope

- iOS support — Android-only due to NotificationListenerService requirement
- Manual transaction entry — auto-capture focus
- Investment tracking — spending only for v1

## Context

This is an existing brownfield project with mapped codebase. The notification capture pipeline, auth system, and core UI screens are implemented. Planning continues to define next features.

## Progress Snapshot (2026-02-25)

- `v1 requirement completion`: `12/19` = `63.2%`
- `phase/task board completion (P0-P7)`: `16/16` = `100%`
- `release-readiness checklist completion`: `7/8` done (`1/8` blocked) = `87.5% done`
- `overall MVP progress (weighted estimate)`: `76%`

### Progress Formula

- Overall estimate uses weighted trackers:
  - `60%` product requirement completion (`REQUIREMENTS.md`)
  - `25%` execution phase/task completion (`TASK_BOARD.md`)
  - `15%` release-readiness completion (`RELEASE_READINESS.md`)
- Current weighted score:
  - `(0.60 * 63.2) + (0.25 * 100) + (0.15 * 87.5) = 76.0`

## Constraints

- **Platform**: Android only — NotificationListenerService is Android-specific
- **Auth**: Supabase (email/phone OTP) + Firebase (Google Sign-In)
- **Backend**: Custom REST API (not built in this repo)
- **Amounts**: Always stored as integer paise (1 INR = 100 paise)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tab-based navigation | Simple app, no router needed | ✓ Good |
| Template-based UPI parsing | Fast to extend for new apps | ✓ Good |
| FNV-1a for dedupe | Fast, good distribution | ✓ Good |
| Dependency injection in ingest service | Testability, flexible deps | ✓ Good |

---
## Planning Control Center

- Execution workflow: `.planning/EXECUTION_SYSTEM.md`
- Roadmap: `.planning/ROADMAP.md`
- Phases: `.planning/PHASES.md`
- Task board: `.planning/TASK_BOARD.md`
- Status log: `.planning/STATUS_LOG.md`

---
*Last updated: 2026-02-24 after execution-system implementation*
