import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DashboardScreen } from '../../src/screens/DashboardScreen';
import * as dashboardApi from '../../src/services/dashboard/api';
import { Chip } from '../../src/components/Chip';

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

describe('dashboard summary and category surfaces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders explicit category breakdown with amount and percentage rows', async () => {
    fetchDashboardSummaryMock.mockResolvedValue({
      summary: {
        totalSpend: 12640,
        transactionCount: 18,
        topCategory: 'Food',
        trendDeltaPct: 4.2,
        timeRange: 'week'
      },
      fromISO: '2026-02-17',
      toISO: '2026-02-24',
      dailySpend: [
        { dateISO: '2026-02-21', amount: 2100 },
        { dateISO: '2026-02-22', amount: 2450 },
        { dateISO: '2026-02-23', amount: 1890 }
      ],
      categorySplit: [
        { category: 'Food', amount: 6400, sharePct: 50.6 },
        { category: 'Transport', amount: 3200, sharePct: 25.3 }
      ]
    });

    let tree: any;
    await act(async () => {
      tree = renderer.create(<DashboardScreen />);
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = readRenderedText(tree.toJSON());
    expect(text).toContain('Week summary');
    expect(text).toContain('Category breakdown');
    expect(text).toContain('Top categories');
    expect(text).toMatch(/1\s*\.\s*Food/);
    expect(text).toMatch(/Rs 6,400\s*•\s*50\.6\s*%/);
    expect(text).toMatch(/Rs 3,200\s*•\s*25\.3\s*%/);
  });

  it('switches range selector and requests the selected range', async () => {
    fetchDashboardSummaryMock.mockResolvedValue({
      summary: {
        totalSpend: 12640,
        transactionCount: 18,
        topCategory: 'Food',
        trendDeltaPct: 4.2,
        timeRange: 'week'
      },
      fromISO: '2026-02-17',
      toISO: '2026-02-24',
      dailySpend: [{ dateISO: '2026-02-21', amount: 2100 }],
      categorySplit: [{ category: 'Food', amount: 6400, sharePct: 50.6 }]
    });

    let tree: any;
    await act(async () => {
      tree = renderer.create(<DashboardScreen />);
      await Promise.resolve();
      await Promise.resolve();
    });

    const monthChip = tree.root
      .findAllByType(Chip)
      .find((chipNode: any) => chipNode.props.label === 'Month');

    expect(monthChip).toBeDefined();

    await act(async () => {
      monthChip.props.onPress();
      await Promise.resolve();
    });

    expect(fetchDashboardSummaryMock).toHaveBeenCalledWith('week');
    expect(fetchDashboardSummaryMock).toHaveBeenCalledWith('month');
  });
});
