import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DashboardScreen } from '../../src/screens/DashboardScreen';
import * as dashboardApi from '../../src/services/dashboard/api';

jest.mock('../../src/services/dashboard/api', () => ({
  fetchDashboardSummary: jest.fn()
}));

jest.mock('../../src/services/budget/storage', () => ({
  loadBudgetConfigs: jest.fn(async () => [
    { category: 'Food', monthlyLimit: 8000 },
    { category: 'Transport', monthlyLimit: 5000 },
    { category: 'Shopping', monthlyLimit: 7000 },
    { category: 'Bills', monthlyLimit: 6000 },
    { category: 'Entertainment', monthlyLimit: 4000 },
    { category: 'Others', monthlyLimit: 3000 }
  ])
}));

const fetchDashboardSummaryMock = dashboardApi.fetchDashboardSummary as jest.MockedFunction<
  typeof dashboardApi.fetchDashboardSummary
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

describe('dashboard preview mode fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders mock visuals when live fetch fails', async () => {
    fetchDashboardSummaryMock.mockRejectedValue(new Error('Request failed'));

    let tree: any;
    await act(async () => {
      tree = renderer.create(<DashboardScreen />);
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = readRenderedText(tree.toJSON());
    expect(text).toContain('Preview mode');
    expect(text).toContain('Last updated:');
    expect(text).toContain('Category split');
    expect(text).toContain('Category breakdown');
    expect(text).toContain('Retry live data');
  });
});
