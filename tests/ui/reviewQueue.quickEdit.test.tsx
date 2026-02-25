import React from 'react';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { ReviewQueueScreen } from '../../src/screens/ReviewQueueScreen';
import { Button } from '../../src/components/Button';
import { Chip } from '../../src/components/Chip';
import * as reviewQueueApi from '../../src/services/reviewQueue/api';

jest.mock('../../src/services/reviewQueue/api', () => ({
  fetchReviewQueue: jest.fn(),
  acceptReviewItem: jest.fn(),
  editReviewItem: jest.fn()
}));

const fetchReviewQueueMock = reviewQueueApi.fetchReviewQueue as jest.MockedFunction<
  typeof reviewQueueApi.fetchReviewQueue
>;
const editReviewItemMock = reviewQueueApi.editReviewItem as jest.MockedFunction<
  typeof reviewQueueApi.editReviewItem
>;

describe('review queue quick category edit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lets user apply a quick category chip and save', async () => {
    fetchReviewQueueMock.mockResolvedValueOnce([
      {
        id: 'rq_1',
        rawMerchant: 'AMZN Seller Services',
        extractedAmount: 799,
        suggestedCategory: 'Shopping',
        confidence: 0.62
      }
    ]);
    editReviewItemMock.mockResolvedValueOnce();

    let tree: ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ReviewQueueScreen />);
      await Promise.resolve();
    });

    const editButton = tree!.root.findAllByType(Button).find((button) => button.props.label === 'Edit');
    expect(editButton).toBeDefined();

    await act(async () => {
      editButton!.props.onPress();
      await Promise.resolve();
    });

    const billsChip = tree!.root
      .findAllByType(Chip)
      .find((chip) => chip.props.label === 'Bills' && typeof chip.props.onPress === 'function');
    expect(billsChip).toBeDefined();

    await act(async () => {
      billsChip!.props.onPress();
      await Promise.resolve();
    });

    const saveButton = tree!.root.findAllByType(Button).find((button) => button.props.label === 'Save');
    expect(saveButton).toBeDefined();

    await act(async () => {
      saveButton!.props.onPress();
      await Promise.resolve();
    });

    expect(editReviewItemMock).toHaveBeenCalledWith(
      'rq_1',
      expect.objectContaining({
        category: 'Bills',
        merchantRaw: 'AMZN Seller Services'
      })
    );
  });
});
