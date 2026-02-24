export type SourceApp = 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other';
export type TransactionDirection = 'debit' | 'credit';

export interface NotificationPayload {
  packageName?: string;
  notificationTitle?: string;
  notificationBody?: string;
  receivedAtISO?: string;
}

export interface ParsedUpiNotification {
  sourceApp: SourceApp;
  amountPaise: number;
  amountText: string;
  direction: TransactionDirection;
  merchantRaw: string;
  merchantNormalized: string;
  upiRef?: string;
  confidence: number;
  matchedTemplate: string;
  rawText: string;
}

interface ParserTemplate {
  id: string;
  app: Exclude<SourceApp, 'other'>;
  packageHints: string[];
  keywordHints: string[];
  parse: (rawText: string) => Omit<ParsedUpiNotification, 'sourceApp' | 'matchedTemplate' | 'rawText'> | null;
}

const DEBIT_HINTS = ['paid', 'sent', 'debited', 'payment of', 'paying'];
const CREDIT_HINTS = ['received', 'credited', 'refund', 'deposited', 'added'];
const AMOUNT_PATTERN = /(?:₹|rs\.?\s?|inr\s?)(\d+(?:,\d{2,3})*(?:\.\d{1,2})?)/i;

const UPI_TEMPLATES: ParserTemplate[] = [
  {
    id: 'gpay:upi-transfer',
    app: 'gpay',
    packageHints: ['com.google.android.apps.nbu.paisa.user'],
    keywordHints: ['google pay', 'gpay'],
    parse: parseCommonUpiNotification
  },
  {
    id: 'phonepe:upi-transfer',
    app: 'phonepe',
    packageHints: ['com.phonepe.app'],
    keywordHints: ['phonepe'],
    parse: parseCommonUpiNotification
  },
  {
    id: 'paytm:upi-transfer',
    app: 'paytm',
    packageHints: ['net.one97.paytm'],
    keywordHints: ['paytm'],
    parse: parseCommonUpiNotification
  },
  {
    id: 'bhim:upi-transfer',
    app: 'bhim',
    packageHints: ['in.org.npci.upiapp'],
    keywordHints: ['bhim'],
    parse: parseCommonUpiNotification
  }
];

export function parseUpiNotification(payload: NotificationPayload): ParsedUpiNotification | null {
  const rawText = [payload.notificationTitle, payload.notificationBody]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(' | ')
    .trim();

  if (!rawText) {
    return null;
  }

  const rawTextLower = rawText.toLowerCase();
  const matchedTemplate = UPI_TEMPLATES
    .map((template) => ({
      template,
      score: getTemplateScore(template, payload.packageName, rawTextLower)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.template;

  if (!matchedTemplate) {
    return null;
  }

  const parsed = matchedTemplate.parse(rawText);

  if (!parsed) {
    return null;
  }

  return {
    ...parsed,
    sourceApp: matchedTemplate.app,
    matchedTemplate: matchedTemplate.id,
    rawText
  };
}

function parseCommonUpiNotification(rawText: string): Omit<ParsedUpiNotification, 'sourceApp' | 'matchedTemplate' | 'rawText'> | null {
  const amountMatch = rawText.match(AMOUNT_PATTERN);

  if (!amountMatch) {
    return null;
  }

  const hasUpiSignal = /\bupi\b|\butr\b|\bvpa\b|reference|ref\s*no|google pay|gpay|phonepe|paytm|bhim/i.test(rawText);
  if (!hasUpiSignal) {
    return null;
  }

  const amountText = amountMatch[1];
  const amountPaise = toPaise(amountText);

  if (amountPaise <= 0) {
    return null;
  }

  const direction = inferDirection(rawText);
  const merchantRaw = extractMerchant(rawText, direction);

  if (!merchantRaw) {
    return null;
  }

  const upiRef = extractUpiRef(rawText);

  let confidence = 0.7;
  if (upiRef) {
    confidence += 0.1;
  }
  if (/via\s+upi|upi\s+id|utr/i.test(rawText)) {
    confidence += 0.1;
  }
  if (/successful|success/i.test(rawText)) {
    confidence += 0.05;
  }

  return {
    amountPaise,
    amountText,
    direction,
    merchantRaw,
    merchantNormalized: normalizeMerchant(merchantRaw),
    upiRef,
    confidence: clamp(Number(confidence.toFixed(2)), 0, 0.99)
  };
}

function inferDirection(rawText: string): TransactionDirection {
  const lower = rawText.toLowerCase();
  const debitScore = DEBIT_HINTS.reduce((acc, hint) => acc + Number(lower.includes(hint)), 0);
  const creditScore = CREDIT_HINTS.reduce((acc, hint) => acc + Number(lower.includes(hint)), 0);

  if (creditScore > debitScore) {
    return 'credit';
  }

  return 'debit';
}

function extractMerchant(rawText: string, direction: TransactionDirection): string | null {
  const patterns = direction === 'debit'
    ? [
      /(?:paid|sent|payment\s+of)\s+(?:₹|rs\.?\s?)?\s*\d[\d,.]*(?:\.\d{1,2})?\s+to\s+(.+?)(?:\s+via\s+upi|\s+upi\s+ref|\s+ref\s+no|\s+reference\s+no|\s+utr|[|,.]|$)/i,
      /(?:debited|paid\s+to|to)\s+(.+?)(?:\s+via\s+upi|\s+upi\s+ref|\s+ref\s+no|\s+reference\s+no|\s+utr|[|,.]|$)/i
    ]
    : [
      /(?:received|credited)\s+(?:₹|rs\.?\s?)?\s*\d[\d,.]*(?:\.\d{1,2})?\s+from\s+(.+?)(?:\s+via\s+upi|\s+upi\s+ref|\s+ref\s+no|\s+reference\s+no|\s+utr|[|,.]|$)/i,
      /(?:from)\s+(.+?)(?:\s+via\s+upi|\s+upi\s+ref|\s+ref\s+no|\s+reference\s+no|\s+utr|[|,.]|$)/i
    ];

  for (const pattern of patterns) {
    const match = rawText.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function extractUpiRef(rawText: string): string | undefined {
  const upiRefMatch = rawText.match(/(?:upi\s*ref(?:\s*no)?|utr|ref(?:erence)?(?:\s*no)?)\s*[:#-]?\s*([a-z0-9]{8,20})/i);
  return upiRefMatch?.[1]?.toUpperCase();
}

function toPaise(amountText: string): number {
  const normalized = amountText.replace(/,/g, '');
  const amount = Number.parseFloat(normalized);

  if (Number.isNaN(amount) || amount < 0) {
    return 0;
  }

  return Math.round(amount * 100);
}

function normalizeMerchant(merchantRaw: string): string {
  return merchantRaw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getTemplateScore(template: ParserTemplate, packageName: string | undefined, rawTextLower: string): number {
  const packageHitCount = template.packageHints.reduce((acc, hint) => acc + Number(Boolean(packageName?.includes(hint))), 0);
  const keywordHitCount = template.keywordHints.reduce((acc, hint) => acc + Number(rawTextLower.includes(hint)), 0);

  if (!packageHitCount && !keywordHitCount) {
    return 0;
  }

  return packageHitCount * 10 + keywordHitCount;
}
