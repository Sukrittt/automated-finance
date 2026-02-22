import { createDeviceRegistrationService, type DeviceRegistrationService } from '../device/register';
import { getSupabaseClient } from '../supabase/client';
import { createSupabasePhoneOtpAuthService, type SupabaseLikeClient } from './supabasePhoneOtp';
import type { OtpAuthService, VerifyOtpInput, VerifyOtpResult } from './types';

export interface AuthServiceFactoryOptions {
  client?: SupabaseLikeClient;
  registerDeviceOnVerify?: boolean;
  deviceRegistrationService?: DeviceRegistrationService;
  onDeviceRegistrationError?: (error: unknown) => void;
}

export function createOtpAuthService(options: AuthServiceFactoryOptions = {}): OtpAuthService {
  const {
    client = getSupabaseClient(),
    registerDeviceOnVerify = true,
    deviceRegistrationService = createDeviceRegistrationService(),
    onDeviceRegistrationError
  } = options;

  const baseService = createSupabasePhoneOtpAuthService(client);

  if (!registerDeviceOnVerify) {
    return baseService;
  }

  return {
    ...baseService,
    async verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult> {
      const result = await baseService.verifyOtp(input);

      try {
        await deviceRegistrationService.registerCurrentDevice({
          accessToken: result.session.accessToken
        });
      } catch (error) {
        onDeviceRegistrationError?.(error);
      }

      return result;
    }
  };
}
