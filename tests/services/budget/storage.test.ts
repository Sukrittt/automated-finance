import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadBudgetConfigs,
  resetBudgetConfigs,
  saveBudgetConfigs
} from '../../../src/services/budget/storage';

describe('budget storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('loads defaults when no saved config exists', async () => {
    const result = await loadBudgetConfigs();

    expect(result.map((item) => item.category)).toEqual([
      'Food',
      'Transport',
      'Shopping',
      'Bills',
      'Entertainment',
      'Others'
    ]);
    expect(result.every((item) => item.monthlyLimit > 0)).toBe(true);
  });

  it('saves and reloads updated limits', async () => {
    await saveBudgetConfigs([
      { category: 'Food', monthlyLimit: 9000 },
      { category: 'Transport', monthlyLimit: 4500 },
      { category: 'Shopping', monthlyLimit: 7200 },
      { category: 'Bills', monthlyLimit: 6200 },
      { category: 'Entertainment', monthlyLimit: 3900 },
      { category: 'Others', monthlyLimit: 2800 }
    ]);

    const reloaded = await loadBudgetConfigs();
    const food = reloaded.find((item) => item.category === 'Food');

    expect(food?.monthlyLimit).toBe(9000);
  });

  it('reset clears saved values and returns defaults', async () => {
    await saveBudgetConfigs([{ category: 'Food', monthlyLimit: 9999 }]);

    const reset = await resetBudgetConfigs();

    expect(reset.find((item) => item.category === 'Food')?.monthlyLimit).toBe(8000);
  });
});
