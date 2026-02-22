import { mapCapturedNotificationToIngestEvent } from '../../../src/services/ingest/payloadMapper';

describe('mapCapturedNotificationToIngestEvent', () => {
  it('maps a parseable notification to ingest payload with dedupe fingerprint', () => {
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
    expect(mapped?.dedupeFingerprint.startsWith('fp_')).toBe(true);
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
