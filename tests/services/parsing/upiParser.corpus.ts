import type { SourceApp } from '../../../src/services/parsing/upiParser';

export interface UpiParserCorpusSample {
  id: string;
  app: SourceApp | 'other';
  payload: {
    packageName?: string;
    notificationTitle?: string;
    notificationBody?: string;
  };
  expected: {
    shouldParse: boolean;
    sourceApp?: SourceApp;
    amountPaise?: number;
    direction?: 'debit' | 'credit';
    merchantNormalized?: string;
    reviewRequired?: boolean;
  };
}

export const UPI_PARSER_CORPUS: UpiParserCorpusSample[] = [
  {
    id: 'gpay-debit-success-1',
    app: 'gpay',
    payload: {
      packageName: 'com.google.android.apps.nbu.paisa.user',
      notificationTitle: 'Google Pay',
      notificationBody: 'Paid ₹250 to ABC Store via UPI Ref 123456789012'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'gpay',
      amountPaise: 25000,
      direction: 'debit',
      merchantNormalized: 'abc store',
      reviewRequired: false
    }
  },
  {
    id: 'gpay-credit-success-1',
    app: 'gpay',
    payload: {
      packageName: 'com.google.android.apps.nbu.paisa.user',
      notificationTitle: 'Google Pay',
      notificationBody: 'Received Rs. 1200 from Rohan Mehta via UPI UTR 4433221100'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'gpay',
      amountPaise: 120000,
      direction: 'credit',
      merchantNormalized: 'rohan mehta',
      reviewRequired: false
    }
  },
  {
    id: 'gpay-debit-low-confidence',
    app: 'gpay',
    payload: {
      packageName: 'com.google.android.apps.nbu.paisa.user',
      notificationTitle: 'Google Pay',
      notificationBody: 'Paid Rs 85 to Local Tea Stall on UPI'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'gpay',
      amountPaise: 8500,
      direction: 'debit',
      merchantNormalized: 'local tea stall on upi',
      reviewRequired: true
    }
  },
  {
    id: 'gpay-edge-promo',
    app: 'gpay',
    payload: {
      packageName: 'com.google.android.apps.nbu.paisa.user',
      notificationTitle: 'Google Pay',
      notificationBody: 'Scratch card unlocked. Earn cashback now.'
    },
    expected: {
      shouldParse: false
    }
  },
  {
    id: 'phonepe-debit-success-1',
    app: 'phonepe',
    payload: {
      packageName: 'com.phonepe.app',
      notificationTitle: 'PhonePe',
      notificationBody: 'You paid INR 1,340.25 to Blinkit via UPI Ref No 998877665544'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'phonepe',
      amountPaise: 134025,
      direction: 'debit',
      merchantNormalized: 'blinkit',
      reviewRequired: false
    }
  },
  {
    id: 'phonepe-credit-success-1',
    app: 'phonepe',
    payload: {
      packageName: 'com.phonepe.app',
      notificationTitle: 'PhonePe',
      notificationBody: 'Received ₹540 from Priya via UPI reference no 88997711'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'phonepe',
      amountPaise: 54000,
      direction: 'credit',
      merchantNormalized: 'priya',
      reviewRequired: false
    }
  },
  {
    id: 'phonepe-debit-short-ref',
    app: 'phonepe',
    payload: {
      packageName: 'com.phonepe.app',
      notificationTitle: 'PhonePe',
      notificationBody: 'Paid ₹99 to Metro Mart via UPI ref AA11BB22'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'phonepe',
      amountPaise: 9900,
      direction: 'debit',
      merchantNormalized: 'metro mart',
      reviewRequired: false
    }
  },
  {
    id: 'phonepe-edge-request',
    app: 'phonepe',
    payload: {
      packageName: 'com.phonepe.app',
      notificationTitle: 'PhonePe',
      notificationBody: 'Payment request pending from Akash.'
    },
    expected: {
      shouldParse: false
    }
  },
  {
    id: 'paytm-debit-success-1',
    app: 'paytm',
    payload: {
      packageName: 'net.one97.paytm',
      notificationTitle: 'Paytm UPI',
      notificationBody: 'You paid Rs 1,240.50 to Zudio Store via UPI Ref No 234567890123'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'paytm',
      amountPaise: 124050,
      direction: 'debit',
      merchantNormalized: 'zudio store',
      reviewRequired: false
    }
  },
  {
    id: 'paytm-credit-success-1',
    app: 'paytm',
    payload: {
      packageName: 'net.one97.paytm',
      notificationTitle: 'Paytm UPI',
      notificationBody: 'Rs 750 credited from Amit Jain via UPI UTR 5566778899'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'paytm',
      amountPaise: 75000,
      direction: 'credit',
      merchantNormalized: 'amit jain',
      reviewRequired: false
    }
  },
  {
    id: 'paytm-debit-success-2',
    app: 'paytm',
    payload: {
      packageName: 'net.one97.paytm',
      notificationTitle: 'Paytm',
      notificationBody: 'Payment of ₹430 to Swiggy via UPI ref no PAYT123456'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'paytm',
      amountPaise: 43000,
      direction: 'debit',
      merchantNormalized: 'swiggy',
      reviewRequired: false
    }
  },
  {
    id: 'paytm-edge-wallet-load',
    app: 'paytm',
    payload: {
      packageName: 'net.one97.paytm',
      notificationTitle: 'Paytm',
      notificationBody: 'Wallet loaded with Rs 100.'
    },
    expected: {
      shouldParse: false
    }
  },
  {
    id: 'bhim-debit-success-1',
    app: 'bhim',
    payload: {
      packageName: 'in.org.npci.upiapp',
      notificationTitle: 'BHIM UPI',
      notificationBody: 'Paid ₹1,999 to IRCTC via UPI reference no 1234ABCD56'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'bhim',
      amountPaise: 199900,
      direction: 'debit',
      merchantNormalized: 'irctc',
      reviewRequired: false
    }
  },
  {
    id: 'bhim-credit-success-1',
    app: 'bhim',
    payload: {
      packageName: 'in.org.npci.upiapp',
      notificationTitle: 'BHIM',
      notificationBody: 'Received INR 310 from Neha via UPI Ref 8899ZZXX77'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'bhim',
      amountPaise: 31000,
      direction: 'credit',
      merchantNormalized: 'neha',
      reviewRequired: false
    }
  },
  {
    id: 'bhim-debit-success-2',
    app: 'bhim',
    payload: {
      packageName: 'in.org.npci.upiapp',
      notificationTitle: 'BHIM UPI',
      notificationBody: 'Sent Rs 60 to Tea Point via UPI Ref 4455667788'
    },
    expected: {
      shouldParse: true,
      sourceApp: 'bhim',
      amountPaise: 6000,
      direction: 'debit',
      merchantNormalized: 'tea point',
      reviewRequired: false
    }
  },
  {
    id: 'bhim-edge-balance',
    app: 'bhim',
    payload: {
      packageName: 'in.org.npci.upiapp',
      notificationTitle: 'BHIM',
      notificationBody: 'Your account balance is low.'
    },
    expected: {
      shouldParse: false
    }
  },
  {
    id: 'other-app-edge',
    app: 'other',
    payload: {
      packageName: 'com.whatsapp',
      notificationTitle: 'New message',
      notificationBody: 'See you at 7 PM'
    },
    expected: {
      shouldParse: false
    }
  }
];
