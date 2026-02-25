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

describe('insights preview mode fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders demo insights when live insight fetch fails', async () => {
    fetchWeeklyInsightMock.mockRejectedValue(new Error('Insights unavailable'));
    fetchDashboardSummaryMock.mockRejectedValue(new Error('Summary unavailable'));

    let tree: any;
    await act(async () => {
      tree = renderer.create(<InsightsScreen />);
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = readRenderedText(tree.toJSON());
    expect(text).toContain('Preview mode');
    expect(text).toContain('Retry live data');
    expect(text).toContain('Summary');
    expect(text).toContain('Top Leak');
    expect(text).toContain('Top categories this week');
  });
});
