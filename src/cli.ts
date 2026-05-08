#!/usr/bin/env node
import { Command } from 'commander';
import { doctor, installOrSync } from './commands.js';
import { runInteractive } from './interactive.js';
import { assertMode, assertTarget } from './types.js';

const program = new Command();

// Déclare les commandes CLI disponibles quand des arguments sont fournis.
program.name('naixus').description('Portable harness setup manager');

program
  .command('install')
  .requiredOption('--target <target>', 'pi|claude|codex')
  .option('--mode <mode>', 'copy|link', 'link')
  .action(async (opts: { target: string; mode: string }) => {
    const target = assertTarget(opts.target);
    const mode = assertMode(opts.mode);
    await installOrSync(target, mode);
  });

program
  .command('sync')
  .description('Sync the harness setup to the target')
  .requiredOption('--target <target>', 'pi|claude|codex')
  .option('--mode <mode>', 'copy|link', 'link')
  .action(async (opts: { target: string; mode: string }) => {
    const target = assertTarget(opts.target);
    const mode = assertMode(opts.mode);
    await installOrSync(target, mode);
  });

program
  .command('doctor')
  .description('Check the harness setup on the target')
  .requiredOption('--target <target>', 'pi|claude|codex')
  .action(async (opts: { target: string }) => {
    const target = assertTarget(opts.target);
    await doctor(target);
  });

const args = process.argv.slice(2);
// Sans argument, on bascule sur un petit assistant interactif.
const run =
  args.length === 0 ? runInteractive() : program.parseAsync(process.argv);

run.catch(err => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
