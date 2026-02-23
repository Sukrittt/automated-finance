# Architecture

**Analysis Date:** 2026-02-23

## Pattern Overview

**Overall:** Event-Driven Service Layer with Dependency Injection

**Key Characteristics:**
- NotificationListenerService captures UPI payment notifications from Android
- Events flow through a pipeline: Native → JS Listener → Parser → Mapper → Ingest Service → Backend API
- Ingest service uses dependency injection for all external dependencies (notification access, auth, device ID, persistence)
- Auth session drives runtime lifecycle - ingest starts when authenticated, stops when cleared
- No router library - App.tsx manages tab state directly

## Layers

**UI Layer (Screens):**
- Purpose: Render screens and handle user interactions
- Location: `src/screens/`
- Contains: Screen components (DashboardScreen, TransactionsScreen, ReviewQueueScreen, InsightsScreen, SettingsScreen, OnboardingScreen)
- Depends on: Services, components
- Used by: App.tsx

**Component Layer:**
- Purpose: Reusable UI primitives
- Location: `src/components/`
- Contains: Text, Button, Card, Chip, Input, Sheet, Stat
- Depends on: Theme tokens
- Used by: Screens

**Service Layer (Business Logic):**
- Purpose: Core application logic
- Location: `src/services/`
- Contains: Auth, ingest, parsing, notifications, API clients
- Depends on: Config, external SDKs
- Used by: Screens, runtime

**API Layer:**
- Purpose: HTTP communication with backend
- Location: `src/services/api/client.ts`, `src/services/*/api.ts`
- Contains: Typed fetch wrapper with Bearer auth injection
- Depends on: Auth token, environment config
- Used by: Services

**Config Layer:**
- Purpose: Environment configuration
- Location: `src/config/env.ts`, `src/config/firebase.ts`
- Contains: Runtime env reading from EXPO_PUBLIC_* vars
- Depends on: Environment variables
- Used by: Services

**Native Module Layer:**
- Purpose: Android notification capture
- Location: `modules/notification-listener/`
- Contains: Kotlin NotificationListenerService implementation
- Depends on: Android system APIs
- Used by: JS layer via wrapper

## Data Flow

**Notification Capture Pipeline:**

1. **Native Module** (`modules/notification-listener/android/...NotificationCaptureService.kt`): Android's NotificationListenerService captures all notifications system-wide

2. **Native Listener Bridge** (`src/services/notifications/nativeListener.ts`): Thin wrapper that re-exports native module functions. All JS code imports from here, never directly from the native module

3. **UPI Parser** (`src/services/parsing/upiParser.ts`): Template-based parser matches notifications by package name and keyword hints against `UPI_TEMPLATES`. Extracts amount (paise), direction (debit/credit), merchant, UPI ref. Amounts always stored as integer paise

4. **Payload Mapper** (`src/services/ingest/payloadMapper.ts`): Converts `CapturedNotification` into `MappedIngestEvent` by running UPI parsing, building dedupe fingerprints (FNV-1a hash), and assembling the API event payload

5. **Ingest Service** (`src/services/ingest/notificationIngestService.ts`): Core orchestrator class (`NotificationIngestService`) that polls for notifications, deduplicates via fingerprint map, manages an offline queue with exponential backoff, and tracks end-to-end latency. Uses dependency injection for all external dependencies

6. **Ingest Runtime** (`src/services/ingest/runtime.ts`): Singleton lifecycle manager. `startIngestRuntime()` is called when auth session is established, `stopIngestRuntime()` when session is cleared

**State Management:**
- React state in App.tsx for session and navigation
- In-memory state in NotificationIngestService for queue, fingerprints, latency tracking
- Module-level variable in `src/services/auth/sessionToken.ts` for session token storage

## Key Abstractions

**Ingest Dependencies (Dependency Injection):**
- Purpose: Decouple ingest service from concrete implementations
- Examples: `src/services/ingest/runtime.ts` - creates service with concrete implementations
- Pattern: Object with function properties for notification access, auth token, device ID, persistence

**IngestOfflineQueue:**
- Purpose: Queue notifications for batch upload with retry logic
- Examples: `src/services/ingest/offlineQueue.ts`
- Pattern: Enqueue/dequeue with flush logic, exponential backoff on failure

**DedupeFingerprint:**
- Purpose: Unique identifier to detect duplicate notifications
- Examples: `src/services/dedupe/fingerprint.ts`
- Pattern: FNV-1a hash of canonical fields (source, amount, direction, merchant, ref, time bucket)

## Entry Points

**App Entry:**
- Location: `App.tsx`
- Triggers: App launch
- Responsibilities: Initialize Supabase bootstrap, create auth service, manage session state, render screens, manage tab navigation

**Auth Entry:**
- Location: `src/services/auth/appAuth.ts` → `createAppAuthService()`
- Triggers: App launch (via ensureSupabaseBootstrap), user login
- Responsibilities: Bundle OTP auth with optional Google Sign-In

**Ingest Runtime Entry:**
- Location: `src/services/ingest/runtime.ts` → `startIngestRuntime()`
- Triggers: Auth session established (App.tsx useEffect)
- Responsibilities: Create and start NotificationIngestService, set up visibility observer

**API Entry:**
- Location: `src/services/api/client.ts` → `apiRequest<T>()`
- Triggers: Any service needing backend communication
- Responsibilities: Typed fetch wrapper with Bearer token injection, URL building, error normalization

## Error Handling

**Strategy:** Custom error classes with typed fields

**Patterns:**
- `HttpError` class (`src/services/api/client.ts`): Extends Error with `status`, `code`, `field` properties for normalized API errors
- `AuthServiceError` (`src/services/auth/supabasePhoneOtp.ts`): Typed auth errors with codes like `INVALID_PHONE`, `INVALID_OTP`
- Health telemetry reporting for runtime issues (notification access disabled, device ID missing, auth token missing, etc.)

## Cross-Cutting Concerns

**Logging:** Console logging via health telemetry events
**Validation:** Input validation in auth services (phone E.164 format, email format, OTP regex)
**Authentication:** Bearer token injection via `sessionToken` module variable, auto-injected in `apiRequest()`

---

*Architecture analysis: 2026-02-23*
