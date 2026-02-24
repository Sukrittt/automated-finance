import React from 'react';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { BudgetsScreen } from '../../src/screens/BudgetsScreen';
import { DashboardScreen } from '../../src/screens/DashboardScreen';
import { InsightsScreen } from '../../src/screens/InsightsScreen';
import { OnboardingScreen } from '../../src/screens/OnboardingScreen';
import { ReviewQueueScreen } from '../../src/screens/ReviewQueueScreen';
import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { TransactionsScreen } from '../../src/screens/TransactionsScreen';

jest.mock('../../src/services/reviewQueue/api', () => {
  const pending = new Promise<never>(() => undefined);

  return {
    fetchReviewQueue: jest.fn(() => pending),
    acceptReviewItem: jest.fn(() => pending),
    editReviewItem: jest.fn(() => pending)
  };
});

jest.mock('../../src/services/insights/api', () => {
  const pending = new Promise<never>(() => undefined);

  return {
    fetchWeeklyInsight: jest.fn(() => pending)
  };
});

jest.mock('../../src/services/dashboard/api', () => {
  const pending = new Promise<never>(() => undefined);

  return {
    fetchDashboardSummary: jest.fn(() => pending)
  };
});

jest.mock('../../src/services/transactions/api', () => {
  const pending = new Promise<never>(() => undefined);

  return {
    fetchTransactionsPage: jest.fn(() => pending)
  };
});

describe('Core screen snapshots', () => {
  it('matches budgets screen', async () => {
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<BudgetsScreen />);
      await Promise.resolve();
    });

    expect(tree!.toJSON()).toMatchSnapshot();
    await act(async () => {
      tree!.unmount();
    });
  });

  it('matches onboarding screen', async () => {
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<OnboardingScreen onContinue={() => undefined} />);
    });

    expect(tree!.toJSON()).toMatchSnapshot();
    await act(async () => {
      tree!.unmount();
    });
  });

  it('matches dashboard screen', async () => {
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<DashboardScreen />);
    });

    expect(tree!.toJSON()).toMatchSnapshot();
    await act(async () => {
      tree!.unmount();
    });
  });

  it('matches transactions screen', async () => {
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<TransactionsScreen />);
    });

    expect(tree!.toJSON()).toMatchSnapshot();
    await act(async () => {
      tree!.unmount();
    });
  });

  it('matches review queue loading state', async () => {
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<ReviewQueueScreen />);
    });

    expect(tree!.toJSON()).toMatchSnapshot();
    await act(async () => {
      tree!.unmount();
    });
  });

  it('matches insights loading state', async () => {
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<InsightsScreen />);
    });

    expect(tree!.toJSON()).toMatchSnapshot();
    await act(async () => {
      tree!.unmount();
    });
  });

  it('matches settings screen', async () => {
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<SettingsScreen />);
    });

    expect(tree!.toJSON()).toMatchSnapshot();
    await act(async () => {
      tree!.unmount();
    });
  });
});
