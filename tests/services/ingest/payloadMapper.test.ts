import { mapCapturedNotificationToIngestEvent } from '../../../src/services/ingest/payloadMapper';

describe('mapCapturedNotificationToIngestEvent', () => {
  it('maps a high-confidence notification and marks review as not required', () => {
    const mapped = mapCapturedNotificationToIngestEvent({
      packageName: 'com.google.android.apps.nbu.paisa.user',
      title: 'Google Pay',
      body: 'Paid ₹250 to ABC Store via UPI Ref 123456789012',
      postedAt: Date.parse('2026-02-22T10:41:23.000Z')
    });

    expect(mapped).not.toBeNull();
    expect(mapped?.apiEvent.source_app).toBe('gpay');
    expect(mapped?.apiEvent.received_at).toBe('2026-02-22T10:41:23.000Z');
    expect(mapped?.apiEvent.event_id.startsWith('evt_')).toBe(true);
    expect(mapped?.apiEvent.raw_payload_hash.startsWith('fnv1a:')).toBe(true);
    expect(mapped?.apiEvent.parsed_amount_paise).toBe(25000);
    expect(mapped?.apiEvent.parsed_direction).toBe('debit');
    expect(mapped?.apiEvent.parsed_merchant_normalized).toBe('abc store');
    expect(mapped?.apiEvent.parse_confidence).toBeGreaterThanOrEqual(0.9);
    expect(mapped?.apiEvent.review_required).toBe(false);
    expect(mapped?.dedupeFingerprint.startsWith('fp_')).toBe(true);
  });

  it('marks low-confidence events for review queue', () => {
    const mapped = mapCapturedNotificationToIngestEvent({
      packageName: 'com.google.android.apps.nbu.paisa.user',
      title: 'Google Pay',
      body: 'Paid Rs 85 to Local Tea Stall on UPI',
      postedAt: Date.parse('2026-02-22T10:41:23.000Z')
    });

    expect(mapped).not.toBeNull();
    expect(mapped?.apiEvent.parse_confidence).toBeLessThan(0.9);
    expect(mapped?.apiEvent.review_required).toBe(true);
  });

  it('returns null for non-UPI notifications', () => {
    const mapped = mapCapturedNotificationToIngestEvent({
      packageName: 'com.whatsapp',
      title: 'New message',
      body: 'hello',
      postedAt: Date.now()
    });

    expect(mapped).toBeNull();
  });
});
