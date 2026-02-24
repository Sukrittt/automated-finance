# Current Sprint

## In Progress

- [x] M0-T5 Wire Supabase client bootstrap and auth service factory
- [x] M0-T6 Implement onboarding phone + OTP screens with cooldown/error states
- [x] M0-T7 Add session bootstrap, guarded navigation, and sign-out path
- [x] M1-T3 Wire device registration call after successful auth
- [x] M1-T4 Integrate notification listener events -> ingest API batch client
- [x] M1-T5 Add offline queue + retry policy for ingest failures

## Next Up

- [x] M2-T4 Wire parser + dedupe pipeline to real ingest payloads
- [x] M2-T5 Transactions API adapter with pagination/filter support
- [x] M2-T6 End-to-end review queue UX states (loading/error/empty)
- [x] M3-T2 Dashboard summary API wiring + time-range switching
- [x] M3-T3 Weekly insights polling/retry behavior in UI
- [x] QA-T2 Auth + ingest integration tests (happy + failure paths)
- [x] DOC-T2 Runbook for auth/ingest failure triage

## Parallel Agent Bundles

### Agent 1 (Auth UX)

- [x] M0-T6 (`6h`) Implement onboarding phone + OTP screens with cooldown/error states
- [x] M0-T7 (`4h`) Add session bootstrap, guarded navigation, and sign-out path
- [x] M2-T6 (`3h`) End-to-end review queue UX states (loading/error/empty)

### Agent 2 (Auth + Device Services)

- [x] M0-T5 (`3h`) Wire Supabase client bootstrap and auth service factory
- [x] M1-T3 (`2h`) Wire device registration call after successful auth
- [x] QA-T2 (`3h`) Auth integration tests (request/verify/session/sign-out)

### Agent 3 (Ingest + Parsing)

- [x] M1-T4 (`5h`) Integrate notification listener events -> ingest API batch client
- [x] M1-T5 (`4h`) Add offline queue + retry policy for ingest failures
- [x] M2-T4 (`4h`) Wire parser + dedupe pipeline to real ingest payloads

### Agent 4 (Dashboard + Reliability)

- [x] M2-T5 (`4h`) Transactions API adapter with pagination/filter support
- [x] M3-T2 (`3h`) Dashboard summary API wiring + time-range switching
- [x] M3-T3 (`3h`) Weekly insights polling/retry behavior in UI
- [x] DOC-T2 (`2h`) Runbook for auth/ingest failure triage
