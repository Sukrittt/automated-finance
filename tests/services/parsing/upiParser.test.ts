import { parseUpiNotification } from '../../../src/services/parsing/upiParser';

describe('parseUpiNotification', () => {
  it('parses gpay debit notification', () => {
    const parsed = parseUpiNotification({
      packageName: 'com.google.android.apps.nbu.paisa.user',
      notificationTitle: 'Google Pay',
      notificationBody: 'Paid ₹250 to ABC Store via UPI Ref 123456789012'
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.sourceApp).toBe('gpay');
    expect(parsed?.direction).toBe('debit');
    expect(parsed?.amountPaise).toBe(25000);
    expect(parsed?.merchantNormalized).toBe('abc store');
    expect(parsed?.upiRef).toBe('123456789012');
  });

  it('parses phonepe credit notification', () => {
    const parsed = parseUpiNotification({
      packageName: 'com.phonepe.app',
      notificationTitle: 'PhonePe',
      notificationBody: 'Received Rs. 999 from Rahul Sharma via UPI UTR 9876543210'
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.sourceApp).toBe('phonepe');
    expect(parsed?.direction).toBe('credit');
    expect(parsed?.amountPaise).toBe(99900);
    expect(parsed?.merchantNormalized).toBe('rahul sharma');
    expect(parsed?.upiRef).toBe('9876543210');
  });

  it('parses paytm debit notification', () => {
    const parsed = parseUpiNotification({
      packageName: 'net.one97.paytm',
      notificationTitle: 'Paytm UPI',
      notificationBody: 'You paid Rs 1,240.50 to Zudio Store via UPI Ref No 234567890123'
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.sourceApp).toBe('paytm');
    expect(parsed?.amountPaise).toBe(124050);
    expect(parsed?.merchantNormalized).toBe('zudio store');
    expect(parsed?.matchedTemplate).toBe('paytm:upi-transfer');
  });

  it('parses bhim debit notification using keyword match', () => {
    const parsed = parseUpiNotification({
      notificationTitle: 'BHIM UPI',
      notificationBody: 'Paid ₹1,999 to IRCTC via UPI reference no 1234ABCD56'
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.sourceApp).toBe('bhim');
    expect(parsed?.amountPaise).toBe(199900);
    expect(parsed?.merchantNormalized).toBe('irctc');
    expect(parsed?.upiRef).toBe('1234ABCD56');
  });

  it('returns null for non-upi notifications', () => {
    const parsed = parseUpiNotification({
      packageName: 'com.whatsapp',
      notificationTitle: 'New message',
      notificationBody: 'See you at 7 PM'
    });

    expect(parsed).toBeNull();
  });
});
