# Architecture Research

**Domain:** UPI Payment Tracking / Personal Finance Apps (India)
**Researched:** 2026-02-23
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │Dashboard │  │Transactions│ │ Insights │  │ Settings │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
└───────┼──────────────┼─────────────┼─────────────┼────────┘
        │              │             │             │
┌───────┴──────────────┴─────────────┴─────────────┴────────┐
│                     Service Layer                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Auth Service │  │Ingest Service│  │ Transaction API  │ │
│  └──────────────┘  └──────┬───────┘  └────────┬─────────┘ │
│                           │                    │            │
│  ┌──────────────┐  ┌──────┴───────┐  ┌────────┴─────────┐ │
│  │ Device Reg   │  │  UPI Parser   │  │  Category Engine │ │
│  └──────────────┘  └───────────────┘  └──────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                           │
┌───────────────────────────┴─────────────────────────────────┐
│                   Data/Ingest Pipeline                        │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────┐   ┌───────────┐   ┌───────────┐  ┌─────────┐ │
│  │Native List│ → │   Parser  │ → │  Dedup    │→ │OfflineQ │ │
│  │  ener     │   │ (Template)│   │(FNV-1a)   │  │ +Retry  │ │
│  └───────────┘   └───────────┘   └───────────┘  └────┬────┘ │
│                                                      │       │
└──────────────────────────────────────────────────────┼───────┘
                                                       │
┌──────────────────────────────────────────────────────┼───────┐
│                     API/Backend                        │       │
├──────────────────────────────────────────────────────┼───────┤
│                     REST API                          │       │
│              (Custom backend via Supabase)           │       │
└──────────────────────────────────────────────────────┴───────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| NotificationCaptureService | System-wide notification capture on Android | Kotlin NotificationListenerService |
| NativeListenerBridge | Thin JS wrapper around native module | TypeScript re-exports |
| UPI Parser | Extract amount, direction, merchant from notifications | Template-based pattern matching |
| Payload Mapper | Convert to ingest event, build fingerprint | FNV-1a hash for dedupe |
| NotificationIngestService | Orchestrate polling, dedup, queue, retry | DI pattern with external deps |
| Ingest Runtime | Lifecycle management (start/stop on auth) | Singleton manager |
| Auth Service | OTP + Google Sign-In, session management | Supabase + Firebase |
| API Client | Typed HTTP with Bearer token | fetch wrapper |
| Category Engine | Auto-categorize transactions (new) | Rule-based or ML |
| Budget Service | Track spending vs limits (new) | Aggregates + thresholds |
| Insights Engine | Generate spending insights (new) | Aggregation queries |

## Recommended Project Structure

```
src/
├── services/
│   ├── auth/              # Authentication (existing)
│   ├── ingest/           # Notification pipeline (existing)
│   │   ├── runtime.ts    # Lifecycle management
│   │   ├── notificationIngestService.ts
│   │   ├── payloadMapper.ts
│   │   ├── offlineQueue.ts
│   │   └── types.ts
│   ├── parsing/          # UPI parsing (existing)
│   │   └── upiParser.ts
│   ├── notifications/   # Native listener (existing)
│   │   └── nativeListener.ts
│   ├── dedupe/          # Deduplication (existing)
│   │   └── fingerprint.ts
│   ├── api/             # HTTP client (existing)
│   │   └── client.ts
│   ├── categories/      # NEW: Transaction categorization
│   │   ├── api.ts       # Category CRUD
│   │   ├── rules.ts     # Auto-categorization rules
│   │   └── types.ts
│   ├── budgets/         # NEW: Budget management
│   │   ├── api.ts
│   │   ├── tracker.ts
│   │   └── types.ts
│   ├── insights/        # NEW: Analytics engine
│   │   ├── api.ts
│   │   ├── aggregator.ts
│   │   └── types.ts
│   ├── reviewQueue/     # NEW: Transaction review
│   │   ├── api.ts
│   │   └── types.ts
│   └── transactions/    # Transaction queries
│       └── api.ts
├── screens/             # UI screens
├── components/         # Reusable UI
├── config/             # Environment
└── storage/           # Local persistence
```

