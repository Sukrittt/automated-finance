# Codebase Concerns

**Analysis Date:** 2026-02-23

## Tech Debt

**Session Token Storage:**
- Issue: Auth token stored in module-level variable in `src/services/auth/sessionToken.ts` (line 3)
- Files: `src/services/auth/sessionToken.ts`
- Impact: Token is lost on app restart; not stored in secure storage; could be accessed by malicious code with same-module access
- Fix approach: Use Expo SecureStore or React Native Keychain for token persistence

**Hardcoded Device ID Fallback:**
- Issue: Device ID defaults to `'local-device'` string when env var is missing
- Files: `src/services/ingest/runtime.ts` (line 31)
- Impact: Multiple devices could collide to same ID, causing duplicate transaction ingestion; no actual device identification
- Fix approach: Require device registration before enabling ingest; fail fast if no valid device ID

**Silent Error Swallowing in Auth Sign-Out:**
- Issue: Empty catch block in `firebaseAuth.ts` line 110 silently swallows errors during Firebase sign-out
- Files: `src/services/auth/firebaseAuth.ts` (line 110)
- Impact: Errors during sign-out are never reported; user may think they're signed out when they're not
- Fix approach: Log errors at minimum, or retry sign-out with Supabase only if Firebase fails

**Non-Retryable Errors Treated as Retryable:**
- Issue: In `offlineQueue.ts` line 213, any error that isn't an HttpError is treated as retryable
- Files: `src/services/ingest/offlineQueue.ts` (line 213)
- Impact: Network timeout, parse errors, and client-side failures will retry indefinitely until maxAttempts, wasting resources
- Fix approach: Explicitly identify retryable vs non-retryable error types

**Regex Fragility in UPI Parser:**
- Issue: Parser relies on regex patterns that match specific notification formats; any format change by UPI apps breaks parsing
- Files: `src/services/parsing/upiParser.ts` (lines 183-204)
- Impact: Merchant names may be null for transactions, causing notifications to be ignored
- Fix approach: Add fallback merchant extraction; report parsing failures for analysis

## Known Bugs

**Queue Persistence Fails Silently:**
- Issue: Errors in `queuePersistence.ts` lines 105-107 are caught and return empty array, losing queue data
- Files: `src/services/ingest/queuePersistence.ts` (lines 102-107)
- Trigger: Corrupted queue file, permission issues, or JSON parse errors
- Workaround: Queue rebuilds from empty; transactions are lost

**Auth Token Null Check in API Client:**
- Issue: If token is null/undefined, Authorization header is omitted but request proceeds
- Files: `src/services/api/client.ts` (lines 79-80)
- Trigger: Calling API endpoints without valid token
- Workaround: Backend returns 401; client should check token existence before calling

## Security Considerations

**Insecure Token Storage:**
- Risk: Token in module variable can be accessed by any code in the same module scope
- Files: `src/services/auth/sessionToken.ts`
- Current mitigation: None
- Recommendations: Move to secure storage (Expo SecureStore)

**Client-Side Install ID Generation:**
- Risk: Install ID generated client-side can be manipulated; no verification of device authenticity
- Files: `src/services/device/register.ts` (lines 31-36)
- Current mitigation: Backend assigns device_id after registration
- Recommendations: Use device hardware identifiers with user consent

**No API Request Signing:**
- Risk: Requests can be replayed; no request timestamp/nonce validation
- Files: `src/services/api/client.ts`
- Current mitigation: HTTPS only (assumed)
- Recommendations: Add request signing or timestamps with expiry

## Performance Bottlenecks

**Unbounded Memory Growth in Latency Tracking:**
- Problem: `latencyByEventId` Map in `NotificationIngestService` never prunes entries
- Files: `src/services/ingest/notificationIngestService.ts` (line 95)
- Cause: Events tracked indefinitely; visibleAtMs set but entry never removed
- Improvement path: Add periodic cleanup of old latency entries (e.g., after 24 hours)

**Unbounded Fingerprint Map:**
- Problem: `seenFingerprints` Map grows during 6-hour retention window without size limit
- Files: `src/services/ingest/notificationIngestService.ts` (line 77)
- Cause: Pruning only removes entries older than 6 hours; no max size enforcement
- Improvement path: Add max entries cap (e.g., 10,000 fingerprints)

