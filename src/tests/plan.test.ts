import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createInstallationPlan } from '../plan.js';

const home = process.env.HOME ?? '';

describe('createInstallationPlan', () => {
  it('plans concrete resources and ignores README.md entries', async () => {
    const plan = await createInstallationPlan('pi');

    expect(plan.resources).toEqual([
      {
        name: 'core skills/testskill',
        source: path.resolve('core', 'skills', 'testskill'),
        destination: path.join(home, '.pi', 'agent', 'skills', 'testskill')
      }
    ]);
  });

  it('plans target-specific destinations', async () => {
    expect(
      (await createInstallationPlan('claude')).resources.map(resource => resource.destination)
    ).toEqual([path.join(home, '.claude', 'skills', 'testskill')]);
    expect(
      (await createInstallationPlan('codex')).resources.map(resource => resource.destination)
    ).toEqual([path.join(home, '.codex', 'skills', 'testskill')]);
  });

  it('derives doctor checks from resource intent', async () => {
    const plan = await createInstallationPlan('pi');

    expect(plan.doctorChecks()).toEqual([
      {
        name: 'core skills/testskill source',
        path: path.resolve('core', 'skills', 'testskill')
      },
      {
        name: 'core skills/testskill destination',
        path: path.join(home, '.pi', 'agent', 'skills', 'testskill')
      },
      {
        name: 'target root',
        path: path.join(home, '.pi')
      }
    ]);
  });
});
