import type { SourceApp, TransactionDirection } from '../parsing/upiParser';

export const CATEGORY_PRECISION_TARGET = 0.9;

export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Others'
  | 'Income';

export interface CategorySuggestionInput {
  direction: TransactionDirection;
  merchantRaw: string;
  merchantNormalized?: string;
  sourceApp?: SourceApp;
}

export interface CategorySuggestion {
  category: TransactionCategory;
  confidence: number;
  source: 'credit-default' | 'feedback' | 'rule' | 'fallback';
}

type CategoryRule = {
  category: Exclude<TransactionCategory, 'Income'>;
  keywords: string[];
};

type FeedbackEntry = {
  category: TransactionCategory;
  corrections: number;
};

const FEEDBACK_BY_MERCHANT = new Map<string, FeedbackEntry>();

const RULES: CategoryRule[] = [
  {
    category: 'Food',
    keywords: ['swiggy', 'zomato', 'restaurant', 'cafe', 'coffee', 'tea', 'eatery', 'biryani', 'pizza']
  },
  {
    category: 'Transport',
    keywords: ['uber', 'ola', 'rapido', 'metro', 'irctc', 'petrol', 'fuel', 'diesel', 'cab', 'auto']
  },
  {
    category: 'Shopping',
    keywords: ['amazon', 'flipkart', 'myntra', 'meesho', 'ajio', 'nykaa', 'shop', 'mart', 'store']
  },
  {
    category: 'Bills',
    keywords: ['electricity', 'bill', 'recharge', 'broadband', 'airtel', 'jio', 'vodafone', 'bsnl', 'insurance', 'rent']
  },
  {
    category: 'Entertainment',
    keywords: ['netflix', 'spotify', 'hotstar', 'prime video', 'bookmyshow', 'youtube', 'sony liv']
  }
];

export function suggestCategoryFromParsedTransaction(
  input: CategorySuggestionInput
): CategorySuggestion {
  if (input.direction === 'credit') {
    return {
      category: 'Income',
      confidence: 0.98,
      source: 'credit-default'
    };
  }

  const merchantKey = normalizeMerchant(input.merchantNormalized || input.merchantRaw);
  const feedback = FEEDBACK_BY_MERCHANT.get(merchantKey);
  if (feedback) {
    return {
      category: feedback.category,
      confidence: Math.min(0.97, 0.84 + feedback.corrections * 0.03),
      source: 'feedback'
    };
  }

  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => merchantKey.includes(keyword))) {
      return {
        category: rule.category,
        confidence: 0.93,
        source: 'rule'
      };
    }
  }

  return {
    category: 'Others',
    confidence: 0.6,
    source: 'fallback'
  };
}

export interface CategoryFeedbackInput {
  merchantRaw?: string;
  merchantNormalized?: string;
  correctedCategory: string;
}

export function recordCategoryFeedback(input: CategoryFeedbackInput): void {
  const merchantKey = normalizeMerchant(input.merchantNormalized || input.merchantRaw || '');
  if (!merchantKey) {
    return;
  }

  const category = normalizeCategory(input.correctedCategory);
  const previous = FEEDBACK_BY_MERCHANT.get(merchantKey);

  FEEDBACK_BY_MERCHANT.set(merchantKey, {
    category,
    corrections: (previous?.corrections ?? 0) + 1
  });
}

function normalizeCategory(value: string): TransactionCategory {
  const normalized = value.trim().replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();

  switch (lower) {
    case 'food':
      return 'Food';
    case 'transport':
      return 'Transport';
    case 'shopping':
      return 'Shopping';
    case 'bills':
      return 'Bills';
    case 'entertainment':
      return 'Entertainment';
    case 'other':
    case 'others':
      return 'Others';
    case 'income':
      return 'Income';
    default:
      return toTitleCase(normalized) as TransactionCategory;
  }
}

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`)
    .join(' ');
}

function normalizeMerchant(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function __resetCategoryFeedbackForTests(): void {
  FEEDBACK_BY_MERCHANT.clear();
}
