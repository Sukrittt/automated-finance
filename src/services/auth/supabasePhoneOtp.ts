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

type SupabaseSessionUser = {
  id: string;
  phone?: string | null;
};

type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number | null;
  user: SupabaseSessionUser;
};

type SupabaseAuthChangeEvent = AuthStateChangeEvent['event'];

type SupabaseAuthError = {
  message: string;
  status?: number;
  name?: string;
};

type SupabaseOtpRequestResult = {
  data: {
    messageId?: string | null;
  } | null;
  error: SupabaseAuthError | null;
};

type SupabaseOtpVerifyResult = {
  data: {
    session: SupabaseSession | null;
  } | null;
  error: SupabaseAuthError | null;
};

type SupabaseSessionResult = {
  data: {
    session: SupabaseSession | null;
  } | null;
  error: SupabaseAuthError | null;
};

type SupabaseAuthSubscription = {
  unsubscribe: () => void;
};

interface SupabaseLikeAuthClient {
  signInWithOtp: (params: { phone: string }) => Promise<SupabaseOtpRequestResult>;
  verifyOtp: (params: {
    phone: string;
    token: string;
    type: 'sms';
  }) => Promise<SupabaseOtpVerifyResult>;
  getSession: () => Promise<SupabaseSessionResult>;
  refreshSession: () => Promise<SupabaseSessionResult>;
  signOut: () => Promise<{ error: SupabaseAuthError | null }>;
  onAuthStateChange: (
    callback: (event: SupabaseAuthChangeEvent, session: SupabaseSession | null) => void
  ) => {
    data: {
      subscription: SupabaseAuthSubscription;
    };
  };
}

export interface SupabaseLikeClient {
  auth: SupabaseLikeAuthClient;
}

export class AuthServiceError extends Error {
  code: string;
  status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export interface SupabasePhoneOtpAuthOptions {
  requestTimeoutMs?: number;
  requestOtpMaxRetries?: number;
  sleepMs?: (durationMs: number) => Promise<void>;
}

function toIsoFromUnixSeconds(value?: number | null): string | undefined {
  if (!value || !Number.isFinite(value)) {
    return undefined;
  }

  return new Date(value * 1000).toISOString();
}

function toAuthSession(session: SupabaseSession): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAtISO: toIsoFromUnixSeconds(session.expires_at),
    user: {
      id: session.user.id,
      phoneE164: session.user.phone ?? undefined
    }
  };
}

function parseRetryAfterSeconds(message: string): number | undefined {
  const match = message.match(/(\d+)\s*seconds?/i);
  if (!match) {
    return undefined;
  }

  const seconds = Number(match[1]);
  return Number.isFinite(seconds) ? seconds : undefined;
}

function mapSupabaseError(error: SupabaseAuthError): AuthServiceError {
  const message = error.message || 'Auth request failed';
  const lower = message.toLowerCase();
  const status = error.status;

  if (lower.includes('invalid') && lower.includes('otp')) {
    return new AuthServiceError('INVALID_OTP', message, status);
  }
  if (lower.includes('expired') && lower.includes('otp')) {
    return new AuthServiceError('OTP_EXPIRED', message, status);
  }
  if (lower.includes('too many') || lower.includes('rate')) {
    return new AuthServiceError('RATE_LIMITED', message, status);
  }
  if (lower.includes('phone')) {
    return new AuthServiceError('INVALID_PHONE', message, status);
  }

  return new AuthServiceError('AUTH_ERROR', message, status);
}

function isTransientAuthError(error: AuthServiceError): boolean {
  if (error.code === 'TIMEOUT' || error.code === 'NETWORK_ERROR') {
    return true;
  }

  if (error.code === 'AUTH_ERROR' && (error.status === undefined || error.status >= 500)) {
    return true;
  }

  return false;
}

function toAuthServiceError(error: unknown): AuthServiceError {
  if (error instanceof AuthServiceError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message || 'Auth request failed';
    if (/network|fetch|connection|timeout/i.test(message)) {
      return new AuthServiceError('NETWORK_ERROR', message);
    }

    return new AuthServiceError('AUTH_ERROR', message);
  }

  return new AuthServiceError('AUTH_ERROR', 'Auth request failed');
}

