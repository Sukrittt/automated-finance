import React from 'react';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { ReviewQueueScreen } from '../../src/screens/ReviewQueueScreen';
import { Button } from '../../src/components/Button';
import * as reviewQueueApi from '../../src/services/reviewQueue/api';

jest.mock('../../src/services/reviewQueue/api', () => ({
  fetchReviewQueue: jest.fn(),
  acceptReviewItem: jest.fn(),
  editReviewItem: jest.fn()
}));

const fetchReviewQueueMock = reviewQueueApi.fetchReviewQueue as jest.MockedFunction<
  typeof reviewQueueApi.fetchReviewQueue
>;

function createPendingPromise<T>() {
  return new Promise<T>(() => undefined);
}

function readRenderedText(node: renderer.ReactTestRendererJSON | renderer.ReactTestRendererJSON[] | null) {
  if (!node) {
    return '';
  }

  if (Array.isArray(node)) {
    return node.map(readRenderedText).join(' ');
  }

  const children = node.children ?? [];
  return children
    .map((child) => (typeof child === 'string' ? child : readRenderedText(child)))
    .join(' ');
}

describe('review queue UX states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchReviewQueueMock.mockImplementation(() => createPendingPromise());
  });

  it('shows loading state while queue is in-flight', async () => {
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<ReviewQueueScreen />);
    });

    const text = readRenderedText(tree!.toJSON());
    expect(text).toContain('Loading review queue...');

    await act(async () => {
      tree!.unmount();
    });
  });

  it('shows empty state when queue has no pending items', async () => {
    fetchReviewQueueMock.mockResolvedValueOnce([]);
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<ReviewQueueScreen />);
      await Promise.resolve();
    });

    const text = readRenderedText(tree!.toJSON());
    expect(text).toContain('All clear');
    expect(text).toContain('No pending items in your review queue.');
    expect(text).toContain('Last updated:');
    expect(text).not.toContain('Loading review queue...');

    await act(async () => {
      tree!.unmount();
    });
  });

  it('shows preview fallback and retry can recover to empty state', async () => {
    fetchReviewQueueMock
      .mockRejectedValueOnce(new Error('Review queue unavailable'))
      .mockResolvedValueOnce([]);
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<ReviewQueueScreen />);
      await Promise.resolve();
    });

    let text = readRenderedText(tree!.toJSON());
    expect(text).toContain('Preview mode');
    expect(text).toContain('Last updated:');
    expect(text).toContain('Retry live data');

    const retryButton = tree!.root
      .findAllByType(Button)
      .find((button) => button.props.label === 'Retry live data');
    expect(retryButton).toBeDefined();

    await act(async () => {
      retryButton!.props.onPress();
      await Promise.resolve();
    });

    text = readRenderedText(tree!.toJSON());
    expect(text).toContain('All clear');
    expect(text).not.toContain('Preview mode');
    expect(fetchReviewQueueMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      tree!.unmount();
    });
  });
});
