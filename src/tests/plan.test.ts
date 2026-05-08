import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createInstallationPlan } from '../plan.js';

const home = process.env.HOME ?? '';

describe('createInstallationPlan', () => {
  it('plans concrete resources and ignores README.md entries', async () => {
    const plan = await createInstallationPlan('pi');

    expect(plan).toEqual([
      {
        name: 'core skills/testskill',
        source: path.resolve('core', 'skills', 'testskill'),
        destination: path.join(home, '.pi', 'agent', 'skills', 'testskill')
      }
    ]);
  });

  it('plans target-specific destinations', async () => {
    expect(
      (await createInstallationPlan('claude')).map(resource => resource.destination)
    ).toEqual([path.join(home, '.claude', 'skills', 'testskill')]);
    expect(
      (await createInstallationPlan('codex')).map(resource => resource.destination)
    ).toEqual([path.join(home, '.codex', 'skills', 'testskill')]);
  });
});
