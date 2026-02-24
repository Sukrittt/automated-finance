import {
  __resetRecentTelemetryEventsForTests,
  createConsoleTelemetryReporter,
  getRecentTelemetryEvents
} from '../../../src/services/telemetry/runtimeReporter';

describe('runtime telemetry reporter', () => {
  beforeEach(() => {
    __resetRecentTelemetryEventsForTests();
  });

  it('logs tracked events and stores recent history', () => {
    const logger = jest.fn();
    const reporter = createConsoleTelemetryReporter(logger);

    reporter.track({
      name: 'otp_request_succeeded',
      atISO: '2026-02-24T00:00:00.000Z',
      properties: {
        provider: 'supabase-phone-otp'
      }
    });

    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining('"name":"otp_request_succeeded"')
    );
    expect(getRecentTelemetryEvents()).toEqual([
      expect.objectContaining({
        name: 'otp_request_succeeded'
      })
    ]);
  });
});