### Structure Rationale

- **`services/categories/`, `services/budgets/`, `services/insights/`:** New feature domains as top-level service folders, mirroring existing pattern (e.g., `services/ingest/`)
- **`services/*/api.ts`:** Each feature has API module for backend communication
- **`services/*/types.ts`:** Shared types colocated with feature
- **`services/*/rules.ts`, `aggregator.ts`:** Business logic separated from API

## Architectural Patterns

### Pattern 1: Event-Driven Pipeline

**What:** Data flows through sequential stages (capture → parse → map → ingest)
**When to use:** Core notification processing
**Trade-offs:** Simple to understand; adding stages requires pipeline modification

**Example:**
```typescript
// Pipeline stage interface
interface PipelineStage<TInput, TOutput> {
  process(input: TInput): Promise<TOutput>;
}

// Chaining stages
const pipeline = [
  captureStage,
  parseStage,
  dedupStage,
  ingestStage,
];
```

### Pattern 2: Dependency Injection for Services

**What:** External dependencies (auth, device ID, storage) injected via object
**When to use:** Ingest service, any service needing testability
**Trade-offs:** More setup; enables easy mocking for tests

**Example:**
```typescript
interface IngestDeps {
  getAuthToken: () => Promise<string | null>;
  getDeviceId: () => Promise<string>;
  getNotifications: () => Promise<CapturedNotification[]>;
  persistQueue: (queue: QueuedEvent[]) => Promise<void>;
  apiRequest: typeof apiRequest;
}

function createIngestService(deps: IngestDeps) {
  return new NotificationIngestService(deps);
}
```

### Pattern 3: Singleton Runtime

**What:** Single instance manages lifecycle (start/stop based on auth state)
**When to use:** Background services like notification ingest
**Trade-offs:** Simple lifecycle; harder to test multi-instance scenarios

**Example:**
```typescript
let runtimeInstance: IngestRuntime | null = null;

export function startIngestRuntime(deps: RuntimeDeps) {
  if (runtimeInstance) return runtimeInstance;
  runtimeInstance = new IngestRuntime(deps);
  return runtimeInstance.start();
}
```

### Pattern 4: Offline Queue with Exponential Backoff

**What:** Failed requests queued locally, retried with increasing delays
**When to use:** Network unreliable (India mobile networks)
**Trade-offs:** Increases complexity; critical for reliability

**Example:**
```typescript
const retryDelays = [1000, 2000, 4000, 8000, 16000]; // exponential
async function processWithRetry(item: QueueItem): Promise<void> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await apiRequest(item.payload);
      return;
    } catch (e) {
      await sleep(retryDelays[attempt]);
    }
  }
  // Move to dead letter queue after all retries
}
```

## Data Flow

### Core Notification Flow

```
[Android Notification]
    ↓
[NotificationListenerService] ──events──→ [JS Native Bridge]
    ↓
[UPI Parser] (template matching, extract: amount, direction, merchant, ref)
    ↓
[Payload Mapper] (build FNV-1a fingerprint, create MappedIngestEvent)
    ↓
[Dedupe Check] (in-memory fingerprint map)
    ↓
[Offline Queue] (if online: send immediately; if offline: queue)
    ↓
[API Request] (POST /events with Bearer token)
    ↓
[Backend Processing]
```

### New Feature Integration Flow

```
[Transactions from API]
    ↓
[Category Engine] ──rules──→ Auto-categorized
    ↓
[Budget Tracker] ──compare──→ Budget status (under/over)
    ↓
[Insights Aggregator] ──compute──→ Spending insights
    ↓
[UI Screens] (display categorized transactions, budgets, charts)
```

### State Management

