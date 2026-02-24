import { createDeviceRegistrationService, type DeviceRegistrationService } from '../device/register';
import { getSupabaseClient } from '../supabase/client';
import { getNoopTelemetryReporter, type TelemetryReporter } from '../telemetry/reporter';
import { createSupabasePhoneOtpAuthService, type SupabaseLikeClient } from './supabasePhoneOtp';
import type { OtpAuthService, VerifyOtpInput, VerifyOtpResult } from './types';
import { AuthServiceError } from './supabasePhoneOtp';

export interface AuthServiceFactoryOptions {
  client?: SupabaseLikeClient;
  registerDeviceOnVerify?: boolean;
  deviceRegistrationService?: DeviceRegistrationService;
  onDeviceRegistrationError?: (error: unknown) => void;
  telemetryReporter?: TelemetryReporter;
}

export function createOtpAuthService(options: AuthServiceFactoryOptions = {}): OtpAuthService {
  const {
    client = getSupabaseClient(),
    registerDeviceOnVerify = true,
    deviceRegistrationService = createDeviceRegistrationService(),
    onDeviceRegistrationError,
    telemetryReporter = getNoopTelemetryReporter()
  } = options;

  const baseService = createSupabasePhoneOtpAuthService(client);

  const serviceWithDeviceRegistration = !registerDeviceOnVerify
    ? baseService
    : {
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

  return {
    ...serviceWithDeviceRegistration,
    async requestOtp(input) {
      try {
        const result = await serviceWithDeviceRegistration.requestOtp(input);
        telemetryReporter.track({
          name: 'otp_request_succeeded',
          atISO: new Date().toISOString(),
          properties: {
            provider: serviceWithDeviceRegistration.provider
          }
        });
        return result;
      } catch (error) {
        telemetryReporter.track({
          name: 'otp_request_failed',
          atISO: new Date().toISOString(),
          properties: {
            provider: serviceWithDeviceRegistration.provider,
            error_code: error instanceof AuthServiceError ? error.code : 'UNKNOWN'
          }
        });
        throw error;
      }
    },
    async verifyOtp(input) {
      try {
        const result = await serviceWithDeviceRegistration.verifyOtp(input);
        telemetryReporter.track({
          name: 'otp_verify_succeeded',
          atISO: new Date().toISOString(),
          properties: {
            provider: serviceWithDeviceRegistration.provider
          }
        });
        return result;
      } catch (error) {
        telemetryReporter.track({
          name: 'otp_verify_failed',
          atISO: new Date().toISOString(),
          properties: {
            provider: serviceWithDeviceRegistration.provider,
            error_code: error instanceof AuthServiceError ? error.code : 'UNKNOWN'
          }
        });
        throw error;
      }
    }
  };
}
