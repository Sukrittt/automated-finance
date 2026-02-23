# Stack Research

**Domain:** UPI Payment Tracking / Personal Finance Apps in India
**Researched:** 2026-02-23
**Confidence:** HIGH

## Recommended Stack

### Core Technologies (Existing)

The project already uses a solid foundation. These are recommended to continue:

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Expo SDK 53 | 53.x | Mobile app framework | Pre-build tooling, native module support, excellent DX |
| React Native | 0.79.x | Core runtime | Stable, well-supported, large ecosystem |
| React | 19.x | UI library | Concurrent features, improved performance |
| TypeScript | 5.8.x | Type safety | Strict mode catches errors early |
| Supabase | 2.97.x | Auth + database | Excellent for auth, PostgreSQL is ideal for financial data |
| Firebase | 12.9.x | Google Sign-In | Industry standard for social auth in India |

### Enhancements Recommended

#### 1. Charts & Visualization

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-gifted-charts | ^1.4.x | Expense visualization | **Primary recommendation** — Most complete RN chart lib, supports pie/donut/line/bar, animations, 2D/3D |
| react-native-svg | latest | Chart rendering base | Required by most chart libraries |
| victory-native | ^41.x | Complex charting | For advanced financial charts if gifted-charts insufficient |

**Recommendation:** Use `react-native-gifted-charts` (v1.4.71 as of Feb 2026). It's the most popular RN chart library with 208 versions, actively maintained, and supports all chart types needed for expense tracking (pie charts for category breakdown, line charts for trends, bar charts for monthly comparison).

**Sources:**
- NPM: react-native-gifted-charts v1.4.71 (published Feb 9, 2026) — HIGH confidence
- LogRocket: "Top 10 React Native chart libraries for 2025" — MEDIUM confidence
- Reddit r/reactnative: Communityrecommendation — MEDIUM confidence

#### 2. State Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | ^5.x | Lightweight global state | **Recommended for medium complexity** — Simple API, ~1kb, no boilerplate |
| @tanstack/react-query | ^5.x | Server state/caching | **Recommended** — For API data, caching, deduping |
| Redux Toolkit | ^2.x | Complex global state | Only if app grows significantly in complexity |

**Recommendation:** The existing architecture uses Context API and module-level variables. For an app adding features like:
- Budget state across screens
- Cached transaction lists
- Real-time UI updates from notifications

**Use this approach:**
1. Keep Context for auth/theme (simple, low-frequency updates)
2. Add `@tanstack/react-query` for API data — automatic caching, background refetch, deduping
3. Add `zustand` only if you need complex client-side state (budgets, filters, offline queue UI)

**Why not Redux:** The existing DI pattern in `NotificationIngestService` already provides testability. Redux adds unnecessary boilerplate for this app size.

**Sources:**
- "State Management in React Native: Context vs Zustand vs Redux" (mj-dev.in, Oct 2025) — HIGH confidence
- "Zustand vs Redux Toolkit: Which should you use in 2026?" (Medium, Nov 2025) — MEDIUM confidence
- Reddit r/react: Community consensus — MEDIUM confidence

#### 3. UI Component Libraries

| Library | Purpose | When to Use |
|---------|---------|-------------|
| NativeWind + tailwindcss | Utility-first styling | **Recommended** — Tailwind for RN is mature, fast development |
| React Native Reusables | shadcn/ui-style components | Alternative for pre-built accessible components |
| react-native-paper | Material Design 3 | If Material look preferred |

**Recommendation:** Continue with custom components (existing in `src/components/`) but adopt **NativeWind** for styling consistency and faster development. The existing custom components are well-structured. NativeWind adds:
- Utility classes (faster than StyleSheet)
- Dark mode support
- Consistent spacing system

**For new screens:** Consider **React Native Reusables** (shadcn/ui port) — TypeScript-first, accessible, customizable. Works with NativeWind.

**Sources:**
- "React Native Reusables" official site — HIGH confidence
- "Nativecn UI" — shadcn-style template for RN (Oct 2025) — MEDIUM confidence

#### 4. Backend & Database (for custom REST API)

| Technology | Purpose | Why |
|------------|---------|-----|
| Supabase (existing) | Auth + database | Continue using for user management |
| PostgreSQL (Supabase) | Primary DB | Excellent for financial data — ACID, JSON support, row-level security |
| pgvector | Vector embeddings | If adding AI categorization later |
| Edge Functions | Serverless logic | For API endpoints that need backend logic |

**The existing custom REST API is the right approach.** Keep it separate from the mobile repo. For the API backend:

