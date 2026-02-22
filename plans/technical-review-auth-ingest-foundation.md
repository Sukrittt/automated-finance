# Technical Review: Auth + Notification Ingest Foundation

Date: 2026-02-22
Branch: codex/auth-ingest-foundation

## 1) What we implemented
This iteration moves the app from mostly static UI scaffolding to an integrated client architecture that can:
- authenticate users through phone OTP (Supabase-backed contract),
- register a device after successful auth,
- capture and map UPI notifications into backend ingest payloads,
- run dedupe-safe ingest with offline retry behavior,
- pull live data for dashboard, transactions, review queue, and weekly insights,
- expose test coverage for critical parsing, dedupe, API mapping, ingest queue/runtime, and core UI states.

## 2) Core architecture changes

### App bootstrap and session lifecycle
- `App.tsx` now creates a single auth service via `createAppAuthService()` and subscribes to auth state changes.
- App boot now gates UI on `authReady` and session existence.
- When a session exists, `startIngestRuntime()` runs; when session disappears/sign-out happens, runtime is stopped via `stopIngestRuntime()`.
- Navigation tabs are shown only for authenticated sessions.

Why this matters:
- Prevents background ingest runtime from running before auth/session context is available.
- Establishes a clear user state machine: loading -> onboarding -> authenticated product flows.

### Auth module design
Auth stack is split by responsibilities:
- `src/services/auth/supabasePhoneOtp.ts`
  - Pure Supabase-like client adapter.
  - Normalizes session and errors into app-level contracts.
- `src/services/auth/factory.ts`
  - Composes OTP auth and optional device registration side effect on successful verify.
- `src/services/auth/appAuth.ts`
  - App-facing constructor with graceful fallback auth service when Supabase factory is unavailable.

Notable behavior:
- OTP and phone validation is enforced in onboarding and service layer.
- Error mapping supports `INVALID_PHONE`, `INVALID_OTP`, `OTP_EXPIRED`, `RATE_LIMITED`, `AUTH_ERROR`.
- Device registration failure does not block successful auth completion.

### Device registration and Supabase configuration
- `src/services/device/register.ts` posts `/v1/device/register` with environment-derived metadata and generated install id.
- `src/services/supabase/client.ts` requires explicit client factory injection and caches client instance.
- `src/services/supabase/config.ts` and `src/config/env.ts` centralize env reads and enforce required variables.

Why this matters:
- Avoids hidden client initialization and keeps runtime failures explicit and testable.
- Improves dependency injection for integration tests.

## 3) Notification ingest pipeline

### Runtime orchestration
- `src/services/ingest/runtime.ts` creates a singleton `NotificationIngestService` with notification listener dependencies.
- Uses device id from `EXPO_PUBLIC_DEVICE_ID` (fallback `local-device`).

### Parser and mapper
- `src/services/parsing/upiParser.ts`
  - Supports Google Pay, PhonePe, Paytm, BHIM templates.
  - Extracts amount, direction (debit/credit), merchant, UPI reference, confidence.
- `src/services/dedupe/fingerprint.ts`
  - Builds stable fingerprint based on normalized merchant, ref token, amount, direction, minute bucket.
- `src/services/ingest/payloadMapper.ts`
  - Converts captured notification -> API event contract.
  - Adds deterministic `event_id` and raw payload hash (`fnv1a`).

### Queue, retry, and flush behavior
- `src/services/ingest/offlineQueue.ts`
  - In-memory queue with exponential backoff + jitter.
  - Retries retryable failures (`>=500` or `429`) and drops permanent failures.
- `src/services/ingest/notificationIngestService.ts`
  - Poll loop with dedupe guards:
    - signature guard for same latest notification,
    - fingerprint TTL map (~6h) to suppress repeats.
  - Flushes queue only when notification access is enabled and device id exists.

Operational effect:
- Captured notifications are resilient to transient network/backend failures.
- Duplicate delivery risk is reduced before server-side dedupe.

