import { buildDedupeFingerprint } from '../../../src/services/dedupe/fingerprint';

describe('buildDedupeFingerprint', () => {
  const base = {
    sourceApp: 'gpay' as const,
    amountPaise: 25000,
    direction: 'debit' as const,
    merchantRaw: 'ABC Store',
    upiRef: '123456789012',
    txnAtISO: '2026-02-22T10:41:23.000Z'
  };

  it('produces stable fingerprint for equivalent merchant and reference formats', () => {
    const fpA = buildDedupeFingerprint(base);
    const fpB = buildDedupeFingerprint({
      ...base,
      merchantRaw: 'abc-store',
      upiRef: '1234-5678-9012',
      txnAtISO: '2026-02-22T10:41:58.000Z'
    });

    expect(fpA).toBe(fpB);
  });

  it('changes fingerprint when amount changes', () => {
    const fpA = buildDedupeFingerprint(base);
    const fpB = buildDedupeFingerprint({ ...base, amountPaise: 25100 });

    expect(fpA).not.toBe(fpB);
  });

  it('changes fingerprint when direction changes', () => {
    const fpA = buildDedupeFingerprint(base);
    const fpB = buildDedupeFingerprint({ ...base, direction: 'credit' });

    expect(fpA).not.toBe(fpB);
  });

  it('uses no-time bucket when timestamp is missing/invalid', () => {
    const fpA = buildDedupeFingerprint({ ...base, txnAtISO: undefined });
    const fpB = buildDedupeFingerprint({ ...base, txnAtISO: 'bad-date' });

    expect(fpA).toBe(fpB);
  });
});
