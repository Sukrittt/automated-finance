import type { SourceApp, TransactionDirection } from '../parsing/upiParser';

export interface DedupeFingerprintInput {
  sourceApp: SourceApp;
  amountPaise: number;
  direction: TransactionDirection;
  merchantRaw?: string;
  merchantNormalized?: string;
  upiRef?: string;
  txnAtISO?: string;
}

export function buildDedupeFingerprint(input: DedupeFingerprintInput): string {
  const merchant = normalizeMerchant(input.merchantNormalized ?? input.merchantRaw ?? 'unknown');
  const upiRef = normalizeToken(input.upiRef);
  const minuteBucket = getMinuteBucket(input.txnAtISO);

  const canonical = [
    'v1',
    input.sourceApp,
    input.direction,
    String(input.amountPaise),
    merchant,
    upiRef,
    minuteBucket
  ].join('|');

  return `fp_${fnv1aHex(canonical)}`;
}

function normalizeMerchant(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeToken(value?: string): string {
  if (!value) {
    return 'no-ref';
  }

  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') || 'no-ref';
}

function getMinuteBucket(txnAtISO?: string): string {
  if (!txnAtISO) {
    return 'no-time';
  }

  const date = new Date(txnAtISO);

  if (Number.isNaN(date.getTime())) {
    return 'no-time';
  }

  date.setSeconds(0, 0);
  return date.toISOString();
}

function fnv1aHex(value: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}
