import React from 'react';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { TransactionsScreen } from '../../src/screens/TransactionsScreen';
import { Chip } from '../../src/components/Chip';
import * as transactionsApi from '../../src/services/transactions/api';

jest.mock('../../src/services/transactions/api', () => ({
  fetchTransactionsPage: jest.fn()
}));

const fetchTransactionsPageMock = transactionsApi.fetchTransactionsPage as jest.MockedFunction<
  typeof transactionsApi.fetchTransactionsPage
>;

function readRenderedText(node: any): string {
  if (!node) {
    return '';
  }
  if (Array.isArray(node)) {
    return node.map(readRenderedText).join(' ');
  }
  const children = node.children ?? [];
  return children
    .map((child: any) => (typeof child === 'string' ? child : readRenderedText(child)))
    .join(' ');
}

describe('transactions filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('filters visible transactions by direction chips', async () => {
    fetchTransactionsPageMock.mockResolvedValue({
      items: [
        {
          id: 'txn_1',
          merchant: 'Swiggy',
          amount: 320,
          direction: 'debit',
          category: 'Food',
          txnAtISO: '2026-02-20T10:00:00.000Z',
          sourceApp: 'gpay'
        },
        {
          id: 'txn_2',
          merchant: 'Salary',
          amount: 10000,
          direction: 'credit',
          category: 'Income',
          txnAtISO: '2026-02-20T09:00:00.000Z',
          sourceApp: 'paytm'
        }
      ],
      nextCursor: undefined
    });

    let tree: ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<TransactionsScreen />);
      await Promise.resolve();
      await Promise.resolve();
    });

    let text = readRenderedText(tree!.toJSON());
    expect(text).toContain('Swiggy');
    expect(text).toContain('Salary');

    const debitsChip = tree!.root
      .findAllByType(Chip)
      .find((chip) => chip.props.label === 'Debits' && typeof chip.props.onPress === 'function');
    expect(debitsChip).toBeDefined();

    await act(async () => {
      debitsChip!.props.onPress();
      await Promise.resolve();
    });

    text = readRenderedText(tree!.toJSON());
    expect(text).toContain('Swiggy');
    expect(text).not.toContain('Salary');

    const creditsChip = tree!.root
      .findAllByType(Chip)
      .find((chip) => chip.props.label === 'Credits' && typeof chip.props.onPress === 'function');
    expect(creditsChip).toBeDefined();

    await act(async () => {
      creditsChip!.props.onPress();
      await Promise.resolve();
    });

    text = readRenderedText(tree!.toJSON());
    expect(text).not.toContain('Swiggy');
    expect(text).toContain('Salary');
  });

  it('renders newest transactions first regardless of API order', async () => {
    fetchTransactionsPageMock.mockResolvedValue({
      items: [
        {
          id: 'txn_old',
          merchant: 'Old Merchant',
          amount: 100,
          direction: 'debit',
          category: 'Food',
          txnAtISO: '2026-02-19T09:00:00.000Z',
          sourceApp: 'gpay'
        },
        {
          id: 'txn_new',
          merchant: 'New Merchant',
          amount: 200,
          direction: 'debit',
          category: 'Food',
          txnAtISO: '2026-02-20T09:00:00.000Z',
          sourceApp: 'gpay'
        }
      ],
      nextCursor: undefined
    });

    let tree: ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<TransactionsScreen />);
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = readRenderedText(tree!.toJSON());
    const newIndex = text.indexOf('New Merchant');
    const oldIndex = text.indexOf('Old Merchant');

    expect(newIndex).toBeGreaterThanOrEqual(0);
    expect(oldIndex).toBeGreaterThanOrEqual(0);
    expect(newIndex).toBeLessThan(oldIndex);
  });
});
