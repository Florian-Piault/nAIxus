import { describe, expect, it } from 'vitest';
import { createProgram } from '../cli-program.js';

describe('createProgram', () => {
  it('builds the explicit CLI command surface', () => {
    const program = createProgram('1.2.3');

    expect(program.name()).toBe('naixus');
    expect(program.version()).toBe('1.2.3');
    expect(program.commands.map(command => command.name())).toEqual([
      'install',
      'sync',
      'uninstall',
      'doctor',
      'targets',
      'paths'
    ]);
  });

  it('exposes force only on write commands', () => {
    const program = createProgram('1.2.3');

    for (const commandName of ['install', 'sync']) {
      const command = program.commands.find(candidate => candidate.name() === commandName);

      expect(command?.options.map(option => option.long)).toContain('--force');
    }
  });

  it('keeps target and all selection on multi-target commands', () => {
    const program = createProgram('1.2.3');

    for (const commandName of ['uninstall', 'doctor', 'paths']) {
      const command = program.commands.find(candidate => candidate.name() === commandName);

      expect(command?.options.map(option => option.long).slice(0, 2)).toEqual(['--target', '--all']);
    }
  });
});
