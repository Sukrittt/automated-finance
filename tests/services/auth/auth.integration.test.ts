import { createOtpAuthService } from '../../../src/services/auth/factory';
import { AuthServiceError, type SupabaseLikeClient } from '../../../src/services/auth/supabasePhoneOtp';
import {
  getSupabaseClient,
  resetSupabaseClientForTests,
  setSupabaseClientFactory
} from '../../../src/services/supabase/client';

function buildClient(overrides: Partial<SupabaseLikeClient['auth']> = {}): SupabaseLikeClient {
  return {
    auth: {
      signInWithOtp: jest.fn(async () => ({ data: { messageId: 'challenge-1' }, error: null })),
      verifyOtp: jest.fn(async () => ({
        data: {
          session: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_at: 1_900_000_000,
            user: {
              id: 'user-1',
              phone: '+919999999999'
            }
          }
        },
        error: null
      })),
      getSession: jest.fn(async () => ({
        data: {
          session: {
            access_token: 'session-access',
            refresh_token: 'session-refresh',
            user: {
              id: 'user-1',
              phone: '+919999999999'
            }
          }
        },
        error: null
      })),
      refreshSession: jest.fn(async () => ({ data: { session: null }, error: null })),
      signOut: jest.fn(async () => ({ error: null })),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn()
          }
        }
      })),
      ...overrides
    }
  };
}

describe('auth integration', () => {
  beforeEach(() => {
    resetSupabaseClientForTests();
  });

  afterEach(() => {
    resetSupabaseClientForTests();
  });

  it('boots a cached Supabase client and creates auth service from factory', () => {
    const firstClient = buildClient();
    const createClient = jest.fn(() => firstClient);
    setSupabaseClientFactory(createClient);

    const clientA = getSupabaseClient();
    const clientB = getSupabaseClient();
    const service = createOtpAuthService({ registerDeviceOnVerify: false });

    expect(clientA).toBe(firstClient);
    expect(clientB).toBe(firstClient);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(service.provider).toBe('supabase-phone-otp');
  });

  it('covers request, verify, session read, and sign-out flows', async () => {
    const client = buildClient();
    const service = createOtpAuthService({
      client,
      registerDeviceOnVerify: false
    });

    const otp = await service.requestOtp({ phoneE164: '+919999999999' });
    expect(otp.challengeId).toBe('challenge-1');

    const verified = await service.verifyOtp({
      phoneE164: '+919999999999',
      otpCode: '123456'
    });
    expect(verified.session.user.id).toBe('user-1');
    expect(verified.session.accessToken).toBe('access-token');

    const session = await service.getSession();
    expect(session?.accessToken).toBe('session-access');

    await expect(service.signOut()).resolves.toBeUndefined();
  });

  it('registers device after OTP verify and does not block auth on registration failure', async () => {
    const deviceError = new Error('registration down');
    const onDeviceRegistrationError = jest.fn();
    const registerCurrentDevice = jest.fn(async () => {
      throw deviceError;
    });

    const service = createOtpAuthService({
      client: buildClient(),
      deviceRegistrationService: {
        registerCurrentDevice
      },
      onDeviceRegistrationError
    });

    await expect(
      service.verifyOtp({
        phoneE164: '+919999999999',
        otpCode: '654321'
      })
    ).resolves.toMatchObject({
      session: {
        accessToken: 'access-token'
      }
    });

    expect(registerCurrentDevice).toHaveBeenCalledWith({
      accessToken: 'access-token'
    });
    expect(onDeviceRegistrationError).toHaveBeenCalledWith(deviceError);
  });

  it('maps sign-out provider errors to AuthServiceError', async () => {
    const service = createOtpAuthService({
      client: buildClient({
        signOut: jest.fn(async () => ({
          error: {
            message: 'backend exploded',
            status: 500
          }
        }))
      }),
      registerDeviceOnVerify: false
    });

    let thrown: unknown;
    try {
      await service.signOut();
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(AuthServiceError);
    expect(thrown).toMatchObject({
      code: 'AUTH_ERROR',
      status: 500
    });
  });
});
