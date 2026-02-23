# Coding Conventions

**Analysis Date:** 2026-02-23

## Naming Patterns

**Files:**
- PascalCase for components/screens: `DashboardScreen.tsx`, `OnboardingScreen.tsx`
- camelCase for services/utilities: `upiParser.ts`, `notificationIngestService.ts`
- `.test.ts` suffix for test files: `upiParser.test.ts`, `client.test.ts`

**Functions:**
- camelCase for all functions: `parseUpiNotification()`, `createNotificationIngestService()`
- Verb-noun pattern for actions: `startIngestRuntime()`, `stopIngestRuntime()`, `buildDedupeFingerprint()`
- `get`/`set` prefix for accessors: `getQueueSize()`, `getLatencyBaseline()`

**Variables:**
- camelCase: `latestNotification`, `deviceId`, `authToken`
- Private class properties prefixed with `this.`: `this.queue`, `this.pollIntervalMs`
- Boolean flags with `is`/`has`/`should` prefix: `isNotificationAccessEnabled`, `hasDeviceId`

**Types:**
- PascalCase: `ParsedUpiNotification`, `NotificationIngestDependencies`, `HttpError`
- Interface prefixes for services: `OtpAuthService`, `GoogleAuthService`, `AppAuthService`
- Union types for state: `type Tab = 'dashboard' | 'transactions' | 'review' | 'insights' | 'settings'`

## Code Style

**Formatting:**
- No explicit formatter configured (uses Expo/React Native defaults)
- 2-space indentation
- Single quotes for strings
- Trailing commas in objects/arrays

**Linting:**
- No explicit ESLint or Prettier config found in project
- TypeScript strict mode enforced via `tsconfig.json`

**Import Organization:**
1. External imports (React, Expo modules)
2. Internal type imports (`import type`)
3. Internal service imports (relative paths)
4. Config imports

Example from `src/services/ingest/notificationIngestService.ts`:
```typescript
import type { CapturedNotification } from '../notifications/nativeListener';
import { IngestOfflineQueue } from './offlineQueue';
import { mapCapturedNotificationToIngestEvent } from './payloadMapper';
import { postNotificationIngestBatch } from './api';
import type { IngestNotificationEvent } from './types';
import { createIngestHealthEnvelope, type RuntimeHealthReporter } from './healthTelemetry';
```

**Path Aliases:**
- Not detected - all imports use relative paths

## Error Handling

**Patterns:**
- Custom error classes extend `Error`: `class HttpError extends Error`
- Error codes as string constants: `HttpError(503, 'API_NOT_CONFIGURED', 'Missing EXPO_PUBLIC_API_BASE_URL')`
- Try/catch with early returns for optional operations

Example from `src/services/api/client.ts`:
```typescript
export class HttpError extends Error {
  status: number;
  code: string;
  field?: string;

  constructor(status: number, code: string, message: string, field?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

function normalizeError(status: number, payload?: unknown): HttpError {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const envelope = payload as ErrorEnvelope;
    return new HttpError(
      status,
      envelope.error?.code ?? 'INTERNAL_ERROR',
      envelope.error?.message ?? 'Request failed',
      envelope.error?.field
    );
  }
  return new HttpError(status, 'INTERNAL_ERROR', 'Request failed');
}
```

## Logging

**Framework:** Console-based with prefix

**Patterns:**
- Bracketed prefix for component identification: `console.error('[ingest-runtime]', envelope)`
- Health telemetry uses structured envelopes with levels: `info`, `warn`, `error`

Example from `src/services/ingest/healthTelemetry.ts`:
```typescript
export const defaultRuntimeHealthReporter: RuntimeHealthReporter = (envelope) => {
  if (envelope.level === 'error') {
    console.error('[ingest-runtime]', envelope);
    return;
  }
  if (envelope.level === 'warn') {
    console.warn('[ingest-runtime]', envelope);
    return;
  }
  console.log('[ingest-runtime]', envelope);
};
```

## Comments

**When to Comment:**
- Module-level documentation for exported functions: Present in CLAUDE.md
- Inline comments for complex regex patterns: Present in `upiParser.ts`
- Explanation of magic numbers: Present (e.g., `retentionMs = 6 * 60 * 60 * 1000`)

**JSDoc/TSDoc:**
- Not heavily used in source code
- TypeScript types serve as documentation

## Function Design

**Size:** 
- Single-responsibility functions preferred
- Large classes broken into private methods (e.g., `NotificationIngestService` has 10+ private methods)

**Parameters:**
- Dependency injection pattern: Services receive dependencies via constructor
- Options objects for optional parameters: `RequestOptions = { method, query, body, headers, token }`

Example from `src/services/ingest/notificationIngestService.ts`:
```typescript
type NotificationIngestDependencies = {
  isNotificationAccessEnabled: () => boolean;
  getLastCapturedNotification: () => CapturedNotification | null;
  subscribeToCapturedNotifications?: (listener: (notification: CapturedNotification) => void) => { remove: () => void };
  getDeviceId: () => string | null;
  getAuthToken?: () => string | undefined;
  queuePersistence?: IngestQueuePersistence;
  reportHealthEvent?: RuntimeHealthReporter;
  pollIntervalMs?: number;
};
```

**Return Values:**
- Explicit return types for public methods
- Nullable returns use `null` for "not found" or "not applicable"
- Async functions return `Promise<T>`

## Module Design

**Exports:**
- Named exports for services and utilities
- Factory functions for service creation: `createNotificationIngestService(deps)`
- Type exports alongside implementations

**Barrel Files:**
- `index.ts` files for public API: `src/services/auth/index.ts`, `src/components/index.ts`, `src/theme/index.ts`

**Class vs Function:**
- Classes for stateful services: `NotificationIngestService`, `HttpError`
- Functions for stateless utilities: `parseUpiNotification()`, `buildDedupeFingerprint()`

---

*Convention analysis: 2026-02-23*
