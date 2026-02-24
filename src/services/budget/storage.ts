import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetConfig, DEFAULT_CATEGORY_BUDGETS } from './thresholds';

const BUDGET_LIMITS_KEY = 'budget_limits_v1';

function sanitizeLimit(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.round(value);
}

function toDefaultsByCategory(): Map<string, number> {
  return new Map(DEFAULT_CATEGORY_BUDGETS.map((item) => [item.category.toLowerCase(), item.monthlyLimit]));
}

function normalizeConfigs(input: unknown): BudgetConfig[] {
  if (!Array.isArray(input)) {
    return DEFAULT_CATEGORY_BUDGETS;
  }

  const defaults = toDefaultsByCategory();
  const merged = new Map<string, BudgetConfig>();

  input.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const candidate = item as Partial<BudgetConfig>;
    const category = typeof candidate.category === 'string' ? candidate.category.trim() : '';
    if (!category) {
      return;
    }

    const key = category.toLowerCase();
    const defaultLimit = defaults.get(key);
    const monthlyLimit = sanitizeLimit(Number(candidate.monthlyLimit));
    if (!monthlyLimit) {
      return;
    }

    merged.set(key, {
      category: defaultLimit ? DEFAULT_CATEGORY_BUDGETS.find((entry) => entry.category.toLowerCase() === key)?.category ?? category : category,
      monthlyLimit
    });
  });

  return DEFAULT_CATEGORY_BUDGETS.map((entry) => merged.get(entry.category.toLowerCase()) ?? entry);
}

export async function loadBudgetConfigs(): Promise<BudgetConfig[]> {
  try {
    const raw = await AsyncStorage.getItem(BUDGET_LIMITS_KEY);
    if (!raw) {
      return DEFAULT_CATEGORY_BUDGETS;
    }

    const parsed = JSON.parse(raw) as unknown;
    return normalizeConfigs(parsed);
  } catch {
    return DEFAULT_CATEGORY_BUDGETS;
  }
}

export async function saveBudgetConfigs(configs: BudgetConfig[]): Promise<BudgetConfig[]> {
  const normalized = normalizeConfigs(configs);
  await AsyncStorage.setItem(BUDGET_LIMITS_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function resetBudgetConfigs(): Promise<BudgetConfig[]> {
  await AsyncStorage.removeItem(BUDGET_LIMITS_KEY);
  return DEFAULT_CATEGORY_BUDGETS;
}
