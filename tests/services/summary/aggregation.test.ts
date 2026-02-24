import {
  buildDailySummary,
  buildMonthlySummary,
  buildWeeklySummary,
  LedgerTxn
} from '../../../src/services/summary/aggregation';

const LEDGER: LedgerTxn[] = [
  {
    id: 'txn_1',
    amountPaise: 25000,
    direction: 'debit',
    category: 'Food',
    txnAtISO: '2026-02-24T08:10:00.000Z'
  },
  {
    id: 'txn_2',
    amountPaise: 14900,
    direction: 'debit',
    category: 'Transport',
    txnAtISO: '2026-02-24T11:10:00.000Z'
  },
  {
    id: 'txn_3',
    amountPaise: 99900,
    direction: 'debit',
    category: 'Shopping',
    txnAtISO: '2026-02-22T15:00:00.000Z'
  },
  {
    id: 'txn_4',
    amountPaise: 120000,
    direction: 'debit',
    category: 'Bills',
    txnAtISO: '2026-02-03T10:00:00.000Z'
  },
  {
    id: 'txn_5',
    amountPaise: 200000,
    direction: 'credit',
    category: 'Income',
    txnAtISO: '2026-02-24T09:00:00.000Z'
  },
  {
    id: 'txn_6',
    amountPaise: 80000,
    direction: 'debit',
    category: 'Food',
    txnAtISO: '2026-01-21T09:00:00.000Z'
  }
];

describe('summary aggregation', () => {
  const now = new Date('2026-02-24T12:00:00.000Z');

  it('builds daily summary totals and counts for debit ledger entries', () => {
    const result = buildDailySummary(LEDGER, now);

    expect(result).toEqual({
      period: 'daily',
      fromISO: '2026-02-24',
      toISO: '2026-02-24',
      totalSpendPaise: 39900,
      transactionCount: 2,
      categoryTotals: [
        { category: 'Food', amountPaise: 25000 },
        { category: 'Transport', amountPaise: 14900 }
      ],
      reconciled: true
    });
  });

  it('builds weekly day-by-day totals and reconciles with ledger sum', () => {
    const result = buildWeeklySummary(LEDGER, now);

    expect(result.fromISO).toBe('2026-02-23');
    expect(result.toISO).toBe('2026-02-24');
    expect(result.totalSpendPaise).toBe(39900);
    expect(result.transactionCount).toBe(2);
    expect(result.dayByDay).toEqual([
      { dateISO: '2026-02-23', amountPaise: 0 },
      { dateISO: '2026-02-24', amountPaise: 39900 }
    ]);
    expect(result.reconciled).toBe(true);
  });

  it('builds monthly totals with previous-month comparison', () => {
    const result = buildMonthlySummary(LEDGER, now);

    expect(result.fromISO).toBe('2026-02-01');
    expect(result.toISO).toBe('2026-02-24');
    expect(result.totalSpendPaise).toBe(259800);
    expect(result.transactionCount).toBe(4);
    expect(result.comparison.previousMonthTotalPaise).toBe(80000);
    expect(result.comparison.deltaPct).toBe(224.8);
    expect(result.reconciled).toBe(true);
  });
});