async function runWithTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new AuthServiceError('TIMEOUT', timeoutMessage));
    }, timeoutMs);

    operation
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error: unknown) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function defaultSleepMs(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

export function createSupabasePhoneOtpAuthService(
  client: SupabaseLikeClient,
  options: SupabasePhoneOtpAuthOptions = {}
): OtpAuthService {
  const requestTimeoutMs = options.requestTimeoutMs ?? 10_000;
  const requestOtpMaxRetries = Math.max(0, options.requestOtpMaxRetries ?? 2);
  const sleepMs = options.sleepMs ?? defaultSleepMs;

  async function callWithTimeout<T>(operation: () => Promise<T>, timeoutLabel: string): Promise<T> {
    try {
      return await runWithTimeout(operation(), requestTimeoutMs, `${timeoutLabel} timed out`);
    } catch (error) {
      throw toAuthServiceError(error);
    }
  }

  return {
    provider: 'supabase-phone-otp',
    async requestOtp(input: RequestOtpInput): Promise<RequestOtpResult> {
      let attempt = 0;
      let lastError: AuthServiceError | null = null;

      while (attempt <= requestOtpMaxRetries) {
        try {
          const result = await callWithTimeout(
            () => client.auth.signInWithOtp({ phone: input.phoneE164 }),
            'OTP request'
          );
          if (result.error) {
            throw mapSupabaseError(result.error);
          }

          const challengeId = result.data?.messageId || `${Date.now()}`;

          return {
            challengeId
          };
        } catch (error) {
          const mapped = toAuthServiceError(error);
          lastError = mapped;
          if (attempt >= requestOtpMaxRetries || !isTransientAuthError(mapped)) {
            throw mapped;
          }

          const backoffMs = 250 * Math.pow(2, attempt);
          await sleepMs(backoffMs);
          attempt += 1;
        }
      }

      throw lastError ?? new AuthServiceError('AUTH_ERROR', 'Auth request failed');
    },
    async verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult> {
      const result = await callWithTimeout(
        () =>
          client.auth.verifyOtp({
            phone: input.phoneE164,
            token: input.otpCode,
            type: 'sms'
          }),
        'OTP verification'
      );

      if (result.error) {
        throw mapSupabaseError(result.error);
      }

      const session = result.data?.session;
      if (!session) {
        throw new AuthServiceError('SESSION_MISSING', 'OTP verified but session is missing');
      }

      return {
        session: toAuthSession(session)
      };
    },
    async getSession(): Promise<AuthSession | null> {
      const result = await callWithTimeout(() => client.auth.getSession(), 'Get session');
      if (result.error) {
        throw mapSupabaseError(result.error);
      }

      return result.data?.session ? toAuthSession(result.data.session) : null;
    },
    async refreshSession(): Promise<AuthSession | null> {
      const result = await callWithTimeout(() => client.auth.refreshSession(), 'Refresh session');
      if (result.error) {
        throw mapSupabaseError(result.error);
      }

      return result.data?.session ? toAuthSession(result.data.session) : null;
    },
    async signOut(): Promise<void> {
      const result = await callWithTimeout(() => client.auth.signOut(), 'Sign out');
      if (result.error) {
        throw mapSupabaseError(result.error);
      }
    },
    onAuthStateChange(listener: (event: AuthStateChangeEvent) => void): Subscription {
      const subscription = client.auth.onAuthStateChange((event, session) => {
        listener({
          event,
          session: session ? toAuthSession(session) : null
        });
      });

      return {
        unsubscribe: () => subscription.data.subscription.unsubscribe()
      };
    }
  };
}

export function getRetryAfterSecondsFromAuthError(error: unknown): number | undefined {
  if (!(error instanceof AuthServiceError)) {
    return undefined;
  }

  return parseRetryAfterSeconds(error.message);
}
