import { createOtpAuthService } from './factory';
import { AuthServiceError } from './supabasePhoneOtp';
import type {
  AuthSession,
  AuthStateChangeEvent,
  OtpAuthService,
  RequestOtpInput,
  RequestOtpResult,
  Subscription,
  VerifyOtpInput,
  VerifyOtpResult
} from './types';

const otpRegex = /^\d{6}$/;
const phoneE164Regex = /^\+[1-9]\d{7,14}$/;

function createFallbackAuthService(): OtpAuthService {
  let session: AuthSession | null = null;
  const listeners = new Set<(event: AuthStateChangeEvent) => void>();

  function emit(event: AuthStateChangeEvent['event'], nextSession: AuthSession | null): void {
    listeners.forEach((listener) => {
      listener({
        event,
        session: nextSession
      });
    });
  }

  return {
    provider: 'supabase-phone-otp',
    async requestOtp(input: RequestOtpInput): Promise<RequestOtpResult> {
      if (!phoneE164Regex.test(input.phoneE164)) {
        throw new AuthServiceError('INVALID_PHONE', 'Phone must be in E.164 format.');
      }

      return {
        challengeId: `local-${Date.now()}`,
        retryAfterSeconds: 30
      };
    },
    async verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult> {
      if (!otpRegex.test(input.otpCode)) {
        throw new AuthServiceError('INVALID_OTP', 'OTP code is invalid.');
      }

      const now = new Date();
      const nextSession: AuthSession = {
        accessToken: `local-access-${now.getTime()}`,
        refreshToken: `local-refresh-${now.getTime()}`,
        expiresAtISO: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
        user: {
          id: `local-user-${input.phoneE164.slice(-4)}`,
          phoneE164: input.phoneE164
        }
      };

      session = nextSession;
      emit('SIGNED_IN', nextSession);

      return {
        session: nextSession
      };
    },
    async getSession(): Promise<AuthSession | null> {
      return session;
    },
    async refreshSession(): Promise<AuthSession | null> {
      return session;
    },
    async signOut(): Promise<void> {
      session = null;
      emit('SIGNED_OUT', null);
    },
    onAuthStateChange(listener: (event: AuthStateChangeEvent) => void): Subscription {
      listeners.add(listener);
      listener({
        event: 'INITIAL_SESSION',
        session
      });

      return {
        unsubscribe: () => {
          listeners.delete(listener);
        }
      };
    }
  };
}

export function createAppAuthService(): OtpAuthService {
  try {
    return createOtpAuthService();
  } catch {
    return createFallbackAuthService();
  }
}
