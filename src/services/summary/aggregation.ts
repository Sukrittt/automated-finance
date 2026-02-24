export type SummaryPeriod = 'daily' | 'weekly' | 'monthly';

export interface LedgerTxn {
  id: string;
  amountPaise: number;
  direction: 'debit' | 'credit';
  category: string;
  txnAtISO: string;
}

export interface SummaryCategoryTotal {
  category: string;
  amountPaise: number;
}

export interface DailySummary {
  period: 'daily';
  fromISO: string;
  toISO: string;
  totalSpendPaise: number;
  transactionCount: number;
  categoryTotals: SummaryCategoryTotal[];
  reconciled: boolean;
}

export interface WeeklySummary {
  period: 'weekly';
  fromISO: string;
  toISO: string;
  totalSpendPaise: number;
  transactionCount: number;
  dayByDay: Array<{
    dateISO: string;
    amountPaise: number;
  }>;
  categoryTotals: SummaryCategoryTotal[];
  reconciled: boolean;
}

export interface MonthlySummary {
  period: 'monthly';
  fromISO: string;
  toISO: string;
  totalSpendPaise: number;
  transactionCount: number;
  categoryTotals: SummaryCategoryTotal[];
  comparison: {
    previousMonthTotalPaise: number;
    deltaPct: number;
  };
  reconciled: boolean;
}

export function buildDailySummary(transactions: LedgerTxn[], now: Date = new Date()): DailySummary {
  const dateISO = toDateOnlyISO(now);
  const inRange = filterDebitsInRange(transactions, dateISO, dateISO);
  const categoryTotals = groupByCategory(inRange);
  const totalSpendPaise = sumAmount(inRange);

  return {
    period: 'daily',
    fromISO: dateISO,
    toISO: dateISO,
    totalSpendPaise,
    transactionCount: inRange.length,
    categoryTotals,
    reconciled: totalSpendPaise === sumCategoryTotals(categoryTotals)
  };
}

export function buildWeeklySummary(transactions: LedgerTxn[], now: Date = new Date()): WeeklySummary {
  const toISO = toDateOnlyISO(now);
  const fromISO = toDateOnlyISO(startOfWeekMondayUTC(now));
  const inRange = filterDebitsInRange(transactions, fromISO, toISO);
  const categoryTotals = groupByCategory(inRange);
  const totalSpendPaise = sumAmount(inRange);
  const dayByDay = buildDayBuckets(fromISO, toISO, inRange);

  return {
    period: 'weekly',
    fromISO,
    toISO,
    totalSpendPaise,
    transactionCount: inRange.length,
    dayByDay,
    categoryTotals,
    reconciled:
      totalSpendPaise === sumCategoryTotals(categoryTotals) &&
      totalSpendPaise === dayByDay.reduce((acc, day) => acc + day.amountPaise, 0)
  };
}

export function buildMonthlySummary(transactions: LedgerTxn[], now: Date = new Date()): MonthlySummary {
  const toISO = toDateOnlyISO(now);
  const currentStart = startOfMonthUTC(now);
  const fromISO = toDateOnlyISO(currentStart);

  const inRange = filterDebitsInRange(transactions, fromISO, toISO);
  const categoryTotals = groupByCategory(inRange);
  const totalSpendPaise = sumAmount(inRange);

  const previousStart = addMonthsUTC(currentStart, -1);
  const previousEnd = addDaysUTC(currentStart, -1);
  const previousMonthTxns = filterDebitsInRange(
    transactions,
    toDateOnlyISO(previousStart),
    toDateOnlyISO(previousEnd)
  );
  const previousMonthTotalPaise = sumAmount(previousMonthTxns);

  return {
    period: 'monthly',
    fromISO,
    toISO,
    totalSpendPaise,
    transactionCount: inRange.length,
    categoryTotals,
    comparison: {
      previousMonthTotalPaise,
      deltaPct: calculateDeltaPct(totalSpendPaise, previousMonthTotalPaise)
    },
    reconciled: totalSpendPaise === sumCategoryTotals(categoryTotals)
  };
}

function calculateDeltaPct(current: number, previous: number): number {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function filterDebitsInRange(
  transactions: LedgerTxn[],
  fromISO: string,
  toISO: string
): LedgerTxn[] {
  return transactions.filter((txn) => {
    if (txn.direction !== 'debit') {
      return false;
    }

    const dateISO = toDateOnlyISO(new Date(txn.txnAtISO));
    return dateISO >= fromISO && dateISO <= toISO;
  });
}

function groupByCategory(transactions: LedgerTxn[]): SummaryCategoryTotal[] {
  const totals = new Map<string, number>();

  for (const txn of transactions) {
    const category = txn.category?.trim() || 'Others';
    totals.set(category, (totals.get(category) ?? 0) + txn.amountPaise);
  }

  return Array.from(totals.entries())
    .map(([category, amountPaise]) => ({ category, amountPaise }))
    .sort((a, b) => b.amountPaise - a.amountPaise);
}

function buildDayBuckets(fromISO: string, toISO: string, transactions: LedgerTxn[]) {
  const totalsByDay = new Map<string, number>();
  for (const txn of transactions) {
    const dateISO = toDateOnlyISO(new Date(txn.txnAtISO));
    totalsByDay.set(dateISO, (totalsByDay.get(dateISO) ?? 0) + txn.amountPaise);
  }

  const output: Array<{ dateISO: string; amountPaise: number }> = [];
  let cursor = new Date(`${fromISO}T00:00:00.000Z`);
  const end = new Date(`${toISO}T00:00:00.000Z`);

  while (cursor <= end) {
    const dateISO = toDateOnlyISO(cursor);
    output.push({
      dateISO,
      amountPaise: totalsByDay.get(dateISO) ?? 0
    });

    cursor = addDaysUTC(cursor, 1);
  }

  return output;
}

function sumAmount(transactions: LedgerTxn[]): number {
  return transactions.reduce((acc, txn) => acc + txn.amountPaise, 0);
}

function sumCategoryTotals(categoryTotals: SummaryCategoryTotal[]): number {
  return categoryTotals.reduce((acc, row) => acc + row.amountPaise, 0);
}

function toDateOnlyISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfWeekMondayUTC(date: Date): Date {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDaysUTC(utc, mondayOffset);
}

function startOfMonthUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addDaysUTC(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

function addMonthsUTC(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}
