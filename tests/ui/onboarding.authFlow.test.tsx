import React from 'react';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { OnboardingScreen } from '../../src/screens/OnboardingScreen';

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

describe('onboarding auth flow', () => {
  it('normalizes a 10-digit India phone number to E.164 before requesting OTP', async () => {
    const requestOtp = jest.fn(async () => ({
      challengeId: 'challenge-1',
      retryAfterSeconds: 30
    }));
    const verifyOtp = jest.fn(async () => ({
      session: {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: 'user-1' }
      }
    }));

    let tree: ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <OnboardingScreen
          authService={{ requestOtp, verifyOtp }}
          onContinue={() => undefined}
        />
      );
    });

    const phoneInput = tree!.root.findAllByType(Input)[0];
    await act(async () => {
      phoneInput.props.onChangeText('9876543210');
    });

    const sendButton = tree!.root
      .findAllByType(Button)
      .find((button) => button.props.label === 'Send OTP Code');
    expect(sendButton).toBeDefined();

    await act(async () => {
      sendButton!.props.onPress();
      await Promise.resolve();
    });

    expect(requestOtp).toHaveBeenCalledWith({ phoneE164: '+919876543210' });

    const text = readRenderedText(tree!.toJSON());
    expect(text).toContain('Enter verification code');
    expect(text).toMatch(/Code sent to\s+\+[*]+3210/);

    await act(async () => {
      tree!.unmount();
    });
  });

  it('shows a validation error for invalid OTP input', async () => {
    const requestOtp = jest.fn(async () => ({
      challengeId: 'challenge-2',
      retryAfterSeconds: 30
    }));
    const verifyOtp = jest.fn(async () => ({
      session: {
        accessToken: 'token',
        refreshToken: 'refresh',
        user: { id: 'user-1' }
      }
    }));

    let tree: ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <OnboardingScreen
          authService={{ requestOtp, verifyOtp }}
          onContinue={() => undefined}
        />
      );
    });

    const phoneInput = tree!.root.findAllByType(Input)[0];
    await act(async () => {
      phoneInput.props.onChangeText('+919876543210');
    });

    const sendButton = tree!.root
      .findAllByType(Button)
      .find((button) => button.props.label === 'Send OTP Code');

    await act(async () => {
      sendButton!.props.onPress();
      await Promise.resolve();
    });

    const otpInput = tree!.root.findAllByType(Input)[0];
    await act(async () => {
      otpInput.props.onChangeText('12');
    });

    const verifyButton = tree!.root
      .findAllByType(Button)
      .find((button) => button.props.label === 'Verify & Continue');

    await act(async () => {
      verifyButton!.props.onPress();
      await Promise.resolve();
    });

    expect(verifyOtp).not.toHaveBeenCalled();
    const text = readRenderedText(tree!.toJSON());
    expect(text).toContain('Enter the 6-digit OTP sent to your phone.');

    await act(async () => {
      tree!.unmount();
    });
  });
});
