# Auth + Ingest Failure Triage Runbook (DOC-T2)

## Scope

Use this runbook when users report login/session issues (phone OTP + session bootstrap) or when expected UPI notifications do not appear as transactions.

## 1. Quick Signal Checks (5 minutes)

1. Confirm environment values are present:
   - `EXPO_PUBLIC_API_BASE_URL`
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. Check app-level symptom:
   - Auth issue: OTP request/verify errors, forced sign-out, missing session restore.
   - Ingest issue: notification events seen on device but no `/v1/ingest/notifications/batch` traffic.
3. Record:
   - user ID or anonymized identifier
   - local time window
   - app build/version
   - whether issue is reproducible on demand

## 2. Auth Triage

### A. OTP Request Fails

1. Verify request payload uses E.164 phone format.
2. Inspect error code/message from auth service normalization:
   - `INVALID_PHONE`
   - `RATE_LIMITED` (respect `retryAfterSeconds`)
   - generic `AUTH_UNKNOWN`
3. If rate-limited:
   - communicate cooldown duration to user
   - avoid repeated retries until cooldown expires

### B. OTP Verify Fails

1. Validate OTP length/format.
2. Check normalized error:
   - `INVALID_OTP`
   - `OTP_EXPIRED`
3. Confirm phone used for verify matches request.
4. If verify succeeds but session is missing:
   - treat as backend auth consistency issue
   - request fresh OTP cycle once
   - escalate if repeated

### C. Session Bootstrap / Sign-Out Issues

1. Confirm `auth.getSession()` returns a non-expired session.
2. Confirm sign-out path clears local state and token-bearing requests.
3. If session appears valid but API returns auth errors:
   - inspect `Authorization` header forwarding
   - check token expiry/skew on server side

## 3. Ingest Triage

### A. Notification Captured but Not Ingested

1. Confirm notification listener receives event.
2. Verify payload fields expected by ingest endpoint:
   - stable `event_id`
   - `received_at`
   - `source_app`
   - raw notification text/body
3. Confirm batch POST to `/v1/ingest/notifications/batch` is attempted.

### B. Ingest API Error / Drops

1. Check response class:
   - `2xx`: inspect `accepted/deduped/rejected` counts.
   - `4xx`: payload/schema/auth issue.
   - `5xx`: transient backend issue; retry policy should apply.
2. If response is success but transaction not visible:
   - verify parser pipeline outcome (parsed vs rejected).
   - verify dedupe behavior on `event_id` and fingerprint.

### C. Offline Queue / Retry Behavior

1. Confirm failed batches are queued locally.
2. Confirm retry attempts happen on connectivity restoration.
3. Validate queue drain order is FIFO and idempotent.

## 4. Escalation Matrix

Escalate to backend immediately when:

1. Auth endpoint returns sustained `5xx` or malformed responses.
2. Verify success is returned but no usable session token is issued.
3. Ingest endpoint accepts payloads but transactions are consistently not created.
4. Dedupe rate spikes unexpectedly for clearly unique events.

Escalate to mobile/client team when:

1. Notification listener is not firing on supported devices.
2. Offline queue is not persisting or retry timers stop.
3. Session/bootstrap state transitions regress after app updates.

## 5. Incident Notes Template

Capture this in issue or incident log:

1. Summary and impact (affected users, duration).
2. First observed timestamp and timezone.
3. Repro steps and current reproducibility.
4. Relevant endpoint + status/error codes.
5. Mitigation already applied.
6. Owner and follow-up action with ETA.
