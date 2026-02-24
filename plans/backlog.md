# Backlog

## High Priority
- [x] M0-T4 (`4h`) Supabase auth flow (phone OTP) integration plan and interfaces
- [ ] M0-T5 (`3h`) Wire Supabase client bootstrap and auth service factory
- [ ] M0-T6 (`6h`) Implement onboarding phone + OTP screens with cooldown/error states
- [ ] M0-T7 (`4h`) Add session bootstrap, guarded navigation, and sign-out path
- [ ] M1-T3 (`2h`) Wire device registration call after successful auth
- [ ] M1-T4 (`5h`) Integrate notification listener events -> ingest API batch client
- [ ] M1-T5 (`4h`) Add offline queue + retry policy for ingest failures

## Medium Priority
- [ ] M2-T4 (`4h`) Wire parser + dedupe pipeline to real ingest payloads
- [ ] M2-T5 (`4h`) Transactions API adapter with pagination/filter support
- [ ] M2-T6 (`3h`) End-to-end review queue UX states (loading/error/empty)
- [ ] M3-T2 (`3h`) Dashboard summary API wiring + time-range switching
- [ ] M3-T3 (`3h`) Weekly insights polling/retry behavior in UI
- [ ] QA-T2 (`3h`) Auth + ingest integration tests (happy + failure paths)

## Parallelizable
- [ ] DOC-T2 (`2h`) Runbook for auth/ingest failure triage
- [ ] PERF-T1 (`3h`) Capture baseline latency metrics for ingest -> transaction visibility

## Agent Split (Next Wave)

### Agent 1 (Auth UX)
- [ ] M0-T6 (`6h`) Implement onboarding phone + OTP screens with cooldown/error states
- [ ] M0-T7 (`4h`) Add session bootstrap, guarded navigation, and sign-out path
- [ ] M2-T6 (`3h`) End-to-end review queue UX states (loading/error/empty)

### Agent 2 (Auth + Device Services)
- [ ] M0-T5 (`3h`) Wire Supabase client bootstrap and auth service factory
- [ ] M1-T3 (`2h`) Wire device registration call after successful auth
- [ ] QA-T2 (`3h`) Auth integration tests (request/verify/session/sign-out)

### Agent 3 (Ingest + Parsing)
- [ ] M1-T4 (`5h`) Integrate notification listener events -> ingest API batch client
- [ ] M1-T5 (`4h`) Add offline queue + retry policy for ingest failures
- [ ] M2-T4 (`4h`) Wire parser + dedupe pipeline to real ingest payloads

### Agent 4 (Dashboard + Reliability)
- [ ] M2-T5 (`4h`) Transactions API adapter with pagination/filter support
- [ ] M3-T2 (`3h`) Dashboard summary API wiring + time-range switching
- [ ] M3-T3 (`3h`) Weekly insights polling/retry behavior in UI
- [ ] DOC-T2 (`2h`) Runbook for auth/ingest failure triage
