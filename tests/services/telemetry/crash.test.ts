import { __resetCrashTelemetryForTests, installCrashTelemetry } from '../../../src/services/telemetry/crash';

type GlobalErrorHandler = (error: unknown, isFatal?: boolean) => void;

describe('installCrashTelemetry', () => {
  const originalErrorUtils = (globalThis as { ErrorUtils?: unknown }).ErrorUtils;

  beforeEach(() => {
    __resetCrashTelemetryForTests();
  });

  afterEach(() => {
    __resetCrashTelemetryForTests();
    (globalThis as { ErrorUtils?: unknown }).ErrorUtils = originalErrorUtils;
  });

  it('installs crash handler and forwards captured crashes', () => {
    const forwarded = jest.fn();
    let installedHandler: GlobalErrorHandler | null = null;
    const track = jest.fn();

    (globalThis as { ErrorUtils?: unknown }).ErrorUtils = {
      getGlobalHandler: () => forwarded,
      setGlobalHandler: (handler: GlobalErrorHandler) => {
        installedHandler = handler;
      }
    };

    installCrashTelemetry({ track });

    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'app_crash_handler_installed'
      })
    );
    expect(installedHandler).not.toBeNull();

    installedHandler?.(new Error('boom'), true);
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'app_crash_captured',
        properties: expect.objectContaining({
          is_fatal: true,
          message: 'boom'
        })
      })
    );
    expect(forwarded).toHaveBeenCalledWith(expect.any(Error), true);
  });

  it('is idempotent and does not reinstall handler twice', () => {
    const setGlobalHandler = jest.fn();
    const track = jest.fn();

    (globalThis as { ErrorUtils?: unknown }).ErrorUtils = {
      getGlobalHandler: () => jest.fn(),
      setGlobalHandler
    };

    installCrashTelemetry({ track });
    installCrashTelemetry({ track });

    expect(setGlobalHandler).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'app_crash_handler_installed'
      })
    );
  });
});

