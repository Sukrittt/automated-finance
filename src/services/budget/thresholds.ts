export type BudgetAlertLevel = 'warning' | 'exceeded';

export interface BudgetUsage {
  category: string;
  spent: number;
}

export interface BudgetConfig {
  category: string;
  monthlyLimit: number;
}

export interface BudgetAlert {
  category: string;
  spent: number;
  monthlyLimit: number;
  usagePct: number;
  level: BudgetAlertLevel;
}

const WARNING_THRESHOLD = 80;
const EXCEEDED_THRESHOLD = 100;

export const DEFAULT_CATEGORY_BUDGETS: BudgetConfig[] = [
  { category: 'Food', monthlyLimit: 8000 },
  { category: 'Transport', monthlyLimit: 5000 },
  { category: 'Shopping', monthlyLimit: 7000 },
  { category: 'Bills', monthlyLimit: 6000 },
  { category: 'Entertainment', monthlyLimit: 4000 },
  { category: 'Others', monthlyLimit: 3000 }
];

function toBudgetMap(configs: BudgetConfig[]): Map<string, number> {
  return new Map(configs.map((item) => [item.category.toLowerCase(), item.monthlyLimit]));
}

export function evaluateBudgetAlerts(
  usage: BudgetUsage[],
  configs: BudgetConfig[] = DEFAULT_CATEGORY_BUDGETS
): BudgetAlert[] {
  const budgetMap = toBudgetMap(configs);

  return usage
    .map((entry) => {
      const monthlyLimit = budgetMap.get(entry.category.toLowerCase());
      if (!monthlyLimit || monthlyLimit <= 0) {
        return null;
      }

      const usagePct = Number(((entry.spent / monthlyLimit) * 100).toFixed(1));
      if (usagePct < WARNING_THRESHOLD) {
        return null;
      }

      return {
        category: entry.category,
        spent: entry.spent,
        monthlyLimit,
        usagePct,
        level: usagePct >= EXCEEDED_THRESHOLD ? 'exceeded' : 'warning'
      } satisfies BudgetAlert;
    })
    .filter((item): item is BudgetAlert => item !== null)
    .sort((a, b) => {
      if (a.level !== b.level) {
        return a.level === 'exceeded' ? -1 : 1;
      }
      return b.usagePct - a.usagePct;
    });
}
