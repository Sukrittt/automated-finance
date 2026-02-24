import type { TelemetryEvent, TelemetryReporter } from './reporter';

const MAX_RECENT_EVENTS = 200;

const recentEvents: TelemetryEvent[] = [];

function defaultLogger(line: string): void {
  // Keep telemetry sink lightweight and dependency-free for closed beta.
  console.info(line);
}

export function createConsoleTelemetryReporter(
  logger: (line: string) => void = defaultLogger
): TelemetryReporter {
  return {
    track(event) {
      recentEvents.push(event);
      if (recentEvents.length > MAX_RECENT_EVENTS) {
        recentEvents.shift();
      }

      logger(`[telemetry] ${JSON.stringify(event)}`);
    }
  };
}

const runtimeTelemetryReporter = createConsoleTelemetryReporter();

export function getRuntimeTelemetryReporter(): TelemetryReporter {
  return runtimeTelemetryReporter;
}

export function getRecentTelemetryEvents(): TelemetryEvent[] {
  return [...recentEvents];
}

export function __resetRecentTelemetryEventsForTests(): void {
  recentEvents.length = 0;
}

