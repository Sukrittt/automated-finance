import React from 'react';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { BudgetsScreen } from '../../src/screens/BudgetsScreen';
import { DashboardScreen } from '../../src/screens/DashboardScreen';
import { Button } from '../../src/components/Button';
import * as budgetStorage from '../../src/services/budget/storage';
import * as dashboardApi from '../../src/services/dashboard/api';

jest.mock('../../src/services/feedback/playful', () => ({
  triggerLightHaptic: jest.fn(),
  triggerSuccessHaptic: jest.fn(),
  triggerWarningHaptic: jest.fn()
}));

jest.mock('../../src/services/budget/storage', () => ({
  loadBudgetConfigs: jest.fn(),
  saveBudgetConfigs: jest.fn(),
  resetBudgetConfigs: jest.fn()
}));

jest.mock('../../src/services/dashboard/api', () => ({
  fetchDashboardSummary: jest.fn()
}));

const loadBudgetConfigsMock = budgetStorage.loadBudgetConfigs as jest.MockedFunction<
  typeof budgetStorage.loadBudgetConfigs
>;
const saveBudgetConfigsMock = budgetStorage.saveBudgetConfigs as jest.MockedFunction<
  typeof budgetStorage.saveBudgetConfigs
>;
const resetBudgetConfigsMock = budgetStorage.resetBudgetConfigs as jest.MockedFunction<
  typeof budgetStorage.resetBudgetConfigs
>;
const fetchDashboardSummaryMock = dashboardApi.fetchDashboardSummary as jest.MockedFunction<
  typeof dashboardApi.fetchDashboardSummary
>;

type RenderNode = {
  children?: Array<string | RenderNode>;
};

function readRenderedText(node: RenderNode | RenderNode[] | null): string {
  if (!node) {
    return '';
  }

  if (Array.isArray(node)) {
    return node.map(readRenderedText).join(' ');
  }

  const children: Array<string | RenderNode> = node.children ?? [];
  return children
    .map((child: string | RenderNode) =>
      typeof child === 'string' ? child : readRenderedText(child)
    )
    .join(' ');
}

describe('budget setup and dashboard recomputation', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    loadBudgetConfigsMock.mockResolvedValue([
      { category: 'Food', monthlyLimit: 7000 },
      { category: 'Transport', monthlyLimit: 5000 },
      { category: 'Shopping', monthlyLimit: 7000 },
      { category: 'Bills', monthlyLimit: 6000 },
      { category: 'Entertainment', monthlyLimit: 4000 },
      { category: 'Others', monthlyLimit: 3000 }
    ]);
    saveBudgetConfigsMock.mockImplementation(async (configs) => configs);
    resetBudgetConfigsMock.mockResolvedValue([
      { category: 'Food', monthlyLimit: 8000 },
      { category: 'Transport', monthlyLimit: 5000 },
      { category: 'Shopping', monthlyLimit: 7000 },
      { category: 'Bills', monthlyLimit: 6000 },
      { category: 'Entertainment', monthlyLimit: 4000 },
      { category: 'Others', monthlyLimit: 3000 }
    ]);
  });

  it('saves edited monthly limits from setup screen', async () => {
    let tree: ReactTestRenderer | null = null;

    await act(async () => {
      tree = renderer.create(<BudgetsScreen />);
      await Promise.resolve();
    });

    if (!tree) {
      throw new Error('Expected renderer tree to be initialized.');
    }

    const treeWithRoot = tree as ReactTestRenderer & {
      root: {
        findByProps: (props: Record<string, string>) => { props: { onChangeText: (value: string) => void } };
        findAllByType: (type: unknown) => Array<{ props: Record<string, unknown> }>;
      };
    };

    const foodInput = treeWithRoot.root.findByProps({
      accessibilityLabel: 'Food monthly limit'
    });

    await act(async () => {
      foodInput.props.onChangeText('9000');
    });

    const saveButton = treeWithRoot.root
      .findAllByType(Button)
      .find(
        (node: { props: Record<string, unknown> }) => node.props.label === 'Save Budgets'
      ) as { props: { onPress: () => void } } | undefined;
    expect(saveButton).toBeDefined();

    await act(async () => {
      saveButton?.props.onPress();
      await Promise.resolve();
    });

    expect(saveBudgetConfigsMock).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ category: 'Food', monthlyLimit: 9000 })])
    );

    const text = readRenderedText(tree.toJSON() as RenderNode | RenderNode[] | null);
    expect(text).toContain('Nice! Monthly budgets saved.');
    expect(text).toContain('Last updated:');

    await act(async () => {
      tree.unmount();
    });
  });

  it('recomputes alerts in dashboard from saved budget limits', async () => {
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

    let tree: ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<DashboardScreen />);
      await Promise.resolve();
      await Promise.resolve();
    });

    if (!tree) {
      throw new Error('Expected renderer tree to be initialized.');
    }

    const text = readRenderedText(tree.toJSON() as RenderNode | RenderNode[] | null);
    expect(text).toMatch(/91\.4\s*%\s*of\s*Rs 7,000/);

    await act(async () => {
      tree.unmount();
    });
  });
});