| Component | Recommendation | Why |
|----------|---------------|-----|
| Framework | Node.js/Express or Fastify | Mature, good ecosystem |
| ORM | Prisma | Type-safe, excellent PostgreSQL support |
| Database | PostgreSQL (Supabase or dedicated) | ACID compliance critical for finance |
| Validation | Zod | TypeScript-first, used with Prisma |

**Sources:**
- Industry best practices for fintech — MEDIUM confidence
- Supabase documentation — HIGH confidence

#### 5. India-Specific Services

| Service | Purpose | When to Use |
|---------|---------|-------------|
| Setu | UPI deeplinks | If adding UPI payments later |
| PayU | UPI SDK | Alternative for payments |
| NPCI | UPI infrastructure | For direct UPI integration |

**Note:** Not needed for tracking-only app. The notification capture approach is correct for passive tracking.

#### 6. Analytics & Insights

| Library | Purpose | When to Use |
|---------|---------|-------------|
| @react-native-async-storage/async-storage | Local persistence | Continue using expo-file-system for files, AsyncStorage for preferences |
| expo-notifications | Push notifications | For sending insights/alerts to users |

#### 7. Testing

| Library | Version | Purpose |
|---------|---------|---------|
| jest (existing) | 29.x | Unit testing |
| @testing-library/react-native | latest | Component testing |
| MSW | ^2.x | API mocking |

**Keep existing Jest setup.** Add `@testing-library/react-native` for component tests as UI grows.

---

## Supporting Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| date-fns | ^4.x | Date formatting for Indian date formats |
| uuid | ^11.x | Generate unique IDs |
| lodash | ^4.x | Utility functions (tree-shakeable) |
| react-native-safe-area-context | ^5.x | Safe area handling |
| react-native-gesture-handler | ^2.x | Gesture support for charts |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| Expo (existing) | Dev server, builds |
| npx expo prebuild | Generate android directory |
| VS Code + Expo extension | Debugging |
| Flipper | Native debugging (optional) |

---

## Installation

```bash
# Charts (recommended)
npm install react-native-gifted-charts react-native-svg

# State management
npm install @tanstack/react-query zustand

# Styling (if adopting NativeWind)
npm install nativewind tailwindcss

# Utilities
npm install date-fns uuid

# Testing
npm install -D @testing-library/react-native msw
```

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|------------------------|
| Charts | react-native-gifted-charts | victory-native | Need highly custom scientific charts |
| State | zustand | Redux Toolkit | Large team, complex reducers needed |
| Server State | react-query | SWR | Prefer Vue compatibility |
| Styling | Custom + NativeWind | React Native Paper | Need Material Design out-of-box |
| Auth | Supabase + Firebase | Clerk | Prefer managed auth UI |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| MobX | Over-engineered for this use case | zustand or react-query |
| Recoil | Unmaintained/archived | zustand or Jotai |
| Realm | Heavy, complex | Supabase (existing) |
| SQLite (direct) | Overkill for this app | Supabase + expo-file-system |
| Firebase Firestore | NoSQL not ideal for financial data | PostgreSQL via Supabase |
| iOS-targeted libs | This is Android-only | Verify RN libs work on Android |

---

## Stack Patterns by Variant

**If adding investment tracking:**
- Add `yfinance` or similar for stock prices (backend)
- Add chart library for portfolio visualization

**If adding AI categorization:**
- Add `pgvector` to Supabase for embeddings
- Use OpenAI API or self-hosted model for categorization

**If adding credit score:**
- Use Cibil/Experian API (backend) — not client-side

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| react-native-gifted-charts@1.4.x | RN 0.76+, Expo 53+ | Check native deps |
| @tanstack/react-query@5.x | React 18+, RN 0.71+ | Works with React 19 |
| zustand@5.x | React 18+, RN 0.71+ | Works with React 19 |
| NativeWind@4.x | Expo 48+, RN 0.71+ | Verify tailwindcss peer dep |

---

## Sources

- NPM: react-native-gifted-charts v1.4.71 — https://www.npmjs.com/package/react-native-gifted-charts
- State management: "State Management in React Native: Context vs Zustand vs Redux" — https://www.mj-dev.in/blogs/state-management-react-native
- Chart comparison: LogRocket "Top 10 React Native chart libraries for 2025" — https://blog.logrocket.com/top-react-native-chart-libraries/
- UI patterns: React Native Reusables — https://reactnativereusables.com/
- Fintech stack: INT Global "Best Fintech and Insurtech App Stacks in 2025" — https://intglobal.com/blogs/best-fintech-and-insurtech-app-stacks-in-2025/

---

*Stack research for: UPI Payment Tracking / Personal Finance Apps in India*
*Researched: 2026-02-23*
