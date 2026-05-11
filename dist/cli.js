#!/usr/bin/env node
import { createRequire } from 'node:module';
import { createProgram } from './cli-program.js';
import { runInteractive } from './interactive.js';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');
const program = createProgram(version);
const args = process.argv.slice(2);
// Sans argument, on bascule sur un petit assistant interactif.
const run = args.length === 0 ? runInteractive() : program.parseAsync(process.argv);
run.catch(err => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
});
