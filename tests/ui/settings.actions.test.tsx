import React from 'react';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { Button } from '../../src/components/Button';
import { SettingsScreen } from '../../src/screens/SettingsScreen';

jest.mock('../../src/services/feedback/playful', () => ({
  triggerLightHaptic: jest.fn(),
  triggerSuccessHaptic: jest.fn(),
  triggerWarningHaptic: jest.fn()
}));

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

describe('settings quick actions', () => {
  it('shows status copy when export data is tapped', async () => {
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<SettingsScreen />);
    });

    const exportButton = tree!.root
      .findAllByType(Button)
      .find((button) => button.props.label === 'Export Data');
    expect(exportButton).toBeDefined();

    await act(async () => {
      exportButton!.props.onPress();
    });

    const text = readRenderedText(tree!.toJSON());
    expect(text).toContain('Export request flow is coming soon in this build.');

    await act(async () => {
      tree!.unmount();
    });
  });

  it('shows status copy when delete account is tapped', async () => {
    let tree: ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<SettingsScreen />);
    });

    const deleteButton = tree!.root
      .findAllByType(Button)
      .find((button) => button.props.label === 'Delete Account');
    expect(deleteButton).toBeDefined();

    await act(async () => {
      deleteButton!.props.onPress();
    });

    const text = readRenderedText(tree!.toJSON());
    expect(text).toContain('Delete account requires support confirmation in this build.');

    await act(async () => {
      tree!.unmount();
    });
  });
});
