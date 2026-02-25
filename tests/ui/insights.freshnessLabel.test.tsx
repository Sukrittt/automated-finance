import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { InsightsScreen } from '../../src/screens/InsightsScreen';
import * as insightsApi from '../../src/services/insights/api';
import * as dashboardApi from '../../src/services/dashboard/api';

jest.mock('../../src/services/insights/api', () => ({
  fetchWeeklyInsight: jest.fn()
}));

jest.mock('../../src/services/dashboard/api', () => ({
  fetchDashboardSummary: jest.fn()
}));

const fetchWeeklyInsightMock = insightsApi.fetchWeeklyInsight as jest.MockedFunction<
  typeof insightsApi.fetchWeeklyInsight
>;
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

describe('insights freshness label', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows last-updated label for ready insights', async () => {
    fetchWeeklyInsightMock.mockResolvedValue({
      status: 'ready',
      weekStartISO: '2026-02-16',
      generatedAtISO: '2026-02-25T10:00:00.000Z',
      insight: {
        weekStartISO: '2026-02-16',
        summary: 'Spend up 9%',
        topLeak: 'Food',
        improvementTip: 'Reduce dine out'
      }
    });
    fetchDashboardSummaryMock.mockResolvedValue({
      summary: {
        totalSpend: 12340,
        transactionCount: 26,
        topCategory: 'Food',
        trendDeltaPct: 5.9,
        timeRange: 'week'
      },
      fromISO: '2026-02-16',
      toISO: '2026-02-22',
      dailySpend: [{ dateISO: '2026-02-20', amount: 2100 }],
      categorySplit: [{ category: 'Food', amount: 6400, sharePct: 51.9 }]
    });

    let tree: any;
    await act(async () => {
      tree = renderer.create(<InsightsScreen />);
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = readRenderedText(tree.toJSON());
    expect(text).toContain('Last updated:');
  });
});
