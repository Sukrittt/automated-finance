#!/usr/bin/env node

import fs from 'node:fs';
import { loadCohort } from './lib/cohort.mjs';

const args = process.argv.slice(2);
const inputPath = args.find((arg) => !arg.startsWith('-')) || '.planning/COHORT_ROSTER_TEMPLATE.csv';
const evidencePath = '.planning/COHORT_INVITE_EXECUTION.md';

function replaceLine(content, prefix, value) {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escapedPrefix}.*$`, 'm');
  return content.replace(pattern, `${prefix}${value}`);
}

function main() {
  const { rows, summary, warnings } = loadCohort(inputPath);

  if (rows.length === 0) {
    console.error('Cannot update evidence: no roster rows found.');
    process.exit(1);
  }

  if (!fs.existsSync(evidencePath)) {
    console.error(`Evidence file not found: ${evidencePath}`);
    process.exit(1);
  }

  let evidence = fs.readFileSync(evidencePath, 'utf8');

  evidence = replaceLine(evidence, '- Invited testers count: `', `${summary.invitedCount}\``);
  evidence = replaceLine(evidence, '- Accepted testers count: `', `${summary.acceptedCount}\``);
  evidence = replaceLine(evidence, '- Onboarded testers count: `', `${summary.onboardedCount}\``);
  evidence = replaceLine(
    evidence,
    '- Roster lock timestamp (UTC): `',
    `${summary.rosterLockUtc ?? 'PENDING (missing onboarded timestamps)'}\``,
  );
  evidence = replaceLine(evidence, '- Active UPI users onboarded: `', `${summary.activeOnboarded}\``);
  evidence = replaceLine(
    evidence,
    '- Moderate UPI users onboarded: `',
    `${summary.moderateOnboarded}\``,
  );
  evidence = replaceLine(
    evidence,
    '- Edge-case users onboarded: `',
    `${summary.edgeCaseOnboarded}\``,
  );
  evidence = replaceLine(
    evidence,
    '- Final roster reference (internal): ',
    `\`.planning/COHORT_ROSTER_TEMPLATE.csv\` (updated from \`${inputPath}\`)`,
  );

  fs.writeFileSync(evidencePath, evidence);

  console.log(`Updated ${evidencePath} from ${inputPath}`);
  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }
}

main();
