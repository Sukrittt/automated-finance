# Codebase Structure

**Analysis Date:** 2026-02-23

## Directory Layout

```
/project-root/
├── App.tsx                     # App entry point and navigation
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── jest.config.js             # Jest test config
├── babel.config.js             # Babel config
├── src/
│   ├── charts/                 # Chart components
│   ├── components/             # Reusable UI components
│   ├── config/                 # Configuration
│   ├── data/                   # Mock data
│   ├── screens/                # Screen components
│   ├── services/               # Business logic services
│   ├── theme/                  # Design tokens
│   └── types/                  # TypeScript types
├── modules/                    # Native Expo modules
│   └── notification-listener/ # Android notification capture
├── tests/                      # Test files (mirrors src/)
└── android/                    # Android native project
```

## Directory Purposes

**`src/services/`:**
- Purpose: Core business logic
- Contains: Auth, ingest, parsing, notifications, API, deduplication, device registration
- Key files: `ingest/notificationIngestService.ts`, `auth/appAuth.ts`, `api/client.ts`, `parsing/upiParser.ts`

**`src/screens/`:**
- Purpose: Screen-level UI components
- Contains: DashboardScreen, TransactionsScreen, ReviewQueueScreen, InsightsScreen, SettingsScreen, OnboardingScreen
- Key files: `index.ts` (barrel export)

**`src/components/`:**
- Purpose: Reusable UI primitives
- Contains: Button, Card, Chip, Input, Sheet, Stat, Text
- Key files: `index.ts` (barrel export)

**`src/charts/`:**
- Purpose: Chart visualization components
- Contains: BarChart, LineChart, DonutLegend
- Key files: None - direct exports

**`src/config/`:**
- Purpose: Application configuration
- Contains: Environment config (env.ts), Firebase config
- Key files: `env.ts` - reads EXPO_PUBLIC_* variables

**`src/theme/`:**
- Purpose: Design system tokens
- Contains: Theme tokens (colors, spacing, radius, typography, shadows, motion)
- Key files: `tokens.ts`, `index.ts`

**`src/types/`:**
- Purpose: TypeScript type definitions
- Contains: View model types
- Key files: `view-models.ts`

**`src/data/`:**
- Purpose: Mock/test data
- Contains: Mock data for development
- Key files: `mock.ts`

**`modules/notification-listener/`:**
- Purpose: Native Android notification capture
- Contains: Kotlin native module with NotificationListenerService
- Key files: `android/src/main/java/.../NotificationCaptureService.kt`

**`tests/`:**
- Purpose: Test files mirroring src/ structure
- Contains: Unit tests, integration tests, snapshot tests
- Key files: `setup.ts` (global test setup)

## Key File Locations

**Entry Points:**
- `App.tsx`: App entry point, renders screens, manages tab state
- `src/services/ingest/runtime.ts`: Ingest runtime lifecycle

**Configuration:**
- `src/config/env.ts`: Runtime environment variables
- `app.json`: Expo configuration (app name, slug, platform)
- `tsconfig.json`: TypeScript compiler options
- `jest.config.js`: Jest test runner configuration

**Core Logic:**
- `src/services/ingest/notificationIngestService.ts`: Main ingest orchestrator
- `src/services/parsing/upiParser.ts`: UPI notification parser
- `src/services/ingest/payloadMapper.ts`: Notification to API event mapper
- `src/services/api/client.ts`: HTTP client with Bearer auth
- `src/services/auth/appAuthService.ts`: Auth service factory

**Testing:**
- `tests/setup.ts`: Global test setup with env var fallbacks
- `tests/services/ingest/notificationIngestService.test.ts`: Ingest service tests
- `tests/services/parsing/upiParser.test.ts`: Parser tests

## Naming Conventions

**Files:**
- PascalCase for components/screens/services: `DashboardScreen.tsx`, `notificationIngestService.ts`
- camelCase for utilities: `fingerprint.ts`, `sessionToken.ts`

**Directories:**
- camelCase for directories: `src/services/`, `src/components/`, `src/charts/`
- kebab-case for module names: `notification-listener`

**Functions/Variables:**
- camelCase: `createAppAuthService`, `isNotificationAccessEnabled`
- PascalCase for classes: `NotificationIngestService`, `HttpError`

**Types:**
- PascalCase: `SourceApp`, `TransactionDirection`, `AuthSession`

## Where to Add New Code

**New Feature:**
- Primary code: `src/services/` (new subdirectory or file)
- Tests: `tests/services/`

**New Component/Module:**
- Implementation: `src/components/` (for UI) or `src/services/` (for logic)
- Tests: `tests/services/` or `tests/ui/`

**New Screen:**
- Implementation: `src/screens/NewScreen.tsx`
- Tests: `tests/ui/` for snapshot tests
- Export from: `src/screens/index.ts`

**New API Endpoint:**
- Client: `src/services/[feature]/api.ts`
- Tests: `tests/services/[feature]/api.test.ts`

**New Design Token:**
- Location: `src/theme/tokens.ts`
- Export from: `src/theme/index.ts`

**New Native Module:**
- Location: `modules/[module-name]/`
- Android: `modules/[module-name]/android/`
- iOS: (not used - Android only for notification listener)

## Special Directories

**`modules/`:**
- Purpose: Expo native modules (local CocoaPods)
- Generated: No (hand-written Kotlin)
- Committed: Yes

**`android/`:**
- Purpose: Generated Android native project
- Generated: Yes (by Expo prebuild)
- Committed: Yes (for build reproducibility)

**`ios/`:**
- Purpose: Generated iOS native project
- Generated: Yes (by Expo prebuild)
- Committed: Yes (for build reproducibility)

**`tests/ui/__snapshots__/`:**
- Purpose: Jest snapshot files
- Generated: Yes (by Jest)
- Committed: Yes (for diff review)

---

*Structure analysis: 2026-02-23*
