# Technology Stack

**Analysis Date:** 2026-02-23

## Languages

**Primary:**
- TypeScript 5.8.3 - All application code (src/, tests/)
- Kotlin 1.9.x - Native Android module (modules/notification-listener/)

**Secondary:**
- JavaScript (minimal) - Build config only (babel.config.js, jest.config.js)

## Runtime

**Environment:**
- React Native 0.79.0 via Expo SDK 53

**Package Manager:**
- npm (Node package manager)
- Lockfile: `package-lock.json` (not shown in exploration)

## Frameworks

**Core:**
- Expo SDK 53 - React Native framework with pre-build tooling
- React 19.0.0 - UI library

**Testing:**
- Jest 29.7.0 with jest-expo 53.0.7 preset
- react-test-renderer 19.0.0 - Component testing

**Build/Dev:**
- babel-preset-expo - Transpilation
- TypeScript 5.8.3 - Type checking (tsconfig.json extends expo/tsconfig.base)

## Key Dependencies

**Authentication & Auth:**
- @supabase/supabase-js 2.97.0 - Auth client for Supabase
- firebase 12.9.0 - Google Sign-In via Firebase Authentication
- expo-auth-session 6.2.1 - OAuth flow support
- expo-web-browser 6.2.0 - In-app browser for OAuth

**Storage & Files:**
- expo-file-system 18.1.11 - Local file storage
- expo-crypto 14.1.5 - Fingerprint hashing (FNV-1a for dedupe)

**Expo Core:**
- expo-constants 18.0.13 - App configuration access
- expo-status-bar 2.2.3 - Status bar control

**React Native:**
- react-native 0.79.0 - Core runtime

## Configuration

**Environment:**
- Runtime env via `EXPO_PUBLIC_*` prefix
- `src/config/env.ts` reads and normalizes all public env vars:
  - `EXPO_PUBLIC_APP_ENV` - dev/staging/production
  - `EXPO_PUBLIC_API_BASE_URL` - Backend API URL
  - `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
  - `EXPO_PUBLIC_AUTH_OTP_CHANNEL` - email (default) or phone
  - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` - OAuth web client ID
  - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` - OAuth Android client ID

**Build:**
- `app.json` - Expo configuration (package: com.automatedfinance.app)
- `tsconfig.json` - TypeScript config (strict mode enabled)
- `babel.config.js` - Babel preset (babel-preset-expo)
- `jest.config.js` - Test configuration (preset: jest-expo)

**Native Module:**
- Custom Expo module: `modules/notification-listener/`
- Android-only: NotificationListenerService for UPI notification capture
- Configuration via `expo-module.config.json`

## Platform Requirements

**Development:**
- Node.js (for npm, Expo CLI)
- Android SDK (for android builds)
- Expo CLI

**Production:**
- Android device (notification listener requires Android)
- Backend API (custom REST API)
- Supabase project
- Firebase project (for Google Sign-In)

---

*Stack analysis: 2026-02-23*
