export type AuthProvider = 'supabase-phone-otp';

export interface AuthUser {
  id: string;
  phoneE164?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAtISO?: string;
  user: AuthUser;
}

export interface RequestOtpInput {
  phoneE164: string;
}

export interface RequestOtpResult {
  challengeId: string;
  retryAfterSeconds?: number;
}

export interface VerifyOtpInput {
  phoneE164: string;
  otpCode: string;
}

export interface VerifyOtpResult {
  session: AuthSession;
}

export interface AuthStateChangeEvent {
  event:
    | 'INITIAL_SESSION'
    | 'SIGNED_IN'
    | 'SIGNED_OUT'
    | 'PASSWORD_RECOVERY'
    | 'TOKEN_REFRESHED'
    | 'USER_UPDATED';
  session: AuthSession | null;
}

export interface Subscription {
  unsubscribe: () => void;
}

export interface OtpAuthService {
  provider: AuthProvider;
  requestOtp: (input: RequestOtpInput) => Promise<RequestOtpResult>;
  verifyOtp: (input: VerifyOtpInput) => Promise<VerifyOtpResult>;
  getSession: () => Promise<AuthSession | null>;
  refreshSession: () => Promise<AuthSession | null>;
  signOut: () => Promise<void>;
  onAuthStateChange: (listener: (event: AuthStateChangeEvent) => void) => Subscription;
}

