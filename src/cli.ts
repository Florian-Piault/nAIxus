#!/usr/bin/env node
import { Command } from 'commander';
import { createRequire } from 'node:module';
import { doctor, installOrSync } from './commands.js';
import { resolveNativeDirs } from './paths.js';
import { runInteractive } from './interactive.js';
import { TARGETS, assertMode, assertTarget } from './types.js';

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
  .requiredOption('--target <target>', 'pi|claude|codex')
  .option('--mode <mode>', 'copy|link', 'link')
  .option('--dry-run', 'print planned writes without changing files')
  .action(async (opts: { target: string; mode: string; dryRun?: boolean }) => {
    const target = assertTarget(opts.target);
    const mode = assertMode(opts.mode);
    await installOrSync(target, mode, Boolean(opts.dryRun));
  });

program
  .command('sync')
  .description('Sync the harness setup to the target')
  .requiredOption('--target <target>', 'pi|claude|codex')
  .option('--mode <mode>', 'copy|link', 'link')
  .option('--dry-run', 'print planned writes without changing files')
  .action(async (opts: { target: string; mode: string; dryRun?: boolean }) => {
    const target = assertTarget(opts.target);
    const mode = assertMode(opts.mode);
    await installOrSync(target, mode, Boolean(opts.dryRun));
  });

program
  .command('doctor')
  .description('Check the harness setup on the target')
  .option('--target <target>', 'pi|claude|codex')
  .option('--all', 'check all targets')
  .action(async (opts: { target?: string; all?: boolean }) => {
    if (opts.all) {
      for (const target of TARGETS) {
        console.log(`\n# ${target}`);
        await doctor(target);
      }
      return;
    }

    if (!opts.target) throw new Error('Option requise: --target <target> ou --all');
    const target = assertTarget(opts.target);
    await doctor(target);
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
  .option('--target <target>', 'pi|claude|codex')
  .option('--all', 'print paths for all targets')
  .action((opts: { target?: string; all?: boolean }) => {
    const printPaths = (target: (typeof TARGETS)[number]) => {
      const dirs = resolveNativeDirs(target);
      console.log(`\n# ${target}`);
      for (const [name, dir] of Object.entries(dirs)) {
        console.log(`${name}: ${dir}`);
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
