#!/usr/bin/env node

import { loadCohort } from './lib/cohort.mjs';

const args = process.argv.slice(2);
const inputPath = args.find((arg) => !arg.startsWith('-')) || '.planning/COHORT_ROSTER_TEMPLATE.csv';
const jsonMode = args.includes('--json');

function main() {
  const { rows, warnings, summary } = loadCohort(inputPath);

  if (rows.length === 0) {
    if (jsonMode) {
      console.log(
        JSON.stringify(
          {
            inputPath,
            warnings,
            empty: true,
          },
          null,
          2,
        ),
      );
      return;
    }
    console.log('No roster rows found.');
    return;
  }

  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          inputPath,
          warnings,
          ...summary,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log('Cohort Summary');
  console.log(`- Invited testers count: ${summary.invitedCount}`);
  console.log(`- Accepted testers count: ${summary.acceptedCount}`);
  console.log(`- Onboarded testers count: ${summary.onboardedCount}`);
  console.log(
    `- Roster lock timestamp (UTC): ${summary.rosterLockUtc ?? 'PENDING (missing onboarded timestamps)'}`,
  );
  console.log(`- Active UPI users onboarded: ${summary.activeOnboarded}`);
  console.log(`- Moderate UPI users onboarded: ${summary.moderateOnboarded}`);
  console.log(`- Edge-case users onboarded: ${summary.edgeCaseOnboarded}`);

  if (warnings.length > 0) {
    console.log('- Warnings:');
    warnings.forEach((warning) => console.log(`  - ${warning}`));
  }
}

main();
