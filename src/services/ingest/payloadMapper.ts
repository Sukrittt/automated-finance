import type { CapturedNotification } from '../notifications/nativeListener';
import { buildDedupeFingerprint } from '../dedupe/fingerprint';
import { parseUpiNotification } from '../parsing/upiParser';
import { suggestCategoryFromParsedTransaction } from '../categorization/categoryRules';
import type { MappedIngestEvent } from './types';

export const REVIEW_QUEUE_CONFIDENCE_THRESHOLD = 0.9;

export function mapCapturedNotificationToIngestEvent(
  notification: CapturedNotification
): MappedIngestEvent | null {
  const parsed = parseUpiNotification({
    packageName: notification.packageName,
    notificationTitle: notification.title ?? undefined,
    notificationBody: notification.body ?? undefined,
    receivedAtISO: new Date(notification.postedAt).toISOString()
  });

  if (!parsed) {
    return null;
  }

  const receivedAtISO = new Date(notification.postedAt).toISOString();
  const dedupeFingerprint = buildDedupeFingerprint({
    sourceApp: parsed.sourceApp,
    amountPaise: parsed.amountPaise,
    direction: parsed.direction,
    merchantRaw: parsed.merchantRaw,
    merchantNormalized: parsed.merchantNormalized,
    upiRef: parsed.upiRef,
    txnAtISO: receivedAtISO
  });

  const notificationTitle = notification.title?.trim();
  const notificationBody = notification.body?.trim();
  const suggestedCategory = suggestCategoryFromParsedTransaction({
    direction: parsed.direction,
    merchantRaw: parsed.merchantRaw,
    merchantNormalized: parsed.merchantNormalized,
    sourceApp: parsed.sourceApp
  });

  return {
    dedupeFingerprint,
    apiEvent: {
      event_id: buildEventId(dedupeFingerprint, notification.postedAt, notification.packageName),
      source_app: parsed.sourceApp,
      received_at: receivedAtISO,
      notification_title: notificationTitle || parsed.rawText,
      notification_body: notificationBody || parsed.rawText,
      raw_payload_hash: buildRawPayloadHash(notification),
      parsed_amount_paise: parsed.amountPaise,
      parsed_direction: parsed.direction,
      parsed_merchant_raw: parsed.merchantRaw,
      parsed_merchant_normalized: parsed.merchantNormalized,
      parsed_upi_ref: parsed.upiRef,
      parser_template: parsed.matchedTemplate,
      parse_confidence: parsed.confidence,
      review_required: parsed.confidence < REVIEW_QUEUE_CONFIDENCE_THRESHOLD,
      category_prediction: suggestedCategory.category,
      category_prediction_confidence: suggestedCategory.confidence
    }
  };
}

function buildEventId(dedupeFingerprint: string, postedAtMs: number, packageName: string): string {
  return `evt_${fnv1aHex(`${dedupeFingerprint}|${postedAtMs}|${packageName}`)}`;
}

function buildRawPayloadHash(notification: CapturedNotification): string {
  const raw = [
    notification.packageName,
    String(notification.postedAt),
    notification.title ?? '',
    notification.body ?? ''
  ].join('|');

  return `fnv1a:${fnv1aHex(raw)}`;
}

function fnv1aHex(value: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}
