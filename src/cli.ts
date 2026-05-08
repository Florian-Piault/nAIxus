#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'node:module';
import { CLI_DEFAULT_MODE, runAction } from './actions.js';
import { createTargetPathReport } from './target-catalog.js';
import { runInteractive } from './interactive.js';
import {
  TARGETS,
  TARGET_OPTION_HELP,
  assertMode,
  assertTarget,
  type Target,
} from './types.js';

const program = new Command();
const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

// Déclare les commandes CLI disponibles quand des arguments sont fournis.
program
  .name('naixus')
  .description('Portable harness setup manager')
  .version(version)
  .showHelpAfterError()
  .showSuggestionAfterError();

program
  .command('install')
  .description('Install the harness setup to the target')
  .requiredOption('--target <target>', TARGET_OPTION_HELP)
  .option('--mode <mode>', 'copy|link', CLI_DEFAULT_MODE)
  .option('--dry-run', 'print planned writes without changing files')
  .action(async (opts: { target: string; mode: string; dryRun?: boolean }) => {
    await runAction({
      action: 'install',
      target: assertTarget(opts.target),
      mode: assertMode(opts.mode),
      dryRun: Boolean(opts.dryRun),
    });
  });

program
  .command('sync')
  .description('Sync the harness setup to the target')
  .requiredOption('--target <target>', TARGET_OPTION_HELP)
  .option('--mode <mode>', 'copy|link', CLI_DEFAULT_MODE)
  .option('--dry-run', 'print planned writes without changing files')
  .action(async (opts: { target: string; mode: string; dryRun?: boolean }) => {
    await runAction({
      action: 'sync',
      target: assertTarget(opts.target),
      mode: assertMode(opts.mode),
      dryRun: Boolean(opts.dryRun),
    });
  });

program
  .command('doctor')
  .description('Check the harness setup on the target')
  .option('--target <target>', TARGET_OPTION_HELP)
  .option('--all', 'check all targets')
  .action(async (opts: { target?: string; all?: boolean }) => {
    if (opts.all) {
      for (const target of TARGETS) {
        console.log(`\n# ${target}`);
        await runAction({ action: 'doctor', target });
      }
      return;
    }

    if (!opts.target) throw new Error('Option requise: --target <target> ou --all');
    await runAction({ action: 'doctor', target: assertTarget(opts.target) });
  });

program
  .command('targets')
  .description('List supported targets')
  .action(() => {
    for (const target of TARGETS) console.log(target);
  });

program
  .command('paths')
  .description('Print resolved native paths for a target')
  .option('--target <target>', TARGET_OPTION_HELP)
  .option('--all', 'print paths for all targets')
  .action((opts: { target?: string; all?: boolean }) => {
    const printPaths = (target: Target) => {
      const report = createTargetPathReport(target);
      console.log(`\n# ${target}`);
      console.log('native dirs');
      for (const [name, dir] of Object.entries(report.nativeDirs)) {
        console.log(`${name}: ${dir}`);
      }
      console.log('resource roots');
      for (const root of report.resourceRoots) {
        console.log(`${root.name}: ${root.sourceSegments.join('/')} -> ${root.destination}`);
      }
    };

    if (opts.all) {
      for (const target of TARGETS) printPaths(target);
      return;
    }

    if (!opts.target) throw new Error('Option requise: --target <target> ou --all');
    printPaths(assertTarget(opts.target));
  });

const args = process.argv.slice(2);
// Sans argument, on bascule sur un petit assistant interactif.
const run =
  args.length === 0 ? runInteractive() : program.parseAsync(process.argv);

run.catch(err => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
