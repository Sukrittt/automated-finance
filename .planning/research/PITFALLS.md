# Pitfalls Research

**Domain:** UPI Payment Tracking / Personal Finance Apps (India)
**Researched:** 2026-02-23
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Android 15+ Notification Content Restrictions

**What goes wrong:**
Starting with Android 15, notification listeners can no longer read the content of "sensitive" notifications by default. Payment app notifications (from GPay, PhonePe, Paytm, etc.) are classified as sensitive, returning "Sensitive notification content hidden" instead of actual notification text. This breaks the entire notification capture pipeline.

**Why it happens:**
Google tightened privacy controls in Android 15 to protect sensitive data (banking, payment, OTPs) from being read by notification listener apps. Users must manually disable "Enhanced notifications" in system settings to restore access.

**How to avoid:**
1. Add explicit handling for the "Sensitive notification content hidden" case in the native module
2. Guide users through the hidden system setting to disable enhanced notifications
3. Provide in-app detection of notification listener status and explicit instructions when blocked

**Warning signs:**
- Native module receives empty or placeholder text for payment notifications on Android 15+
- User reports transactions not being captured despite notification permission granted

**Phase to address:**
Notification Capture Enhancement Phase — must handle Android 15+ restrictions before expanding features

---

### Pitfall 2: App Killed by Battery Optimization

**What goes wrong:**
Android's Doze mode, App Standby, and battery optimization aggressively kill background processes. The NotificationListenerService stops receiving notifications when the app is in background, causing missed transactions.

**Why it happens:**
- Android 6+ introduced Doze mode that suspends background services when device is stationary/screen off
- Android 9+ Adaptive Battery can classify your app as "restricted" based on usage patterns
- Manufacturers (Xiaomi, Samsung, OnePlus, etc.) add aggressive battery savers that override AOSP behavior

**How to avoid:**
1. Request battery optimization exemption in-app with clear explanation to users
2. Use WorkManager with appropriate constraints for any background sync
3. Implement foreground service with proper type declaration for critical operations
4. Test on real devices from each major manufacturer — emulators don't replicate battery killing

**Warning signs:**
- Users report missing transactions after phone sits idle for several hours
- Inconsistent capture on different device brands
- Service appears to stop after app is backgrounded for extended period

**Phase to address:**
Core Reliability Phase — battery optimization handling is foundational

---

### Pitfall 3: NotificationListenerService Permission Revoked

**What goes wrong:**
Users unknowingly revoke notification access through Android settings, or it's reset after system updates. The app silently stops capturing transactions without any visible error to the user.

**Why it happens:**
- Android notification access is a system-level permission that can be revoked at any time
- Some device security scans or "cleanup" apps suggest revoking notification access
- System updates sometimes reset app permissions

**How to avoid:**
1. Implement runtime permission check before each capture session
2. Show persistent in-app indicator when notification access is missing
3. Provide one-tap re-enable link to system notification settings
4. Log and report permission state changes via health telemetry

**Warning signs:**
- suddenly missing all transactions from a particular date
- No new transactions despite user making payments
- Permission state check returns denied

**Phase to address:**
Core Reliability Phase — permission monitoring is foundational

---

### Pitfall 4: UPI Parser Fragility — App Updates Break Templates

**What goes wrong:**
When GPay, PhonePe, or Paytm update their app, the notification message format changes. The template-based parser fails silently, causing transactions to be captured but with wrong/empty amounts or merchant names.

**Why it happens:**
Payment apps frequently update their notification templates for new features, marketing, or UI changes. The parser templates are hardcoded and become stale.

**How to avoid:**
1. Implement parser confidence scoring — flag low-confidence parses for manual review
2. Build template versioning system with fallback to raw notification storage
3. Create user-facing "Report wrong transaction" that captures raw notification for analysis
4. Monitor parse failure rates and alert when they spike

**Warning signs:**
- Spike in transactions with Rs. 0 amount or "Unknown" merchant
- User complaints about incorrect amounts
- Parser test suite starts failing after payment app updates

**Phase to address:**
Parsing Enhancement Phase — needs ongoing maintenance, not one-time fix

---

### Pitfall 5: Duplicate Transactions from Race Conditions

**What goes wrong:**
When offline queue syncs after connectivity is restored, duplicate transactions may be created. The same notification gets processed multiple times due to retry logic overlapping with successful but delayed responses.

**Why it happens:**
- Network timeout triggers retry before confirming first request completed
- User opens app on multiple devices simultaneously
- Offline queue flush timing conflicts with normal polling

**How to avoid:**
1. Use server-side idempotency keys (FNV-1a fingerprint) — already implemented, verify robustness
2. Implement client-side deduplication with graceful handling of hash collisions
3. Add request-level locking to prevent concurrent sends of same fingerprint
4. Store fingerprint in local DB before sending to prevent reprocessing after app crash

**Warning signs:**
- Duplicate transactions appearing in user's transaction list
- API returns "duplicate" errors that aren't handled gracefully
- Users see same transaction twice with same timestamp

**Phase to address:**
Data Quality Phase — critical for user trust

---

### Pitfall 6: Offline Queue Stale Data

**What goes wrong:**
When device is offline for extended period (vacation, flight), the offline queue grows large. Upon reconnection, the queue flushes old transactions that are now irrelevant or cause confusion.

**Why it happens:**
- Queue doesn't distinguish between recent and stale transactions
- Exponential backoff keeps growing without bound
- No timestamp-based culling of old queue entries

**How to avoid:**
1. Implement queue TTL — discard transactions older than 7 days
2. Add "stale data" detection with user notification before flush
3. Implement queue size limits with oldest-first eviction
4. Consider batch timing based on transaction recency

