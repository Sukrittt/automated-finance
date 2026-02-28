# UPI → Notion Tracker

Automates UPI expense tracking from Android SMS (GPay alerts) into Notion.

## 1) Notion setup
Create a database named `UPI Expenses` with properties:
- `Title` (title)
- `Amount` (number)
- `Date` (date)
- `Category` (select): Food, Travel, Shopping, Bills, Transfers, Health, Other
- `App` (select): GPay
- `UPI Ref` (rich text)
- `Sender` (rich text)
- `Raw SMS` (rich text)

Share the database with your Notion integration.

## 2) Deploy on Render
1. Push this folder to GitHub.
2. In Render: New + > Web Service > connect repo.
3. Root directory: `upi-tracker`
4. Render auto-detects `render.yaml`.
5. Add environment variables:
   - `NOTION_API_KEY`
   - `NOTION_DATABASE_ID`
   - `WEBHOOK_SECRET`

## 3) Test
Health check:
`GET https://<your-render-url>/health`

Sample POST:
```bash
curl -X POST https://<your-render-url>/sms \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <WEBHOOK_SECRET>" \
  -d '{
    "sender":"VM-HDFCBK",
    "message":"Rs.250 paid to SRI BALAJI STORES via UPI Ref No 1234567890",
    "timestamp": 1760000000000
  }'
```

## 4) Android SMS Forwarder rule
- Trigger: messages containing `UPI` + (`debited` or `paid` or `sent`)
- Action: HTTP POST to `https://<your-render-url>/sms`
- Headers: `x-webhook-secret: <WEBHOOK_SECRET>`
- Body fields: `sender`, `message`, `timestamp`

## Notes
- Duplicate prevention uses `UPI Ref` if present.
- Category is auto-inferred by merchant/message keywords.
- Adjust keyword rules in `inferCategory()` in `server.js`.
