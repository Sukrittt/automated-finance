# Supabase Phone OTP Integration Plan (M0-T4)

## Goal
Ship a Play-safe phone OTP login flow backed by Supabase Auth, with clear client interfaces that can be used by onboarding and account/session management screens.

## Scope
- OTP request + verify using Supabase phone auth.
- Session lifecycle handling (read, refresh, sign out, auth state changes).
- Error normalization for UI handling (`INVALID_PHONE`, `INVALID_OTP`, `OTP_EXPIRED`, `RATE_LIMITED`).
- API contract alignment notes for existing `/v1/auth/*` draft endpoints.

## Non-goals
- Full screen-level implementation of the onboarding auth UI.
- Device registration API wiring after login.
- OTP autofill/Android SMS Retriever integration.

## Interface Contract (Client)
Implemented under:
- `/Users/sukrit/Dev/Projects/Automated Finance/src/services/auth/types.ts`
- `/Users/sukrit/Dev/Projects/Automated Finance/src/services/auth/supabasePhoneOtp.ts`

Primary interface:
- `OtpAuthService`
  - `requestOtp({ phoneE164 }) -> { challengeId, retryAfterSeconds? }`
  - `verifyOtp({ phoneE164, otpCode }) -> { session }`
  - `getSession() -> session | null`
  - `refreshSession() -> session | null`
  - `signOut()`
  - `onAuthStateChange(listener)`

## Planned UI Flow
1. User enters phone in E.164.
2. App calls `requestOtp`.
3. User enters OTP.
4. App calls `verifyOtp`.
5. On success:
   - Persist session through Supabase client.
   - Register device via `/v1/device/register` (next task).
   - Navigate to dashboard.
6. On failure:
   - Map and render normalized error states.

## Contract Alignment Notes
- Current draft API uses:
  - `POST /v1/auth/request-otp`
  - `POST /v1/auth/verify-otp`
- Supabase-native client auth can be used directly without proxy endpoints in v1.
- If backend proxy is retained later:
  - Keep `OtpAuthService` as stable client interface.
  - Swap adapter implementation behind the same interface.

## Risks and Mitigations
- Rate limits on repeated OTP requests.
  - Mitigation: expose countdown from provider errors when available, disable resend during cooldown.
- OTP/session mismatch edge cases.
  - Mitigation: validate session presence after verify, hard-fail with `SESSION_MISSING`.
- Inconsistent phone formatting.
  - Mitigation: enforce E.164 before request, return `INVALID_PHONE`.

## Exit Criteria
- Typed auth interface committed and importable.
- Supabase adapter scaffold committed with normalized errors.
- Sprint trackers updated to mark `M0-T4` complete.

