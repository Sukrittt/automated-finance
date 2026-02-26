import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AuthServiceError,
  getRetryAfterSecondsFromAuthError,
  type AuthSession,
  type OtpAuthService
} from '../services/auth';
import { Button, Card, CoachBubble, MissionCard, Input, Text } from '../components';
import { theme } from '../theme';

interface Props {
  onContinue: (session: AuthSession) => void;
  onSkip?: () => void;
  authService?: Pick<OtpAuthService, 'requestOtp' | 'verifyOtp'>;
  defaultCooldownSeconds?: number;
}

type AuthStep = 'intro' | 'otp';

const DEFAULT_COOLDOWN_SECONDS = 30;
const MAX_VERIFY_ATTEMPTS = 3;
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
    if (error.code === 'NETWORK_ERROR') {
      return 'Network issue while contacting auth service. Check connection and retry.';
    }
    if (error.code === 'TIMEOUT') {
      return 'Auth request timed out. Please retry in a moment.';
    }
  }

  return 'Could not complete sign in. Please try again.';
}

function normalizePhoneInput(value: string): string {
  const compact = value.replace(/[\s-]/g, '');
  if (!compact) {
    return '';
  }
  if (compact.startsWith('+')) {
    return compact;
  }
  if (/^\d{10}$/.test(compact)) {
    return `+91${compact}`;
  }
  return compact;
}

function maskPhone(phoneE164: string): string {
  const digits = phoneE164.replace(/[^\d]/g, '');
  if (digits.length <= 4) {
    return phoneE164;
  }
  const tail = digits.slice(-4);
  const hidden = '*'.repeat(Math.max(3, digits.length - 4));
  return `+${hidden}${tail}`;
}

export function OnboardingScreen({
  onContinue,
  onSkip,
  authService = demoAuthService,
  defaultCooldownSeconds = DEFAULT_COOLDOWN_SECONDS
}: Props) {
  const [step, setStep] = useState<AuthStep>('intro');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [verifyAttemptCount, setVerifyAttemptCount] = useState(0);
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
  const normalizedPhone = useMemo(() => normalizePhoneInput(phoneInput), [phoneInput]);
  const maskedPhone = useMemo(() => maskPhone(normalizedPhone), [normalizedPhone]);
  const otpCtaLabel = submitting ? 'Verifying...' : 'Verify & Continue';
  const requestOtpLabel = submitting ? 'Sending code...' : 'Send OTP Code';
  const resendLabel = useMemo(() => {
    if (cooldownSeconds <= 0) {
      return 'Resend code';
    }

    return `Resend in ${cooldownSeconds}s`;
  }, [cooldownSeconds]);

  async function handleRequestOtp() {
    if (!phoneE164Regex.test(normalizedPhone)) {
      setErrorMessage('Enter a valid phone number. Example: +919876543210 or 9876543210.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      const result = await authService.requestOtp({ phoneE164: normalizedPhone });
      setStep('otp');
      setCooldownSeconds(result.retryAfterSeconds ?? defaultCooldownSeconds);
      setVerifyAttemptCount(0);
      setOtpCode('');
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
        phoneE164: normalizedPhone,
        otpCode: normalizedOtpCode
      });
      setVerifyAttemptCount(0);
      onContinue(result.session);
    } catch (error) {
      const retryAfterSeconds = getRetryAfterSecondsFromAuthError(error);
      if (retryAfterSeconds && retryAfterSeconds > 0) {
        setCooldownSeconds(retryAfterSeconds);
      }

      if (error instanceof AuthServiceError && error.code === 'INVALID_OTP') {
        const nextAttempts = verifyAttemptCount + 1;
        setVerifyAttemptCount(nextAttempts);

        if (nextAttempts >= MAX_VERIFY_ATTEMPTS) {
          setCooldownSeconds(defaultCooldownSeconds);
          setErrorMessage(
            `Too many incorrect OTP attempts. Wait ${defaultCooldownSeconds}s or request a new code.`
          );
          return;
        }
      }

      setErrorMessage(toUiError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text size="display" weight="700">
        Sign in to Auto Finance
      </Text>
      <Text tone="secondary">
        Verify your phone number with OTP to keep your spending data private and synced.
      </Text>
      <Card>
        <CoachBubble
          mood="happy"
          message="Welcome back. Complete sign-in to unlock today’s spending missions."
        />
        <View style={styles.onboardingMission}>
          <MissionCard
            title="First Mission"
            description="Sign in and finish one review action to start your streak."
            progress={step === 'otp' ? 1 : 0}
            target={2}
            completed={false}
          />
        </View>
      </Card>
      <View style={styles.stepRow}>
        <View style={[styles.stepPill, step === 'intro' ? styles.stepPillActive : null]}>
          <Text size="micro" weight="700" tone={step === 'intro' ? 'primary' : 'muted'}>
            1. Phone
          </Text>
        </View>
        <View style={[styles.stepPill, step === 'otp' ? styles.stepPillActive : null]}>
          <Text size="micro" weight="700" tone={step === 'otp' ? 'primary' : 'muted'}>
            2. OTP
          </Text>
        </View>
      </View>
      <Card>
        <Text size="h2" weight="700">
          {step === 'intro' ? 'Welcome back' : 'Enter verification code'}
        </Text>
        {step === 'intro' ? (
          <View style={styles.list}>
            <Text tone="secondary">
              Use your mobile number to receive a secure one-time code.
            </Text>
            <View style={styles.form}>
              <Text size="caption" tone="secondary">
                Mobile number
              </Text>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="phone-pad"
                placeholder="+919876543210"
                value={phoneInput}
                onChangeText={setPhoneInput}
              />
              <Text size="micro" tone="muted">
                India format supported: +919876543210 or 9876543210
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.list}>
            <Text tone="secondary">Code sent to {maskedPhone}</Text>
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
                onChangeText={(value) => setOtpCode(value.replace(/[^\d]/g, '').slice(0, 6))}
                maxLength={6}
              />
            </View>
            <Pressable
              disabled={submitting}
              onPress={() => {
                setStep('intro');
                setVerifyAttemptCount(0);
                setCooldownSeconds(0);
                setErrorMessage(null);
                setOtpCode('');
              }}
            >
              <Text size="caption" tone="muted">
                Change phone number
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
          <Text size="micro" tone="muted">
            Didn’t receive the code?
          </Text>
          <Button label={resendLabel} variant="outline" disabled={!canResend} onPress={handleRequestOtp} />
        </View>
      ) : null}
      </Card>
      {step === 'intro' ? (
        <View style={styles.primaryCtaRow}>
          <Button label={requestOtpLabel} onPress={handleRequestOtp} disabled={submitting} />
        </View>
      ) : (
        <View style={styles.primaryCtaRow}>
          <Button label={otpCtaLabel} onPress={handleVerifyOtp} disabled={submitting} />
        </View>
      )}
      {onSkip ? (
        <View style={styles.skipRow}>
          <Button label="Skip Authentication (Dev)" variant="outline" onPress={onSkip} />
        </View>
      ) : null}
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
  stepRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  stepPill: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs
  },
  stepPillActive: {
    backgroundColor: theme.colors.surface
  },
  form: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  onboardingMission: {
    marginTop: theme.spacing.md
  },
  primaryCtaRow: {
    marginTop: theme.spacing.xs
  },
  skipRow: {
    marginTop: theme.spacing.sm
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
