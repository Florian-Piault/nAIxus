import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createInstallationPlan } from '../plan.js';

const home = process.env.HOME ?? '';

describe('createInstallationPlan', () => {
  it('plans the shared and harness resources for pi', () => {
    const plan = createInstallationPlan('pi');

    expect(plan.map(resource => resource.name)).toEqual([
      'core skills',
      'core prompts',
      'core context',
      'harness config'
    ]);
    expect(plan.map(resource => path.basename(resource.source))).toEqual([
      'skills',
      'prompts',
      'context',
      'pi'
    ]);
    expect(plan.map(resource => resource.destination)).toEqual([
      path.join(home, '.pi', 'agent', 'skills'),
      path.join(home, '.pi', 'agent', 'prompts'),
      path.join(home, '.pi', 'agent'),
      path.join(home, '.pi', 'agent')
    ]);
  });

  it('plans target-specific destinations', () => {
    expect(
      createInstallationPlan('claude').map(resource => resource.destination)
    ).toEqual([
      path.join(home, '.claude', 'skills'),
      path.join(home, '.claude', 'commands'),
      path.join(home, '.claude'),
      path.join(home, '.claude')
    ]);
    expect(
      createInstallationPlan('codex').map(resource => resource.destination)
    ).toEqual([
      path.join(home, '.codex', 'skills'),
      path.join(home, '.codex', 'prompts'),
      path.join(home, '.codex'),
      path.join(home, '.codex')
    ]);
  });
});