## 4) Data API integration for product surfaces

### Shared HTTP client
- `src/services/api/client.ts`
  - Central API request function with auth header support.
  - Error envelope normalization into `HttpError`.
  - Query building + JSON response handling.

### Screen-specific data services
- `src/services/dashboard/api.ts`
  - Time-range date windows (week/month/quarter) and response mapping.
- `src/services/transactions/api.ts`
  - Cursor pagination + category/review filters.
- `src/services/reviewQueue/api.ts`
  - Pull pending review items and patch accept/edit actions.
- `src/services/insights/api.ts`
  - Handles `ready | pending | failed` weekly insight states.

UI behavior updates:
- `DashboardScreen.tsx`: loading/error/empty/data states + chart rendering from API data.
- `TransactionsScreen.tsx`: API-driven list with filters and load-more cursor flow.
- `ReviewQueueScreen.tsx`: accept/edit correction flows with bottom sheet and optimistic removal.
- `InsightsScreen.tsx`: pending ETA handling with auto-refresh and bounded retry.
- `OnboardingScreen.tsx`: OTP request/verify flow with cooldown and mapped error banners.
- `SettingsScreen.tsx`: sign-out action wired.

## 5) Validation and test coverage

Test setup and tooling:
- Added Jest config (`jest.config.js`) + setup (`tests/setup.ts`).
- Added `react-test-renderer` and type support for RN snapshot/state tests.

Service tests cover:
- auth service integration paths (request, verify, session, signout, registration side effect handling),
- notification parser and payload mapper,
- dedupe fingerprint stability and sensitivity,
- offline queue retry/drop semantics,
- dashboard and transaction API response mapping and query forwarding.

UI tests cover:
- snapshot baselines for onboarding/dashboard/transactions/review/insights/settings,
- review queue state transitions: loading -> error -> retry -> empty.

## 6) Risks and known gaps
- Ingest queue is currently in-memory; app restart loses queued events.
- Runtime currently polls latest notification; a richer native stream/persistent cursor would reduce missed-event risk.
- Some settings health data is still placeholder presentation and not fully connected to live status.
- Supabase client factory must be wired during bootstrap for production runtime.
- Parser template strategy is regex-based and will need expansion as bank/app copy variants grow.

## 7) Recommended next implementation steps
1. Persist ingest queue to local storage (or SQLite) with crash-safe replay.
2. Replace poll-based capture with event-driven native bridge ingestion where possible.
3. Wire actual notification health into settings cards/actions.
4. Add authenticated API token propagation for ingest and feature fetches.
5. Add contract tests against a mock backend schema for `/v1/*` endpoints.

## 8) Files most relevant for deep technical understanding
- App/session/runtime wiring:
  - `App.tsx`
  - `src/services/ingest/runtime.ts`
- Auth + Supabase + device registration:
  - `src/services/auth/appAuth.ts`
  - `src/services/auth/factory.ts`
  - `src/services/auth/supabasePhoneOtp.ts`
  - `src/services/device/register.ts`
  - `src/services/supabase/client.ts`
- Ingest pipeline:
  - `src/services/ingest/notificationIngestService.ts`
  - `src/services/ingest/offlineQueue.ts`
  - `src/services/ingest/payloadMapper.ts`
  - `src/services/parsing/upiParser.ts`
  - `src/services/dedupe/fingerprint.ts`
- API and screen integration:
  - `src/services/api/client.ts`
  - `src/services/dashboard/api.ts`
  - `src/services/transactions/api.ts`
  - `src/services/reviewQueue/api.ts`
  - `src/services/insights/api.ts`
  - `src/screens/DashboardScreen.tsx`
  - `src/screens/TransactionsScreen.tsx`
  - `src/screens/ReviewQueueScreen.tsx`
  - `src/screens/InsightsScreen.tsx`
  - `src/screens/OnboardingScreen.tsx`
