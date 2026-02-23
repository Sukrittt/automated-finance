# Project Research Summary

**Project:** Auto Finance
**Domain:** UPI Payment Tracking / Personal Finance Apps (India)
**Researched:** 2026-02-23
**Confidence:** HIGH

## Executive Summary

Auto Finance is an Android-only Expo React Native app that automatically tracks UPI spending in India by capturing payment notifications from GPay, PhonePe, Paytm, and other UPI apps. The app delivers weekly spending insights and uses Supabase for auth and a custom REST API backend.

**Recommended approach:** The existing architecture is sound—continue with Expo SDK 53, React Native, TypeScript, and Supabase. Add `@tanstack/react-query` for server state caching and `react-native-gifted-charts` for visualizations. The critical focus for roadmap must be **core reliability**: Android 15+ notification restrictions, battery optimization handling, and permission monitoring. These are table-stakes that will break the product if ignored.

**Key risks:**
1. Android 15+ hides sensitive notification content by default—users must manually disable "Enhanced notifications" in system settings
2. Battery optimization aggressively kills background services on Xiaomi/Samsung/OnePlus devices
3. UPI parser templates break silently when payment apps update
4. Duplicate transactions can slip through during offline sync

## Key Findings

### Recommended Stack

**Core technologies (existing, continue using):**
- **Expo SDK 53** + **React Native 0.79.x** — Pre-build tooling, native module support, excellent DX
- **TypeScript 5.8.x** — Strict mode catches errors early
- **Supabase 2.97.x** — Auth + PostgreSQL, excellent for financial data (ACID compliance)
- **Firebase 12.9.x** — Google Sign-In, industry standard for social auth in India

**Recommended additions:**
- **@tanstack/react-query** — For API data caching, background refetch, deduping (use instead of adding Redux)
- **react-native-gifted-charts** — Most complete RN chart library for expense visualization (pie, line, bar)
- **NativeWind** — Tailwind-style utility classes for consistent styling (optional)
- **date-fns** — Date formatting for Indian date formats

**Backend (separate repo):**
- Node.js/Express or Fastify + Prisma + PostgreSQL (Supabase or dedicated)

### Expected Features

**Must have (table stakes):**
- **Automatic transaction capture** — Core value prop; existing via NotificationListenerService
- **Transaction listing with filters** — Basic UX; existing TransactionsScreen
- **Category tagging** — Users need to understand spend patterns; manual first, AI assist later
- **Budget setting & alerts** — High value, low complexity; planned
- **Multi-app UPI parsing** — GPay, PhonePe, Paytm, BHIM; existing template-based parser
- **Offline queue with retry** — Network failures happen; existing exponential backoff
- **Deduplication** — FNV-1a fingerprint approach; existing

**Should have (competitive differentiators):**
- **Subscription tracking** — Detect recurring payments; highly requested in India
- **Smart merchant recognition** — Auto-detect "Swiggy" → Food
- **AI-powered auto-categorization** — ML model to classify merchant → category
- **Weekly spending insights** — Existing, enhance with charts

**Defer (v2+):**
- Credit card tracking (requires bank SMS parsing, different from UPI)
- Investment tracking (explicitly out of scope for v1)
- Family expense sharing (requires multi-user infrastructure)

### Architecture Approach

The architecture follows a **event-driven pipeline**: Android Notification → NotificationListenerService → Native Bridge → UPI Parser → Dedupe → Offline Queue → Backend API.

**Major components:**
1. **NotificationCaptureService** — Kotlin NotificationListenerService for system-wide notification capture
2. **UPI Parser** — Template-based pattern matching extracting amount, direction, merchant, ref
3. **NotificationIngestService** — Orchestrates polling, dedup, queue, retry with DI pattern
4. **Ingest Runtime** — Singleton lifecycle manager (starts on auth, stops on logout)

**Recommended structure:**
```
src/services/
├── categories/     # NEW: Transaction categorization
├── budgets/        # NEW: Budget management  
├── insights/       # NEW: Analytics engine
├── reviewQueue/    # NEW: Transaction review
├── auth/           # Existing
├── ingest/         # Existing
└── parsing/        # Existing
```

### Critical Pitfalls

1. **Android 15+ Notification Content Restrictions** — Payment notifications return "Sensitive notification content hidden" by default. Users must manually disable "Enhanced notifications" in hidden system settings. Must add explicit handling in native module.

2. **Battery Optimization Killing App** — Android Doze mode and manufacturer battery savers (Xiaomi, Samsung, OnePlus) aggressively kill background services. Must request battery exemption in-app with clear explanation.

3. **NotificationListenerService Permission Revoked** — Users unknowingly revoke notification access. Must show persistent in-app indicator and one-tap re-enable link.

