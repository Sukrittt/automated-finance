import { evaluateBudgetAlerts } from '../../../src/services/budget/thresholds';

describe('budget thresholds', () => {
  it('returns warning when spend reaches 80% of monthly limit', () => {
    const result = evaluateBudgetAlerts(
      [{ category: 'Food', spent: 6400 }],
      [{ category: 'Food', monthlyLimit: 8000 }]
    );

    expect(result).toEqual([
      {
        category: 'Food',
        spent: 6400,
        monthlyLimit: 8000,
        usagePct: 80,
        level: 'warning'
      }
    ]);
  });

  it('returns exceeded alert when spend crosses 100% of monthly limit', () => {
    const result = evaluateBudgetAlerts(
      [{ category: 'Transport', spent: 5200 }],
      [{ category: 'Transport', monthlyLimit: 5000 }]
    );

    expect(result).toEqual([
      {
        category: 'Transport',
        spent: 5200,
        monthlyLimit: 5000,
        usagePct: 104,
        level: 'exceeded'
      }
    ]);
  });

  it('ignores categories below threshold or without limits', () => {
    const result = evaluateBudgetAlerts(
      [
        { category: 'Bills', spent: 4200 },
        { category: 'Unknown', spent: 9999 }
      ],
      [{ category: 'Bills', monthlyLimit: 6000 }]
    );

    expect(result).toEqual([]);
  });
});
