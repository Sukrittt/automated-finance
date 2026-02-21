# API Contracts (Draft v0.2)

## Conventions
- base path: `/v1`
- auth: `Authorization: Bearer <supabase_access_token>` on all user routes except OTP request/verify.
- id format: UUID v4 strings.
- time format: ISO-8601 UTC (`2026-02-21T10:00:00Z`).
- amount format: integer paise for storage/contracts; client may render INR.
- pagination: cursor-based with `next_cursor`.

## Error Envelope
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "phone_e164 is invalid",
    "field": "phone_e164"
  },
  "request_id": "c0f3b91d-8f3a-4d35-a340-9f8143766ef3"
}
```

### Common error codes
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `RATE_LIMITED`
- `CONFLICT_DEDUPE`
- `INTERNAL_ERROR`

## Auth

### `POST /v1/auth/request-otp`
Request:
```json
{
  "phone_e164": "+919876543210"
}
```
Response `200`:
```json
{
  "otp_session_id": "3f2f45d6-91bb-4f4c-9bd6-d5235ba2d733",
  "retry_after_seconds": 30
}
```
Notes:
- rate-limit by phone/device/IP.
- client should debounce and surface countdown.

### `POST /v1/auth/verify-otp`
Request:
```json
{
  "otp_session_id": "3f2f45d6-91bb-4f4c-9bd6-d5235ba2d733",
  "otp_code": "123456",
  "device": {
    "install_id": "37deae91-4a08-4f16-b4bc-fb8f9da62ad7",
    "platform": "android",
    "app_version": "0.1.0"
  }
}
```
Response `200`:
```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "expires_in_seconds": 3600,
  "user": {
    "id": "e18f58d3-8cd0-4f17-9f3e-e75495ad66cb",
    "phone_e164": "+919876543210"
  }
}
```

## Device

### `POST /v1/device/register`
Request:
```json
{
  "install_id": "37deae91-4a08-4f16-b4bc-fb8f9da62ad7",
  "platform": "android",
  "manufacturer": "Google",
  "model": "Pixel 8",
  "os_version": "15",
  "app_version": "0.1.0",
  "notification_permission": "granted",
  "listener_service_status": "enabled"
}
```
Response `200`:
```json
{
  "device_id": "c177438a-94a5-402f-abd9-2bc2e6f52b9d",
  "registered_at": "2026-02-21T10:00:00Z"
}
```

## Ingest

### `POST /v1/ingest/notifications/batch`
Request:
```json
{
  "device_id": "c177438a-94a5-402f-abd9-2bc2e6f52b9d",
  "events": [
    {
      "event_id": "8f3f3ab2-b87e-4c9a-bc0b-6f2fcd6a9d93",
      "source_app": "gpay",
      "received_at": "2026-02-21T09:59:12Z",
      "notification_title": "Paid to ABC Store",
      "notification_body": "You paid ₹250 to ABC Store via UPI Ref 123456789012",
      "raw_payload_hash": "sha256:abcd..."
    }
  ]
}
```
Response `200`:
```json
{
  "accepted": 1,
  "deduped": 0,
  "rejected": 0,
  "transactions_created": 1,
  "review_queue_added": 0
}
```
Notes:
- idempotent on `event_id` and/or normalized dedupe fingerprint.
- partial failures return `207` with per-item status (planned for v0.3 if needed).

## Transactions

### `GET /v1/transactions?cursor=<cursor>&limit=30&review_status=pending`
Response `200`:
```json
{
  "items": [
    {
      "id": "a8448fa7-872f-4f89-a07e-aeeb73e58e6f",
      "merchant": "ABC Store",
      "amount_paise": 25000,
      "direction": "debit",
      "category": "groceries",
      "txn_at": "2026-02-21T09:59:12Z",
      "source_app": "gpay",
      "review_status": "confirmed",
      "confidence": 0.96,
      "upi_ref": "123456789012"
    }
  ],
  "next_cursor": "eyJ0eG5fYXQiOiIyMDI2LTAyLTIwVDEwOjAwOjAwWiIsImlkIjoiLi4uIn0="
}
```

### `PATCH /v1/transactions/{id}`
Request:
```json
{
  "category": "food",
  "merchant_normalized": "ABC Store",
  "txn_at": "2026-02-21T09:59:12Z",
  "note": "Corrected from parser suggestion",
  "review_status": "edited"
}
```
Response `200`:
```json
{
  "id": "a8448fa7-872f-4f89-a07e-aeeb73e58e6f",
  "updated_at": "2026-02-21T10:05:10Z"
}
```

## Dashboard

### `GET /v1/dashboard/summary?from=2026-02-01&to=2026-02-21`
Response `200`:
```json
{
  "total_spend_paise": 1465500,
  "transaction_count": 128,
  "top_category": "food",
  "trend_delta_pct": 12.4,
  "time_range": {
    "from": "2026-02-01",
    "to": "2026-02-21"
  },
  "daily_spend": [
    { "date": "2026-02-20", "amount_paise": 45500 }
  ],
  "category_split": [
    { "category": "food", "amount_paise": 435000, "share_pct": 29.68 }
  ]
}
```

## Insights

### `GET /v1/insights/weekly?week_start=2026-02-16`
Response `200`:
```json
{
  "week_start": "2026-02-16",
  "status": "ready",
  "insight": {
    "summary": "Spending rose mainly due to food delivery and rides.",
    "top_leak": "Food delivery (+18% vs prior week)",
    "improvement_tip": "Set a 3-order cap this week to save ~₹600.",
    "projected_monthly_overrun_paise": 240000,
    "win_highlight": "Groceries were down 9% week-over-week."
  },
  "generated_at": "2026-02-21T10:00:00Z"
}
```
Pending response `200`:
```json
{
  "week_start": "2026-02-16",
  "status": "pending",
  "eta_seconds": 45
}
```

## Privacy

### `POST /v1/privacy/delete-account`
Request:
```json
{
  "confirm_text": "DELETE",
  "delete_reason": "no_longer_needed"
}
```
Response `202`:
```json
{
  "status": "scheduled",
  "deletion_at": "2026-02-28T10:00:00Z"
}
```

### `GET /v1/privacy/export`
Response `202`:
```json
{
  "status": "queued",
  "export_job_id": "1c60a2f0-7565-4d43-b826-726972e9fcc7"
}
```
Follow-up status endpoint candidate:
- `GET /v1/privacy/export/{export_job_id}`

## View Models
### DashboardSummaryVM
- required: `totalSpend`, `transactionCount`, `topCategory`, `trendDeltaPct`, `timeRange`
- optional: `savingsRatePct`, `topMerchant`, `insightsBadge`
- empty behavior: show onboarding-style insight card and permission/check-sync CTA.

### TransactionListItemVM
- required: `id`, `merchant`, `amount`, `direction`, `category`, `txnAtISO`, `sourceApp`
- optional: `confidence`, `note`, `upiRef`
- empty behavior: show "No transactions yet" with permission and source app hints.

### ReviewQueueItemVM
- required: `id`, `rawMerchant`, `extractedAmount`, `suggestedCategory`, `confidence`
- optional: `parsedDateISO`, `sourceTextPreview`
- empty behavior: show "All clear" state with next sync timestamp.

### WeeklyInsightVM
- required: `weekStartISO`, `summary`, `topLeak`, `improvementTip`
- optional: `projectedMonthlyOverrun`, `winHighlight`
- empty behavior: show pending generation state and sample insight format.
