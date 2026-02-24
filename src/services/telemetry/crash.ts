import { getNoopTelemetryReporter, type TelemetryReporter } from './reporter';

type GlobalErrorHandler = (error: unknown, isFatal?: boolean) => void;

type ErrorUtilsLike = {
  getGlobalHandler: () => GlobalErrorHandler;
  setGlobalHandler: (handler: GlobalErrorHandler) => void;
};

let installed = false;

function getErrorUtils(): ErrorUtilsLike | undefined {
  const maybeErrorUtils = (globalThis as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
  if (
    !maybeErrorUtils ||
    typeof maybeErrorUtils.getGlobalHandler !== 'function' ||
    typeof maybeErrorUtils.setGlobalHandler !== 'function'
  ) {
    return undefined;
  }

  return maybeErrorUtils;
}

export function installCrashTelemetry(reporter: TelemetryReporter = getNoopTelemetryReporter()): void {
  if (installed) {
    return;
  }

  const errorUtils = getErrorUtils();
  if (!errorUtils) {
    return;
  }

  const previousHandler = errorUtils.getGlobalHandler();
  errorUtils.setGlobalHandler((error, isFatal) => {
    reporter.track({
      name: 'app_crash_captured',
      atISO: new Date().toISOString(),
      properties: {
        is_fatal: Boolean(isFatal),
        message: error instanceof Error ? error.message : String(error)
      }
    });
    previousHandler(error, isFatal);
  });

  reporter.track({
    name: 'app_crash_handler_installed',
    atISO: new Date().toISOString()
  });

  installed = true;
}

export function __resetCrashTelemetryForTests(): void {
  installed = false;
}