4. **UPI Parser Fragility** — Payment app updates break template matching silently. Must implement parse confidence scoring and fallback to raw notification storage.

5. **Duplicate Transactions** — Race conditions during offline sync can create duplicates. Server-side idempotency keys (FNV-1a fingerprint) must be robust.

6. **Offline Queue Stale Data** — Queue grows indefinitely, syncing old irrelevant transactions. Must implement 7-day TTL and queue size limits.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Reliability & Polish
**Rationale:** The existing pipeline is solid but has Android 15+ and battery optimization gaps that will break the product. Must address before expanding features.

**Delivers:**
- Android 15+ notification handling (detect "Enhanced notifications" block, guide users)
- Battery optimization exemption flow with clear UX explanation
- Permission monitoring with persistent indicator and one-tap re-enable
- Parser confidence scoring to flag low-confidence parses

**Avoids:** Pitfalls #1, #2, #3, #4

### Phase 2: Transaction Management & Categorization
**Rationale:** Transactions are the foundation—other features depend on them. Categories are simpler than budgets and provide immediate value.

**Delivers:**
- Enhanced transaction list with filters (date, amount, category)
- Category service + API
- Auto-categorization rules engine
- Category management UI
- "Report wrong transaction" flow to capture raw notifications for parser improvement

**Uses:** @tanstack/react-query for API caching

**Implements:** `services/categories/` service layer

### Phase 3: Budgeting & Alerts
**Rationale:** Budgets need categories to track spending per category. High value, low complexity.

**Delivers:**
- Budget service + API
- Budget tracking logic (spend vs limit per category)
- Budget UI (set limits, view progress bars)
- Push notifications for over-budget alerts

**Implements:** `services/budgets/` service layer

### Phase 4: Insights & Visualization
**Rationale:** Insights aggregate all data—built last. Adds charts for differentiation.

**Delivers:**
- Spending analytics aggregation
- Charts (pie: category breakdown, line: trends, bar: monthly comparison)
- Weekly digest push notification
- react-native-gifted-charts integration

**Implements:** `services/insights/` service layer

### Phase 5: Advanced Features (v2)
**Rationale:** These require significant infrastructure or are out of scope for v1.

**Potential features:**
- Subscription tracking
- Smart merchant recognition (merchant DB)
- AI auto-categorization (ML model)
- Export to CSV
- Family expense sharing

### Phase Ordering Rationale

- **Core first:** Android 15+ restrictions and battery optimization are existential threats—fix before any feature work
- **Transactions before budgets:** Dependencies require transaction data first
- **Categories before budgets:** Budget tracking needs category breakdown
- **Insights last:** Depends on transactions, categories, and budgets data

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Core Reliability):** Native module changes for Android 15+ handling—may need Kotlin research
- **Phase 2 (Categorization):** ML model for auto-categorization if doing more than rule-based

Phases with standard patterns (skip research-phase):
- **Phase 2-4:** Well-documented React Native patterns, existing codebase provides patterns
- **Budgeting:** Standard CRUD with aggregation—supabase docs sufficient
- **Insights:** Standard analytics patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing proven stack; additions are well-documented libraries |
| Features | HIGH | Table stakes from competitor analysis; differentiators from India-specific market research |
| Architecture | HIGH | Existing pipeline follows standard patterns; research confirms architecture |
| Pitfalls | HIGH | Critical pitfalls verified with official Android docs and community sources |

**Overall confidence:** HIGH

### Gaps to Address

- **Android 15+ real device testing:** Need to verify notification capture works on Android 15+ with "Enhanced notifications" enabled. This is the #1 risk.

- **Parser template maintenance:** Template-based parser requires ongoing maintenance as payment apps update. Need process for users to report parsing failures.

- **Multi-device sync:** Not explicitly covered—need to handle if users install on multiple devices.

## Sources

### Primary (HIGH confidence)
- NPM: react-native-gifted-charts v1.4.71 — https://www.npmjs.com/package/react-native-gifted-charts
- Android 15 notification changes: https://developer.android.com/about/versions/15/behavior-changes-all
- Don't Kill My App (battery optimization): https://dontkillmyapp.com/google
- Android foreground service restrictions: https://developer.android.com/about/versions/14/changes/fgs-types-required

### Secondary (MEDIUM confidence)
- State management: "State Management in React Native: Context vs Zustand vs Redux" — https://www.mj-dev.in/blogs/state-management-react-native
- Budget Beacon: "Top Budgeting Apps for Indian Users in 2026" (Nov 2025)
- Jupiter Money, Moneyview: Product feature analysis

### Tertiary (LOW confidence)
- Android 15 notification listener issue: https://issuetracker.google.com/issues/374244468 (Google issue tracker, needs verification)

---

*Research completed: 2026-02-23*
*Ready for roadmap: yes*