| State | Location | Management |
|-------|----------|------------|
| Auth session | `sessionToken.ts` (module var) | Auth service |
| Notification queue | `NotificationIngestService` (memory) | Ingest service |
| Offline queue | `AsyncStorage` (persisted) | Queue persistence |
| Transactions | Backend + API cache | React Query / SWR |
| UI state | Screen components | React state |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolith fine; single backend instance |
| 1k-100k users | Add connection pooling; consider read replicas |
| 100k+ users | Shard by user ID; add caching layer (Redis) |

### Scaling Priorities

1. **First bottleneck:** API response time under load — optimize queries, add indexing
2. **Second bottleneck:** Notification processing throughput — batch inserts, async workers
3. **Third bottleneck:** Read traffic — add caching, CDN for static assets

## Anti-Patterns

### Anti-Pattern 1: Direct Native Module Imports

**What people do:** Import directly from native module throughout codebase
**Why it's wrong:** Couples all code to Android-specific implementation; iOS requires different paths
**Do this instead:** Use thin wrapper (`nativeListener.ts`) that re-exports; components import from wrapper

### Anti-Pattern 2: Storing Amounts as Floats

**What people do:** Store amounts as `number` (rupees) with decimal places
**Why it's wrong:** Floating-point precision errors (e.g., 100.00 + 0.01 !== 100.01)
**Do this instead:** Store as integer paise (1 INR = 100 paise); convert only at display

### Anti-Pattern 3: No Deduplication

**What people do:** Send every notification to backend without dedupe check
**Why it's wrong:** Duplicate transactions; inflated spending reports
**Do this instead:** Use fingerprint hash (FNV-1a) of canonical fields; check before sending

### Anti-Pattern 4: Blocking UI on Network

**What people do:** Await API responses before updating UI
**Why it's wrong:** Poor UX on slow connections; app appears frozen
**Do this instead:** Optimistic updates; queue locally; sync in background

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase | Auth provider | Email/phone OTP |
| Firebase | Google Sign-In | ID token exchange |
| Custom Backend | REST API | Event ingestion, transactions |
| Android OS | NotificationListenerService | System permission required |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Native Module ↔ JS | Event emitter | NotificationEventStore |
| Ingest Service ↔ API | Function calls | apiRequest wrapper |
| Screens ↔ Services | React hooks | Custom hooks per feature |
| Runtime ↔ App | Lifecycle callbacks | useEffect with deps |

## Build Order Implications

```
Phase 1: Core Pipeline (existing)
├── Notification capture (native + JS bridge)
├── UPI parsing (template-based)
├── Deduplication (fingerprint)
├── Offline queue (with retry)
└── Auth (OTP + Google)

Phase 2: Transaction Management (NEW)
├── Transaction API / storage
├── Transaction list screen
└── Transaction detail/edit

Phase 3: Categorization (NEW)
├── Category service + API
├── Auto-categorization rules
├── Category management UI
└── Integrate with transaction view

Phase 4: Budgeting (NEW)
├── Budget service + API
├── Budget tracking logic
├── Budget UI (set limits, view progress)
└── Alerts/notifications for over-budget

Phase 5: Insights (NEW)
├── Insights aggregation
├── Spending analytics
├── Insights UI (charts, reports)
└── Weekly digest (push notifications)
```

**Rationale:**
- Core pipeline must work before anything else (existing)
- Transactions are foundation — other features depend on them
- Categories require transactions but are simpler than budgets
- Budgets need categories to track spending per category
- Insights aggregate all data — built last

## Sources

- Android Architecture Recommendations (2025): https://developer.android.com/topic/architecture/recommendations
- Expense Tracker Android (similar app): https://github.com/atick-faisal/Expense-Tracker-Android
- Offline-first Mobile Architecture: https://kawaldeepsingh.medium.com/mobile-first-architecture-building-offline-first-apps-for-low-connectivity-environments-6b38587c4047
- Personal Finance App Trends 2026: https://useorigin.com/resources/blog/the-best-personal-finance-budgeting-tools-for-2026
- UPI System Design: https://dev.to/zeeshanali0704/system-design-upi-unified-payment-interface-2ng3

---
*Architecture research for: UPI Payment Tracking / Personal Finance*
*Researched: 2026-02-23*
