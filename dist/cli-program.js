import { Command } from 'commander';
import { CLI_DEFAULT_MODE, listResources, runAction } from './actions.js';
import { resolveTargetSelection } from './target-selection.js';
import { TARGETS, TARGET_OPTION_HELP, assertMode, assertTarget, } from './types.js';
export function createProgram(version) {
    const program = new Command();
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
        .option('--force', 'overwrite existing conflicting destinations')
        .option('--include <id...>', 'resource id(s) to install')
        .option('--exclude <id...>', 'resource id(s) to skip')
        .action(async (opts) => {
        await runAction({
            action: 'install',
            target: assertTarget(opts.target),
            mode: assertMode(opts.mode),
            dryRun: Boolean(opts.dryRun),
            force: Boolean(opts.force),
            include: opts.include,
            exclude: opts.exclude,
        });
    });
    program
        .command('sync')
        .description('Sync the harness setup to the target')
        .requiredOption('--target <target>', TARGET_OPTION_HELP)
        .option('--mode <mode>', 'copy|link', CLI_DEFAULT_MODE)
        .option('--dry-run', 'print planned writes without changing files')
        .option('--force', 'overwrite existing conflicting destinations')
        .option('--include <id...>', 'resource id(s) to sync')
        .option('--exclude <id...>', 'resource id(s) to skip')
        .action(async (opts) => {
        await runAction({
            action: 'sync',
            target: assertTarget(opts.target),
            mode: assertMode(opts.mode),
            dryRun: Boolean(opts.dryRun),
            force: Boolean(opts.force),
            include: opts.include,
            exclude: opts.exclude,
        });
    });
    program
        .command('uninstall')
        .description('Remove managed resources from the target manifest')
        .option('--target <target>', TARGET_OPTION_HELP)
        .option('--all', 'remove managed resources from all targets')
        .option('--dry-run', 'print planned removals without changing files')
        .action(async (opts) => {
        for (const target of resolveTargetSelection(opts)) {
            console.log(`\n# ${target}`);
            await runAction({
                action: 'uninstall',
                target,
                dryRun: Boolean(opts.dryRun),
            });
        }
    });
    program
        .command('doctor')
        .description('Check the harness setup on the target')
        .option('--target <target>', TARGET_OPTION_HELP)
        .option('--all', 'check all targets')
        .action(async (opts) => {
        for (const target of resolveTargetSelection(opts)) {
            console.log(`\n# ${target}`);
            await runAction({ action: 'doctor', target });
        }
    });
    program
        .command('list-resources')
        .description('List selectable resource ids for a target')
        .requiredOption('--target <target>', TARGET_OPTION_HELP)
        .option('--json', 'print JSON')
        .option('--verbose', 'include paths and manifest status')
        .action(async (opts) => {
        await listResources({
            target: assertTarget(opts.target),
            json: Boolean(opts.json),
            verbose: Boolean(opts.verbose),
        });
    });
    program
        .command('targets')
        .description('List supported targets')
        .action(() => {
        for (const target of TARGETS)
            console.log(target);
    });
    program
        .command('paths')
        .description('Print resolved native paths for a target')
        .option('--target <target>', TARGET_OPTION_HELP)
        .option('--all', 'print paths for all targets')
        .action(async (opts) => {
        for (const target of resolveTargetSelection(opts)) {
            console.log(`\n# ${target}`);
            await runAction({ action: 'paths', target });
        }
    });
    return program;
}
