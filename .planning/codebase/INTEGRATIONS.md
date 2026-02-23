# External Integrations

**Analysis Date:** 2026-02-23

## APIs & External Services

**Backend API:**
- Custom REST API - Core transaction ingestion and data sync
  - Base URL: `EXPO_PUBLIC_API_BASE_URL` (configured in runtime env)
  - Client: Custom fetch wrapper in `src/services/api/client.ts`
  - Auth: Bearer token from Supabase session
  - Endpoints consumed:
    - POST `/ingest/batch` - Batch notification ingestion
    - GET `/dashboard/summary` - Dashboard data
    - GET `/transactions` - Transaction list
    - GET `/review-queue` - Review queue items
    - GET `/insights/weekly` - Weekly insights
    - POST `/devices/register` - Device registration

## Data Storage

**Supabase (PostgreSQL):**
- Auth provider: Supabase Auth
  - Connection: `EXPO_PUBLIC_SUPABASE_URL`
  - Client: `@supabase/supabase-js` 2.97.0
  - Auth methods: Email OTP (default), Phone OTP (feature flag), Google Sign-In
  - Implementation: `src/services/supabase/bootstrap.ts`, `src/services/supabase/config.ts`
  - Config: `persistSession: false`, `autoRefreshToken: true`

**Local Storage:**
- expo-file-system 18.1.11 - Offline queue persistence
- Implementation: `src/services/ingest/queuePersistence.ts`

**Caching:**
- None detected (in-memory only for runtime)

## Authentication & Identity

**Primary Auth:**
- Supabase Auth - OTP-based authentication
  - Email OTP: Default channel
  - Phone OTP: Behind `EXPO_PUBLIC_AUTH_OTP_CHANNEL=phone` feature flag
  - Implementation: `src/services/auth/supabaseEmailOtp.ts`, `src/services/auth/supabasePhoneOtp.ts`

**Social Sign-In:**
- Google Sign-In via Firebase Authentication
  - SDK: firebase 12.9.0
  - Config: `google-services.json` in `android/app/`
  - Expo config: `app.json` plugins or extra.googleServices
  - Token exchange: Firebase ID token exchanged with Supabase via `signInWithIdToken`
  - Implementation: `src/services/auth/firebaseAuth.ts`, `src/config/firebase.ts`

**Device Registration:**
- Custom device registration endpoint
  - Implementation: `src/services/device/register.ts`

## Monitoring & Observability

**Error Tracking:**
- None detected in codebase

**Logs:**
- console.log/debug/warn/error patterns used throughout
- No external logging service integrated

## CI/CD & Deployment

**Build & Run:**
- Expo for React Native builds
- Commands:
  - `npx expo start` - Dev server
  - `npx expo run:android` - Android build
  - `npm run typecheck` - TypeScript validation

**CI:**
- Not detected in codebase

## Environment Configuration

**Required env vars:**
- `EXPO_PUBLIC_API_BASE_URL` - Backend API base URL
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `EXPO_PUBLIC_APP_ENV` - Environment (development/staging/production)
- `EXPO_PUBLIC_AUTH_OTP_CHANNEL` - OTP channel (email/phone)
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` - Google OAuth web client
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` - Google OAuth Android client

**Secrets location:**
- Environment variables via `.env` (not committed)
- Firebase config via `google-services.json` in `android/app/`

## Webhooks & Callbacks

**Incoming:**
- None detected - This is a mobile app, not a server

**Outgoing:**
- Custom native Android NotificationListenerService
  - Captures UPI payment notifications from:
    - GPay, PhonePe, Paytm, BHIM, bank apps
  - Events flow: Android Notification → Native Module → JS Listener → Parser → API
  - Implementation: `modules/notification-listener/`

## Platform-Specific Integrations

**Android Native Module:**
- `notification-listener` custom Expo module
- Uses Android `NotificationListenerService` API
- Only works on Android (iOS returns no-ops)
- Captures: Package name, notification title, notification text
- Flow: `NotificationCaptureService` → `NotificationEventStore` → `NotificationListenerModule`

---

*Integration audit: 2026-02-23*
