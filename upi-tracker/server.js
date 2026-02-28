require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NOTION_DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID || process.env.NOTION_DATABASE_ID;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
  console.warn('Missing NOTION_API_KEY or NOTION_DATABASE_ID');
}

function parseAmount(text) {
  const m = text.match(/(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!m) return null;
  return Number(m[1].replace(/,/g, ''));
}

function parseUpiRef(text) {
  const patterns = [
    /UPI\s*Ref(?:\s*No\.?|erence)?\s*[:\-]?\s*([A-Za-z0-9]+)/i,
    /UTR\s*[:\-]?\s*([A-Za-z0-9]+)/i,
    /Ref(?:erence)?\s*No\.?\s*[:\-]?\s*([A-Za-z0-9]+)/i,
    /(?:txn|transaction)\s*id\s*[:\-]?\s*([A-Za-z0-9]+)/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseMerchant(text) {
  const patterns = [
    /(?:paid to|sent to|towards)\s+([A-Za-z0-9 .,&@_-]{2,60})/i,
    /to\s+([A-Za-z0-9 .,&@_-]{2,60})\s+on/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return 'Unknown Merchant';
}

function inferCategory(merchant, text) {
  const value = `${merchant} ${text}`.toLowerCase();
  if (/swiggy|zomato|restaurant|cafe|coffee|food|eat/.test(value)) return 'Food';
  if (/uber|ola|metro|bus|fuel|petrol|diesel|irctc|travel/.test(value)) return 'Travel';
  if (/electricity|bill|recharge|broadband|wifi|rent|insurance/.test(value)) return 'Bills';
  if (/pharmacy|hospital|clinic|health/.test(value)) return 'Health';
  if (/amazon|flipkart|myntra|shopping|store/.test(value)) return 'Shopping';
  if (/self|transfer|bank|wallet/.test(value)) return 'Transfers';
  return 'Other';
}

async function notionRequest(path, method = 'GET', body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2025-09-03',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API ${res.status}: ${text}`);
  }
  return res.json();
}

async function isDuplicate(upiRef) {
  if (!upiRef) return false;
  const q = {
    filter: {
      property: 'UPI Ref',
      rich_text: { equals: upiRef }
    },
    page_size: 1
  };
  const data = await notionRequest(`/data_sources/${NOTION_DATA_SOURCE_ID}/query`, 'POST', q);
  return (data.results || []).length > 0;
}

async function createExpense({ amount, merchant, category, upiRef, sender, rawSms, date }) {
  const body = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      Title: { title: [{ text: { content: merchant || 'Unknown Merchant' } }] },
      Amount: { number: amount ?? 0 },
      Date: { date: { start: date } },
      Category: { select: { name: category || 'Other' } },
      App: { select: { name: 'GPay' } },
      'UPI Ref': { rich_text: upiRef ? [{ text: { content: upiRef } }] : [] },
      Sender: { rich_text: sender ? [{ text: { content: sender } }] : [] },
      'Raw SMS': { rich_text: rawSms ? [{ text: { content: rawSms.slice(0, 1800) } }] : [] }
    }
  };

  return notionRequest('/pages', 'POST', body);
}

app.get('/health', (_, res) => res.json({ ok: true }));

app.post('/sms', async (req, res) => {
  try {
    if (WEBHOOK_SECRET) {
      const provided = req.headers['x-webhook-secret'] || req.query.secret || req.body.secret;
      if (provided !== WEBHOOK_SECRET) {
        return res.status(401).json({ ok: false, error: 'unauthorized' });
      }
    }

    const sender = req.body.sender || req.body.from || '';
    const message = req.body.message || req.body.body || req.body.sms || '';
    const ts = req.body.timestamp || req.body.time || Date.now();

    if (!message) return res.status(400).json({ ok: false, error: 'missing message' });

    const lower = message.toLowerCase();
    const looksLikeDebit =
      (lower.includes('upi') || lower.includes('gpay') || lower.includes('google pay')) &&
      (lower.includes('debited') || lower.includes('paid') || lower.includes('sent'));

    if (!looksLikeDebit) {
      return res.json({ ok: true, skipped: true, reason: 'not upi debit' });
    }

    const amount = parseAmount(message);
    const upiRef = parseUpiRef(message);
    const merchant = parseMerchant(message);
    const category = inferCategory(merchant, message);
    const date = new Date(Number(ts)).toISOString();

    if (await isDuplicate(upiRef)) {
      return res.json({ ok: true, duplicate: true, upiRef });
    }

    const page = await createExpense({ amount, merchant, category, upiRef, sender, rawSms: message, date });
    return res.json({ ok: true, id: page.id, amount, merchant, category, upiRef });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`UPI tracker running on :${PORT}`);
});