**Polling Interval Not Adaptive:**
- Problem: Fixed 3-second poll interval regardless of notification activity
- Files: `src/services/ingest/notificationIngestService.ts` (line 100)
- Cause: No adaptive polling based on volume
- Improvement path: Reduce poll interval when new notifications detected; increase when idle

## Fragile Areas

**UPI Template Matching:**
- Files: `src/services/parsing/upiParser.ts`
- Why fragile: Template scoring relies on package hints and keyword hints; if UPI apps change package names or notification text, parsing fails silently
- Safe modification: Add new templates for emerging UPI apps; don't modify existing template regexes without testing
- Test coverage: Only basic parsing tests exist; no tests for template selection edge cases

**Notification Signature Deduplication:**
- Files: `src/services/ingest/notificationIngestService.ts` (lines 381-388)
- Why fragile: Signature includes `postedAt` timestamp which may be null/undefined; notification title/body changes could cause false positives
- Safe modification: Use stable identifiers (notification ID) if available
- Test coverage: Single duplicate test exists

**Error Normalization:**
- Files: `src/services/api/client.ts` (lines 58-70)
- Why fragile: Assumes all error responses follow `{ error: { code, message } }` format; non-conforming errors lose details
- Safe modification: Add fallback error parsing for unexpected formats

## Scaling Limits

**Single Device Queue:**
- Current capacity: One offline queue per device instance
- Limit: No multi-device sync; queue resets per app install
- Scaling path: Implement queue merging or server-side state

**In-Memory Session:**
- Current capacity: Single session stored in memory
- Limit: App restart clears session; user must re-authenticate
- Scaling path: Persist session securely

**Batch Size Cap:**
- Current capacity: 20 events per flush batch (line 90 in offlineQueue.ts)
- Limit: Large notification volumes may lag behind
- Scaling path: Increase batch size or implement parallel flushes

## Dependencies at Risk

**Firebase SDK:**
- Risk: Version 12.9.0 (from package.json line 24) - major version with potential breaking changes
- Impact: Auth failures if Firebase deprecates current APIs
- Migration plan: Pin to specific version; monitor Firebase deprecation notices

**Expo SDK:**
- Risk: Version ~53.0.0 - major version requiring Expo Go compatibility
- Impact: Native module compatibility issues during upgrades
- Migration plan: Test thoroughly with Expo Go before production upgrade

**Supabase-js:**
- Risk: Version 2.97.0 (package.json line 16)
- Impact: Auth flow breakage if auth methods change
- Migration plan: Review changelog before upgrading

## Missing Critical Features

**Token Refresh Handler:**
- Problem: No explicit token refresh logic; relies on Supabase auto-refresh
- Blocks: Long-running background tasks may fail after token expiry

**Offline Queue Size Limits:**
- Problem: No maximum queue size; could consume excessive storage
- Blocks: Device storage exhaustion on very long offline periods

**Notification Permission Detection:**
- Problem: Only checks if notification access is enabled, not specific permission states
- Blocks: Granular permission handling for different notification types

## Test Coverage Gaps

**Auth Flow Integration:**
- What's not tested: Full auth flow with actual Supabase backend
- Files: `src/services/auth/*`
- Risk: Auth failures only discovered in production
- Priority: High

**Native Module Bridge:**
- What's not tested: JS-native communication for notifications
- Files: `src/services/notifications/nativeListener.ts`
- Risk: Notification capture fails silently on device
- Priority: High

**Queue Persistence:**
- What's not tested: File system edge cases (corruption, permission denied)
- Files: `src/services/ingest/queuePersistence.ts`
- Risk: Data loss on persistence failure
- Priority: Medium

**UPI Parser Real-World Notifications:**
- What's not tested: Actual notifications from all supported UPI apps
- Files: `src/services/parsing/upiParser.ts`
- Risk: Parsing failures for valid transactions
- Priority: High

**E2E Scenarios:**
- What's not tested: Full user journey (install → auth → notification → transaction)
- Risk: Integration issues between services
- Priority: Medium

---

*Concerns audit: 2026-02-23*
