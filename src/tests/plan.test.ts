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
        id: 'core/skills/brainstorm',
        name: 'core skills/brainstorm',
        source: path.resolve('core', 'skills', 'brainstorm'),
        destination: path.join(home, '.pi', 'agent', 'skills', 'brainstorm')
      },
      {
        id: 'core/skills/code-review',
        name: 'core skills/code-review',
        source: path.resolve('core', 'skills', 'code-review'),
        destination: path.join(home, '.pi', 'agent', 'skills', 'code-review')
      },
      {
        id: 'core/skills/commit',
        name: 'core skills/commit',
        source: path.resolve('core', 'skills', 'commit'),
        destination: path.join(home, '.pi', 'agent', 'skills', 'commit')
      }
    ]);
  });

  it('plans target-specific destinations', async () => {
    expect(
      (await createInstallationPlan('claude')).resources.map(resource => resource.destination)
    ).toEqual([
      path.join(home, '.claude', 'skills', 'brainstorm'),
      path.join(home, '.claude', 'skills', 'code-review'),
      path.join(home, '.claude', 'skills', 'commit')
    ]);
    expect(
      (await createInstallationPlan('codex')).resources.map(resource => resource.destination)
    ).toEqual([
      path.join(home, '.codex', 'skills', 'brainstorm'),
      path.join(home, '.codex', 'skills', 'code-review'),
      path.join(home, '.codex', 'skills', 'commit')
    ]);
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
        name: 'core skills/brainstorm source',
        path: path.resolve('core', 'skills', 'brainstorm')
      },
      {
        name: 'core skills/code-review source',
        path: path.resolve('core', 'skills', 'code-review')
      },
      {
        name: 'core skills/commit source',
        path: path.resolve('core', 'skills', 'commit')
      },
      {
        name: 'core skills/brainstorm destination',
        path: path.join(home, '.pi', 'agent', 'skills', 'brainstorm')
      },
      {
        name: 'core skills/code-review destination',
        path: path.join(home, '.pi', 'agent', 'skills', 'code-review')
      },
      {
        name: 'core skills/commit destination',
        path: path.join(home, '.pi', 'agent', 'skills', 'commit')
      },
      {
        name: 'target root',
        path: path.join(home, '.pi')
      }
    ]);
  });
});
