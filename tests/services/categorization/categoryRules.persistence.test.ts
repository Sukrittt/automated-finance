import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  __resetCategoryFeedbackForTests,
  hydrateCategoryFeedbackFromStorage,
  recordCategoryFeedback,
  suggestCategoryFromParsedTransaction
} from '../../../src/services/categorization/categoryRules';

describe('categoryRules persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    __resetCategoryFeedbackForTests();
  });

  it('reloads category feedback overrides after runtime reset', async () => {
    await recordCategoryFeedback({
      merchantRaw: 'AMZN Seller Services',
      correctedCategory: 'Bills'
    });

    __resetCategoryFeedbackForTests();
    await hydrateCategoryFeedbackFromStorage();

    const suggestion = suggestCategoryFromParsedTransaction({
      direction: 'debit',
      merchantRaw: 'AMZN Seller Services',
      merchantNormalized: 'amzn seller services',
      sourceApp: 'gpay'
    });

    expect(suggestion.category).toBe('Bills');
    expect(suggestion.source).toBe('feedback');
  });
});
