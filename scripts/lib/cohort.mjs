import fs from 'node:fs';

const REQUIRED_HEADERS = [
  'name',
  'channel',
  'segment',
  'invited_at_ist',
  'accepted',
  'onboarded',
  'onboarded_at_ist',
  'notes',
];

const VALID_SEGMENTS = new Set(['active', 'moderate', 'edge-case']);
const IST_OFFSET_MINUTES = 5 * 60 + 30;

function parseBool(value) {
  const normalized = (value || '').trim().toLowerCase();
  return normalized === 'yes' || normalized === 'true' || normalized === '1';
}

function parseIstToUtcIso(value) {
  const raw = (value || '').trim();
  if (!raw) {
    return null;
  }

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  const utcMillis =
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    ) -
    IST_OFFSET_MINUTES * 60 * 1000;

  return new Date(utcMillis).toISOString();
}

function toRows(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = lines[0].split(',').map((item) => item.trim());
  const rows = lines.slice(1).map((line, index) => {
    const cells = line.split(',').map((item) => item.trim());
    const row = {};
    headers.forEach((header, headerIndex) => {
      row[header] = cells[headerIndex] ?? '';
    });
    row.__line = index + 2;
    return row;
  });

  return { headers, rows };
}

function countBySegment(rows, segment, predicate) {
  return rows.filter((row) => row.segment === segment && predicate(row)).length;
}

function getWarnings(headers, rows) {
  const warnings = [];

  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    warnings.push(`Missing headers: ${missingHeaders.join(', ')}`);
  }

  rows.forEach((row) => {
    if (!VALID_SEGMENTS.has(row.segment)) {
      warnings.push(
        `Line ${row.__line}: unknown segment "${row.segment}" (expected active/moderate/edge-case)`,
      );
    }

    if (parseBool(row.onboarded) && !row.onboarded_at_ist) {
      warnings.push(`Line ${row.__line}: onboarded=yes but onboarded_at_ist is empty`);
    }
  });

  return warnings;
}

function summarizeRows(rows) {
  const invitedCount = rows.length;
  const acceptedCount = rows.filter((row) => parseBool(row.accepted)).length;
  const onboardedRows = rows.filter((row) => parseBool(row.onboarded));
  const onboardedCount = onboardedRows.length;

  const onboardedUtcTimes = onboardedRows
    .map((row) => parseIstToUtcIso(row.onboarded_at_ist))
    .filter(Boolean)
    .sort();

  return {
    invitedCount,
    acceptedCount,
    onboardedCount,
    activeOnboarded: countBySegment(onboardedRows, 'active', () => true),
    moderateOnboarded: countBySegment(onboardedRows, 'moderate', () => true),
    edgeCaseOnboarded: countBySegment(onboardedRows, 'edge-case', () => true),
    rosterLockUtc: onboardedUtcTimes.length > 0 ? onboardedUtcTimes[onboardedUtcTimes.length - 1] : null,
  };
}

function loadCohort(inputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Roster file not found: ${inputPath}`);
  }

  const csvText = fs.readFileSync(inputPath, 'utf8');
  const { headers, rows } = toRows(csvText);
  const warnings = getWarnings(headers, rows);
  const summary = summarizeRows(rows);

  return { headers, rows, warnings, summary };
}

export { loadCohort };