**Warning signs:**
- Users see old transactions appearing days after they occurred
- Queue grows indefinitely in storage
- Sync takes very long after extended offline period

**Phase to address:**
Offline Sync Enhancement Phase

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded UPI app templates | Fast initial implementation | Break with every app update; requires app release to fix | Never — use configurable templates |
| In-memory fingerprint map | Simpler implementation | Lost on app restart, causes duplicates on reboot | Only for ephemeral sessions |
| No parse confidence scoring | Faster development | Wrong data silently enters system | Never — always score parses |
| Single hash algorithm for dedupe | Simplicity | Hash collisions cause missed duplicates | Never without collision handling |
| Ignoring battery optimization | Avoids complex UX | App silently stops working | Never — must guide users |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth | Assuming session persists across app reinstalls | Implement proper token refresh, handle session invalidation |
| Firebase Google Sign-In | Not handling ID token expiration | Implement proper token refresh flow, handle auth state changes |
| Backend API | Not handling 429 rate limits gracefully | Implement exponential backoff with jitter, queue requests |
| NotificationListener | Not handling service restart gracefully | Implement proper lifecycle management, re-initialize on service bind |
| WorkManager | Not declaring proper constraints | Match constraints to actual requirements, test edge cases |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Large fingerprint map in memory | Memory growth, O(n) lookup degradation | Use LRU cache with bounded size | At 10K+ pending fingerprints |
| Polling too frequently | Battery drain, API rate limits | Implement adaptive polling based on device state | On low-end devices |
| No pagination on transaction list | UI jank with large datasets | Implement virtualized list with pagination | At 1000+ transactions |
| Heavy regex on every notification | CPU spike, battery drain | Pre-compile regex, short-circuit on pattern mismatch | With high notification volume |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing raw notification data with PII | DPDPA/RBI compliance violation | Sanitize before storage, implement data retention policy |
| Logging full transaction details | Accidental PII exposure in crash logs | Use structured logging, exclude sensitive fields |
| Not encrypting local DB | Device compromise exposes financial data | Use encrypted storage (expo-crypto, secure store) |
| No rate limiting on ingestion API | DDoS, resource exhaustion | Implement backend rate limiting, client-side throttling |
| Missing session token rotation | Token theft enables account takeover | Implement token refresh, handle logout globally |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No feedback when capture fails | Users think app is broken | Show clear status, explain what to do |
| Asking for battery exemption without context | Users decline, app doesn't work | Show benefit: "Enable for automatic tracking" |
| Not handling "no transactions yet" state | Users think app is broken | Show helpful empty state with explanation |
| Transaction categories are wrong | Users lose trust | Allow easy recategorization, learn from corrections |
| Notifications too frequent | User disables app | Implement smart notification batching |

---

## "Looks Done But Isn't" Checklist

- [ ] **Notification capture:** Tested on Android 15 with "Enhanced notifications" enabled — verify hidden content handling
- [ ] **Parser:** Tested with latest GPay/PhonePe/Paytm app versions — verify template matching
- [ ] **Permission:** Handles revocation at runtime — verify re-detection works
- [ ] **Battery:** Tested on Xiaomi/Samsung/OnePlus with battery optimization ON — verify service stays alive
- [ ] **Offline:** Tested with 7+ days offline — verify stale queue handling
- [ ] **Dedupe:** Tested with simultaneous app opens — verify no duplicates
- [ ] **Parse confidence:** Tested with malformed notifications — verify graceful degradation
- [ ] **Auth:** Tested with expired tokens — verify refresh flow works

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Notification capture broken | HIGH | Guide user to settings, may need app update |
| Duplicate transactions | MEDIUM | Server-side dedupe cleanup, compensate user |
| Parser wrong amount | LOW | User correction updates category, ML improves |
| Stale queue sync | LOW | Clear queue, re-sync from last known good state |
| Auth token expired | LOW | Auto-refresh, fallback to re-login prompt |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Android 15 Notification Restrictions | Core Reliability | Test on Android 15+ device with enhanced notifications on |
| Battery Optimization Killing App | Core Reliability | Test on real Xiaomi/Samsung devices, verify after 1hr idle |
| Permission Revoked Silently | Core Reliability | Check permission state on app foreground |
| Parser Fragility | Parsing Enhancement | Monitor parse failure rate, have test suite for templates |
| Duplicate Transactions | Data Quality | Run concurrent sync test, verify idempotency |
| Offline Queue Stale Data | Offline Sync | Test with 7+ day offline period |
| Security PII Exposure | Security Hardening | Audit logs, data retention policy review |
| Poor UX Around Failures | UX Enhancement | User testing, feedback loop analysis |

---

## Sources

- Android 15 notification changes: https://developer.android.com/about/versions/15/behavior-changes-all
- Android 15 notification listener issue: https://issuetracker.google.com/issues/374244468
- Don't Kill My App (battery optimization): https://dontkillmyapp.com/google
- Android foreground service restrictions: https://developer.android.com/about/versions/14/changes/fgs-types-required
- RBI mobile banking security guidelines: https://blogs.bugsmirror.com/2024/10/how-to-comply-with-rbi-guidelines-on.html
- DPDPA + RBI intersection: https://www.dpdpa.com/blogs/dpdpa_banks_nbfcs_financial_data_protection.html
- UPI success rate issues: https://d91labs.substack.com/p/why-upi-success-rate-matters

---
*Pitfalls research for: UPI Payment Tracking / Personal Finance Apps (India)*
*Researched: 2026-02-23*
