import { apiRequest } from '../api/client';

export type NotificationPermission = 'granted' | 'denied' | 'undetermined' | 'unknown';
export type ListenerServiceStatus = 'enabled' | 'disabled' | 'unknown';

export interface DeviceRegistrationPayload {
  install_id: string;
  platform: string;
  manufacturer: string;
  model: string;
  os_version: string;
  app_version: string;
  notification_permission: NotificationPermission;
  listener_service_status: ListenerServiceStatus;
}

export interface DeviceRegistrationResult {
  device_id: string;
  registered_at: string;
}

export interface RegisterDeviceInput {
  accessToken: string;
  payload?: DeviceRegistrationPayload;
}

export interface DeviceRegistrationService {
  registerCurrentDevice: (input: RegisterDeviceInput) => Promise<DeviceRegistrationResult>;
}

function generateInstallId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `install-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

let installId = generateInstallId();

function getDefaultPayload(): DeviceRegistrationPayload {
  const platform = process.env.EXPO_PUBLIC_DEVICE_PLATFORM?.trim() || 'android';
  return {
    install_id: installId,
    platform,
    manufacturer: process.env.EXPO_PUBLIC_DEVICE_MANUFACTURER?.trim() || 'unknown',
    model: process.env.EXPO_PUBLIC_DEVICE_MODEL?.trim() || 'unknown',
    os_version: process.env.EXPO_PUBLIC_DEVICE_OS_VERSION?.trim() || 'unknown',
    app_version: process.env.EXPO_PUBLIC_APP_VERSION?.trim() || '0.1.0',
    notification_permission: 'unknown',
    listener_service_status: 'unknown'
  };
}

export async function registerDevice(input: RegisterDeviceInput): Promise<DeviceRegistrationResult> {
  return apiRequest<DeviceRegistrationResult>('/v1/device/register', {
    method: 'POST',
    token: input.accessToken,
    body: input.payload ?? getDefaultPayload()
  });
}

export function createDeviceRegistrationService(): DeviceRegistrationService {
  return {
    registerCurrentDevice: registerDevice
  };
}

export function resetDeviceRegistrationForTests(nextInstallId = 'install-test-id'): void {
  installId = nextInstallId;
}
