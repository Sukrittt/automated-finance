import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TransactionsScreen } from '../../src/screens/TransactionsScreen';
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

describe('transactions preview mode fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders demo transactions when live fetch fails', async () => {
    fetchTransactionsPageMock.mockRejectedValue(new Error('Transactions unavailable'));

    let tree: any;
    await act(async () => {
      tree = renderer.create(<TransactionsScreen />);
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = readRenderedText(tree.toJSON());
    expect(text).toContain('Preview mode');
    expect(text).toContain('Last updated:');
    expect(text).toContain('Retry live data');
    expect(text).toContain('Amazon Pay');
    expect(text).toContain('Swiggy');
  });
});
