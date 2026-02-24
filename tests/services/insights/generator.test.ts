import { generateWeeklyInsight } from '../../../src/services/insights/generator';
import { MonthlySummary, WeeklySummary } from '../../../src/services/summary/aggregation';

function makeWeeklySummary(overrides: Partial<WeeklySummary>): WeeklySummary {
  return {
    period: 'weekly',
    fromISO: '2026-02-16',
    toISO: '2026-02-22',
    totalSpendPaise: 100000,
    transactionCount: 5,
    dayByDay: [],
    categoryTotals: [{ category: 'Food', amountPaise: 50000 }],
    reconciled: true,
    ...overrides
  };
}

function makeMonthlySummary(overrides: Partial<MonthlySummary>): MonthlySummary {
  return {
    period: 'monthly',
    fromISO: '2026-02-01',
    toISO: '2026-02-22',
    totalSpendPaise: 330000,
    transactionCount: 12,
    categoryTotals: [],
    comparison: {
      previousMonthTotalPaise: 300000,
      deltaPct: 10
    },
    reconciled: true,
    ...overrides
  };
}

describe('generateWeeklyInsight', () => {
  it('generates explainable insight for higher spend week with projected overrun', () => {
    const currentWeek = makeWeeklySummary({
      totalSpendPaise: 120000,
      categoryTotals: [{ category: 'Food', amountPaise: 60000 }]
    });
    const previousWeek = makeWeeklySummary({
      fromISO: '2026-02-09',
      toISO: '2026-02-15',
      totalSpendPaise: 100000
    });
    const monthToDate = makeMonthlySummary({
      toISO: '2026-02-22',
      totalSpendPaise: 330000,
      comparison: {
        previousMonthTotalPaise: 300000,
        deltaPct: 10
      }
    });

    const result = generateWeeklyInsight({ currentWeek, previousWeek, monthToDate });

    expect(result.weekStartISO).toBe('2026-02-16');
    expect(result.insight.summary).toContain('20.0% more');
    expect(result.insight.topLeak).toBe('Top leak: Food at Rs 600 (50% of weekly spend).');
    expect(result.insight.improvementTip).toContain('reducing Food');
    expect(result.insight.projectedMonthlyOverrun).toBe(120000);
    expect(result.insight.winHighlight).toBeUndefined();
  });

  it('emits win highlight when spend drops week-over-week', () => {
    const currentWeek = makeWeeklySummary({
      totalSpendPaise: 85000,
      categoryTotals: [{ category: 'Bills', amountPaise: 35000 }]
    });
    const previousWeek = makeWeeklySummary({
      fromISO: '2026-02-09',
      toISO: '2026-02-15',
      totalSpendPaise: 100000
    });

    const result = generateWeeklyInsight({ currentWeek, previousWeek });

    expect(result.insight.summary).toContain('15.0% less');
    expect(result.insight.winHighlight).toBe('Great control: spend reduced by 15.0% vs last week.');
    expect(result.insight.projectedMonthlyOverrun).toBeUndefined();
  });

  it('handles zero-spend week with safe default messaging', () => {
    const currentWeek = makeWeeklySummary({
      totalSpendPaise: 0,
      transactionCount: 0,
      categoryTotals: []
    });

    const result = generateWeeklyInsight({ currentWeek });

    expect(result.insight.summary).toContain('No debit spend captured this week yet');
    expect(result.insight.topLeak).toBe('Top leak: No dominant spend category this week.');
  });
});
