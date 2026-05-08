import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TARGET,
  TARGET_OPTION_HELP,
  TARGETS,
  resolveNativeDirs,
} from '../target-catalog.js';

const home = process.env.HOME ?? '';

describe('target catalog', () => {
  it('owns target display metadata', () => {
    expect(TARGETS).toEqual(['pi', 'claude', 'codex']);
    expect(TARGET_OPTION_HELP).toBe('pi|claude|codex');
    expect(DEFAULT_TARGET).toBe('pi');
  });

  it('resolves native dirs for each target', () => {
    expect(resolveNativeDirs('pi')).toEqual({
      root: path.join(home, '.pi'),
      config: path.join(home, '.pi', 'agent'),
      skills: path.join(home, '.pi', 'agent', 'skills'),
      prompts: path.join(home, '.pi', 'agent', 'prompts'),
      context: path.join(home, '.pi', 'agent')
    });
    expect(resolveNativeDirs('claude').prompts).toBe(path.join(home, '.claude', 'commands'));
    expect(resolveNativeDirs('codex').prompts).toBe(path.join(home, '.codex', 'prompts'));
  });
});
