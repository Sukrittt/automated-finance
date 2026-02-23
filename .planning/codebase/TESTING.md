# Testing Patterns

**Analysis Date:** 2026-02-23

## Test Framework

**Runner:**
- Jest 29.7.0
- Preset: `jest-expo` 53.0.7 (for Expo/React Native compatibility)
- Config: `jest.config.js`

**Assertion Library:**
- Jest built-in expect

**Run Commands:**
```bash
npm test                          # Run all tests
npm test -- --testPathPattern=<pattern>  # Run single test file
npm test -- --watch              # Watch mode
npm test -- --coverage           # Coverage report
npm run test:update              # Update snapshots
```

## Test File Organization

**Location:**
- Co-located in `tests/` directory mirroring `src/` structure
- Example: `src/services/parsing/upiParser.ts` → `tests/services/parsing/upiParser.test.ts`

**Naming:**
- Pattern: `*.test.ts` for unit tests, `*.test.tsx` for component tests
- Integration tests: `*.integration.test.ts`

**Structure:**
```
tests/
├── setup.ts                    # Global Jest setup
├── services/
│   ├── auth/
│   │   ├── firebaseAuth.test.ts
│   │   └── auth.integration.test.ts
│   ├── api/
│   │   ├── client.test.ts
│   │   └── v1.contract.test.ts
│   ├── parsing/
│   │   └── upiParser.test.ts
│   ├── ingest/
│   │   ├── notificationIngestService.test.ts
│   │   ├── payloadMapper.test.ts
│   │   └── offlineQueue.test.ts
│   ├── deduplication/
│   │   └── fingerprint.test.ts
│   └── notifications/
│       └── health.test.ts
└── ui/
    ├── screens.snapshot.test.tsx
    └── reviewQueue.states.test.tsx
```

## Test Structure

**Suite Organization:**
- `describe()` blocks for test suites
- `it()` or `test()` for individual test cases
- Clear, descriptive test names in sentence case

Example from `tests/services/parsing/upiParser.test.ts`:
```typescript
import { parseUpiNotification } from '../../../src/services/parsing/upiParser';

describe('parseUpiNotification', () => {
  it('parses gpay debit notification', () => {
    const parsed = parseUpiNotification({
      packageName: 'com.google.android.apps.nbu.paisa.user',
      notificationTitle: 'Google Pay',
      notificationBody: 'Paid ₹250 to ABC Store via UPI Ref 123456789012'
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.sourceApp).toBe('gpay');
    expect(parsed?.direction).toBe('debit');
    expect(parsed?.amountPaise).toBe(25000);
    expect(parsed?.merchantNormalized).toBe('abc store');
    expect(parsed?.upiRef).toBe('123456789012');
  });
});
```

**Patterns:**
- Setup: `beforeEach()` for test data and mocks
- Teardown: `afterEach()` with `jest.restoreAllMocks()` or `jest.resetAllMocks()`
- Shared fixtures defined inline or in separate files

Example from `tests/services/ingest/notificationIngestService.test.ts`:
```typescript
describe('NotificationIngestService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('ingests latest notification and skips duplicate payload', async () => {
    const postedAt = Date.parse('2026-02-22T10:41:23.000Z');
    const notification = {
      packageName: 'com.google.android.apps.nbu.paisa.user',
      title: 'Google Pay',
      body: 'Paid ₹250 to ABC Store via UPI Ref 123456789012',
      postedAt
    };

    const postSpy = jest
      .spyOn(ingestApi, 'postNotificationIngestBatch')
      .mockResolvedValue({...});
    // ... test body
  });
});
```

## Mocking

**Framework:** Jest's native mocking

**Patterns:**
- `jest.spyOn()` for mocking module exports
- `jest.fn()` for creating mock functions
- `jest.mock()` for module-level mocks (in setup.ts or inline)

**Module Mocks:**
- Global mocks in `tests/setup.ts`:
```typescript
jest.mock('expo-auth-session', () => ({
  AuthRequest: jest.fn().mockImplementation(() => ({
    promptAsync: jest.fn().mockResolvedValue({ type: 'success', params: { code: 'mock-code' } })
  })),
  fetchDiscoveryAsync: jest.fn().mockResolvedValue({...}),
  ResponseType: { Code: 'code', Token: 'token' },
  makeRedirectUri: jest.fn((options) => options?.redirectUri || 'https://mock-redirect.test')
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => [])
}));
```

**Inline Mocks:**
```typescript
const fetchMock = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
  global.fetch = fetchMock as unknown as typeof fetch;
  fetchMock.mockResolvedValue(mockJsonResponse({ ok: true }));
});
```

**What to Mock:**
- External API calls: `postNotificationIngestBatch`, `apiRequest`
- Native modules: `expo-auth-session`, `firebase`
- Time-dependent logic: Use fixed timestamps in tests

**What NOT to Mock:**
- Pure utility functions being tested
- Internal logic that is the subject of the test

## Fixtures and Factories

**Test Data:**
- Inline fixture objects within tests
- Shared test data defined at describe block level

Example from `tests/services/dedupe/fingerprint.test.ts`:
```typescript
describe('buildDedupeFingerprint', () => {
  const base = {
    sourceApp: 'gpay' as const,
    amountPaise: 25000,
    direction: 'debit' as const,
    merchantRaw: 'ABC Store',
    upiRef: '123456789012',
    txnAtISO: '2026-02-22T10:41:23.000Z'
  };

  it('produces stable fingerprint for equivalent merchant and reference formats', () => {
    const fpA = buildDedupeFingerprint(base);
    const fpB = buildDedupeFingerprint({
      ...base,
      merchantRaw: 'abc-store',
      upiRef: '1234-5678-9012',
      txnAtISO: '2026-02-22T10:41:58.000Z'
    });
    expect(fpA).toBe(fpB);
  });
});
```

**Location:**
- No separate fixture files detected
- Inline fixtures in test files

## Coverage

**Requirements:** None explicitly enforced

**View Coverage:**
```bash
npm test -- --coverage
```

## Test Types

**Unit Tests:**
- Focus: Individual functions, classes, services
- Example: `upiParser.test.ts`, `fingerprint.test.ts`, `client.test.ts`
- Characteristics: Fast, isolated, no external dependencies

**Integration Tests:**
- Focus: Auth flow integration
- Example: `auth.integration.test.ts`
- Characteristics: Uses mocked external services, tests multiple components

**E2E Tests:**
- Not detected in this codebase

## Common Patterns

**Async Testing:**
```typescript
it('emits health envelope when auth token is missing', async () => {
  const reportHealthEvent = jest.fn();
  jest.spyOn(ingestApi, 'postNotificationIngestBatch').mockResolvedValue({...});

  const service = new NotificationIngestService({
    // ... deps
    reportHealthEvent
  });

  await service.runOnce(postedAt);

  expect(reportHealthEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      component: 'ingest_runtime',
      event: 'auth_token_missing',
      level: 'warn'
    })
  );
});
```

**Error Testing:**
- Custom error class: `HttpError`
- Error handling tested via response scenarios

**Spies and Mocks:**
```typescript
const postSpy = jest
  .spyOn(ingestApi, 'postNotificationIngestBatch')
  .mockResolvedValue({ accepted: 1, deduped: 0, rejected: 0, transactions_created: 1, review_queue_added: 0 });

// Later assertions
expect(postSpy).toHaveBeenCalledTimes(1);
```

---

*Testing analysis: 2026-02-23*
