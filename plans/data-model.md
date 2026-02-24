# Data Model (Draft)

## Core tables
- users
- devices
- consents
- notification_events
- transactions
- categories
- merchant_rules
- corrections
- weekly_insights
- subscriptions

## Transaction fields (v1)
- id (uuid)
- user_id (uuid)
- capture_source (notification)
- source_app (gpay|phonepe|paytm|bhim|other)
- amount_paise (int)
- direction (debit|credit)
- merchant_raw (text)
- merchant_normalized (text)
- category_id (uuid nullable)
- parse_confidence (float)
- review_status (pending|confirmed|edited)
- txn_at (timestamp)
- upi_ref (text nullable)
- dedupe_fingerprint (text unique per user)

## Indexes
- idx_transactions_user_txn_at (`user_id`, `txn_at desc`)
- uniq_transactions_user_dedupe (`user_id`, `dedupe_fingerprint`)

## RLS notes
- Every row scoped to authenticated `user_id`
- Service role reserved for aggregation jobs only
