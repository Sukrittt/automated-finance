# Automated Finance

Android-first React Native (Expo) app for automatic UPI expense tracking with minimal manual work.

## Current scope
- U0 UI research and design spec
- U1 app-wide tokenized theme + reusable component primitives
- U1 baseline screens for onboarding, dashboard, transactions, review queue, insights, settings
- U2 minimal chart grammar (bar, line, donut-legend)

## Project docs
- plans/master-plan.md
- plans/current-sprint.md
- plans/backlog.md
- plans/decision-log.md
- plans/ui-research.md
- plans/design-system.md
- plans/ui-task-board.md
- plans/screen-specs.md
- plans/api-contracts.md
- plans/data-model.md
- plans/test-plan.md

## Run
1. Create env file: `cp .env.example .env`
2. Fill Supabase vars in `.env`
3. Install dependencies: `npm install`
4. Start Expo: `npm run start`
5. Press `a` for Android emulator/device

## Environment variables
- `EXPO_PUBLIC_APP_ENV`: `development|staging|production` (default: `development`)
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key

## Notes
- Expo only exposes client vars prefixed with `EXPO_PUBLIC_`.
- Supabase runtime config lives in `src/config/env.ts` and `src/services/supabase/config.ts`.
