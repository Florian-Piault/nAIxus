import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createInstallationPlan,
  createTargetPathReport,
  resolveTargetResourceRoots,
} from '../plan.js';

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

  it('resolves resource roots for each target', () => {
    expect(resolveTargetResourceRoots('claude')).toEqual([
      {
        name: 'core skills',
        sourceSegments: ['core', 'skills'],
        destination: path.join(home, '.claude', 'skills')
      },
      {
        name: 'core prompts',
        sourceSegments: ['core', 'prompts'],
        destination: path.join(home, '.claude', 'commands')
      },
      {
        name: 'core context',
        sourceSegments: ['core', 'context'],
        destination: path.join(home, '.claude')
      },
      {
        name: 'harness config',
        sourceSegments: ['harness', 'claude'],
        destination: path.join(home, '.claude')
      }
    ]);
  });

  it('creates path reports from native dirs and resource roots', () => {
    expect(createTargetPathReport('codex').resourceRoots).toEqual(resolveTargetResourceRoots('codex'));
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
