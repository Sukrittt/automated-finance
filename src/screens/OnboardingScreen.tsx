import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AuthServiceError,
  getRetryAfterSecondsFromAuthError,
  type AuthSession,
  type OtpAuthService
} from '../services/auth';
import { Button, Card, Input, Text } from '../components';
import { theme } from '../theme';

interface Props {
  onContinue: (session: AuthSession) => void;
  authService?: Pick<OtpAuthService, 'requestOtp' | 'verifyOtp'>;
  defaultCooldownSeconds?: number;
}

type AuthStep = 'intro' | 'otp';

const DEFAULT_COOLDOWN_SECONDS = 30;
const phoneE164Regex = /^\+[1-9]\d{7,14}$/;
const otpRegex = /^\d{6}$/;

const demoAuthService: Pick<OtpAuthService, 'requestOtp' | 'verifyOtp'> = {
  async requestOtp() {
    return {
      challengeId: `demo-${Date.now()}`,
      retryAfterSeconds: DEFAULT_COOLDOWN_SECONDS
    };
  },
  async verifyOtp({ otpCode }) {
    if (!otpRegex.test(otpCode)) {
      throw new AuthServiceError('INVALID_OTP', 'Please enter a valid 6-digit OTP code.');
    }

    return {
      session: {
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token',
        user: {
          id: 'demo-user'
        }
      }
    };
  }
};

function toUiError(error: unknown): string {
  if (error instanceof AuthServiceError) {
    if (error.code === 'INVALID_PHONE') {
      return 'Enter phone number in E.164 format, for example +919876543210.';
    }
    if (error.code === 'INVALID_OTP') {
      return 'Incorrect OTP. Check the 6-digit code and try again.';
    }
    if (error.code === 'OTP_EXPIRED') {
      return 'This OTP has expired. Request a new code and retry.';
    }
    if (error.code === 'RATE_LIMITED') {
      return 'Too many attempts. Please wait for cooldown before retrying.';
    }
  }

  return 'Could not complete sign in. Please try again.';
}

export function OnboardingScreen({
  onContinue,
  authService = demoAuthService,
  defaultCooldownSeconds = DEFAULT_COOLDOWN_SECONDS
}: Props) {
  const [step, setStep] = useState<AuthStep>('intro');
  const [phoneE164, setPhoneE164] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCooldownSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const canResend = cooldownSeconds <= 0 && !submitting;
  const otpCtaLabel = submitting ? 'Verifying...' : 'Verify OTP';
  const requestOtpLabel = submitting ? 'Sending OTP...' : 'Send OTP';
  const resendLabel = useMemo(() => {
    if (cooldownSeconds <= 0) {
      return 'Resend OTP';
    }

    return `Resend in ${cooldownSeconds}s`;
  }, [cooldownSeconds]);

  async function handleRequestOtp() {
    const normalizedPhone = phoneE164.trim();
    if (!phoneE164Regex.test(normalizedPhone)) {
      setErrorMessage('Enter phone number in E.164 format, for example +919876543210.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      const result = await authService.requestOtp({ phoneE164: normalizedPhone });
      setStep('otp');
      setCooldownSeconds(result.retryAfterSeconds ?? defaultCooldownSeconds);
    } catch (error) {
      const retryAfterSeconds = getRetryAfterSecondsFromAuthError(error);
      if (retryAfterSeconds && retryAfterSeconds > 0) {
        setCooldownSeconds(retryAfterSeconds);
      }
      setErrorMessage(toUiError(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp() {
    const normalizedOtpCode = otpCode.trim();
    if (!otpRegex.test(normalizedOtpCode)) {
      setErrorMessage('Enter the 6-digit OTP sent to your phone.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      const result = await authService.verifyOtp({
        phoneE164: phoneE164.trim(),
        otpCode: normalizedOtpCode
      });
      onContinue(result.session);
    } catch (error) {
      const retryAfterSeconds = getRetryAfterSecondsFromAuthError(error);
      if (retryAfterSeconds && retryAfterSeconds > 0) {
        setCooldownSeconds(retryAfterSeconds);
      }
      setErrorMessage(toUiError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text size="display" weight="700">
        Automatic money tracking, finally.
      </Text>
      <Text tone="secondary">
        Grant notification access to auto-detect UPI transactions, then verify your phone for secure sync.
      </Text>
      <Card>
        <Text size="h2" weight="700">
          Secure onboarding
        </Text>
        {step === 'intro' ? (
          <View style={styles.list}>
            <Text tone="secondary">1. Notification access (required for auto capture)</Text>
            <Text tone="secondary">2. Phone OTP (account sync)</Text>
            <Text tone="secondary">3. No READ_SMS for Play build</Text>
            <View style={styles.form}>
              <Text size="caption" tone="secondary">
                Phone Number (E.164)
              </Text>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="phone-pad"
                placeholder="+919876543210"
                value={phoneE164}
                onChangeText={setPhoneE164}
              />
            </View>
          </View>
        ) : (
          <View style={styles.list}>
            <Text tone="secondary">Code sent to {phoneE164.trim()}</Text>
            <View style={styles.form}>
              <Text size="caption" tone="secondary">
                Enter 6-digit OTP
              </Text>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="number-pad"
                placeholder="123456"
                value={otpCode}
                onChangeText={setOtpCode}
                maxLength={6}
              />
            </View>
            <Pressable disabled={submitting} onPress={() => setStep('intro')}>
              <Text size="caption" tone="muted">
                Edit phone number
              </Text>
            </Pressable>
          </View>
        )}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text size="caption" tone="negative">
              {errorMessage}
            </Text>
          </View>
        ) : null}
        {step === 'otp' ? (
          <View style={styles.resendRow}>
            <Button label={resendLabel} variant="outline" disabled={!canResend} onPress={handleRequestOtp} />
          </View>
        ) : null}
      </Card>
      {step === 'intro' ? (
        <Button label={requestOtpLabel} onPress={handleRequestOtp} disabled={submitting} />
      ) : (
        <View style={styles.primaryCtaRow}>
          <Button label={otpCtaLabel} onPress={handleVerifyOtp} disabled={submitting} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: theme.spacing.xl,
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.background
  },
  list: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm
  },
  form: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  primaryCtaRow: {
    marginTop: theme.spacing.xs
  },
  resendRow: {
    marginTop: theme.spacing.md
  },
  errorBanner: {
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#F2D4D4',
    backgroundColor: '#FFF7F7',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  }
});
