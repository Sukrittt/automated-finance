export interface TelemetryEvent {
  name:
    | 'otp_request_succeeded'
    | 'otp_request_failed'
    | 'otp_verify_succeeded'
    | 'otp_verify_failed'
    | 'app_crash_handler_installed'
    | 'app_crash_captured'
    | 'ingest_parse_failed'
    | 'ingest_duplicate_dropped'
    | 'ingest_event_enqueued'
    | 'ingest_flush_succeeded'
    | 'ingest_queue_size_sample';
  atISO: string;
  properties?: Record<string, string | number | boolean | null | undefined>;
}

export interface TelemetryReporter {
  track: (event: TelemetryEvent) => void;
}

const noopTelemetryReporter: TelemetryReporter = {
  track: () => undefined
};

export function getNoopTelemetryReporter(): TelemetryReporter {
  return noopTelemetryReporter;
}
