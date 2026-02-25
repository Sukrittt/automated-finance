#!/usr/bin/env node

import fs from 'node:fs';
import { loadCohort } from './lib/cohort.mjs';

const inputPath = process.argv[2] || '.planning/COHORT_ROSTER_TEMPLATE.csv';
const evidencePath = '.planning/COHORT_INVITE_EXECUTION.md';
const readinessPath = '.planning/RELEASE_READINESS.md';
const taskBoardPath = '.planning/TASK_BOARD.md';

const TARGET = {
  total: 20,
  active: 10,
  moderate: 6,
  edgeCase: 4,
};

function readRequired(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }
  return fs.readFileSync(path, 'utf8');
}

function replaceOrThrow(content, regex, replacement, errorMessage) {
  if (!regex.test(content)) {
    throw new Error(errorMessage);
  }
  return content.replace(regex, replacement);
}

function replaceFirstMatchingOrThrow(content, replacements, errorMessage) {
  for (const { regex, replacement } of replacements) {
    if (regex.test(content)) {
      return content.replace(regex, replacement);
    }
  }
  throw new Error(errorMessage);
}

function extractField(content, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`^- ${escaped}:\\s*\`([^\\n\`]*)\``, 'm'));
  return match ? match[1].trim() : null;
}

function getNonPendingEvidenceFailures(evidence) {
  const checks = [
    'Invite run date (IST)',
    'Invite operator',
    'Invite channel(s)',
    'Consent + known-limitations message sent',
    'Invited testers count',
    'Accepted testers count',
    'Onboarded testers count',
    'Roster lock timestamp (UTC)',
    'Active UPI users onboarded',
    'Moderate UPI users onboarded',
    'Edge-case users onboarded',
  ];

  const failures = [];
  checks.forEach((label) => {
    const value = extractField(evidence, label);
    if (!value) {
      failures.push(`Missing field in evidence: ${label}`);
      return;
    }
    if (value.toUpperCase().includes('PENDING')) {
      failures.push(`Evidence field still pending: ${label}`);
    }
  });

  if (evidence.includes('PENDING (actual sent message link/screenshot)')) {
    failures.push('Invite message/export artifact link is still pending.');
  }
  if (evidence.includes('PENDING (filled roster location)')) {
    failures.push('Final roster reference is still pending.');
  }
  if (evidence.includes('First-day onboarding issues summary: `PENDING`')) {
    failures.push('First-day onboarding issues summary is still pending.');
  }

  return failures;
}

function getTargetFailures(summary) {
  const failures = [];
  if (summary.onboardedCount !== TARGET.total) {
    failures.push(`Onboarded testers must be ${TARGET.total}; found ${summary.onboardedCount}.`);
  }
  if (summary.activeOnboarded !== TARGET.active) {
    failures.push(`Active onboarded must be ${TARGET.active}; found ${summary.activeOnboarded}.`);
  }
  if (summary.moderateOnboarded !== TARGET.moderate) {
    failures.push(`Moderate onboarded must be ${TARGET.moderate}; found ${summary.moderateOnboarded}.`);
  }
  if (summary.edgeCaseOnboarded !== TARGET.edgeCase) {
    failures.push(`Edge-case onboarded must be ${TARGET.edgeCase}; found ${summary.edgeCaseOnboarded}.`);
  }
  if (!summary.rosterLockUtc) {
    failures.push('Roster lock timestamp is missing (no valid onboarded_at_ist values).');
  }
  return failures;
}

function main() {
  const { warnings, summary } = loadCohort(inputPath);
  const evidence = readRequired(evidencePath);

  const failures = [];
  warnings.forEach((warning) => failures.push(`Roster warning: ${warning}`));
  getTargetFailures(summary).forEach((failure) => failures.push(failure));
  getNonPendingEvidenceFailures(evidence).forEach((failure) => failures.push(failure));

  if (failures.length > 0) {
    console.error('Cohort closeout validation failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  let readiness = readRequired(readinessPath);
  readiness = replaceFirstMatchingOrThrow(
    readiness,
    [
      {
        regex: /^\| Test cohort selected and onboarded \| IN_PROGRESS \| Product Ops \| ([^\n]+)$/m,
        replacement: '| Test cohort selected and onboarded | DONE | Product Ops | $1',
      },
      {
        regex: /^\| Test cohort selected and onboarded \| BLOCKED \| Product Ops \| ([^\n]+)$/m,
        replacement: '| Test cohort selected and onboarded | DONE | Product Ops | $1',
      },
    ],
    'Could not find cohort readiness row in expected IN_PROGRESS/BLOCKED format.',
  );
  readiness = replaceFirstMatchingOrThrow(
    readiness,
    [
      {
        regex: /^- Tester invite execution and final roster lock are pending\.$/m,
        replacement: '- No open gaps. All release readiness checklist rows are complete.',
      },
      {
        regex:
          /^- Tester invite execution and final roster lock are deferred to final pre-release pass \(owner: Product Ops, target: [0-9]{4}-[0-9]{2}-[0-9]{2}\)\.$/m,
        replacement: '- No open gaps. All release readiness checklist rows are complete.',
      },
    ],
    'Could not find expected known gap line in release readiness.',
  );
  fs.writeFileSync(readinessPath, readiness);

  let taskBoard = readRequired(taskBoardPath);
  taskBoard = replaceOrThrow(
    taskBoard,
    /^\| P7-T3 \| 7 \| Release readiness package \(notes\/cohort\/support\) \| IN_PROGRESS \| P7-T2 \| Release checklist items mapped and tracked \|$/m,
    '| P7-T3 | 7 | Release readiness package (notes/cohort/support) | DONE | P7-T2 | Release checklist items mapped and tracked |',
    'Could not find P7-T3 IN_PROGRESS row in task board.',
  );
  fs.writeFileSync(taskBoardPath, taskBoard);

  console.log('Cohort closeout complete.');
  console.log(`- Updated ${readinessPath}`);
  console.log(`- Updated ${taskBoardPath}`);
}

main();
