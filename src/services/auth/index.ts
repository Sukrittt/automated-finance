export type {
  AuthProvider,
  AuthSession,
  AuthStateChangeEvent,
  AuthUser,
  OtpAuthService,
  RequestOtpInput,
  RequestOtpResult,
  Subscription,
  VerifyOtpInput,
  VerifyOtpResult
} from './types';
export { createOtpAuthService, type AuthServiceFactoryOptions } from './factory';
export { createAppAuthService } from './appAuth';
export {
  AuthServiceError,
  createSupabasePhoneOtpAuthService,
  getRetryAfterSecondsFromAuthError,
  type SupabaseLikeClient
} from './supabasePhoneOtp';
