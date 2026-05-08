import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDoctorChecks } from '../commands.js';
import type { InstallationPlan } from '../plan.js';

const home = process.env.HOME ?? '';

describe('createDoctorChecks', () => {
  it('derives source and destination checks from the installation plan', () => {
    const plan: InstallationPlan = [
      {
        name: 'core skills/testskill',
        source: '/repo/core/skills/testskill',
        destination: '/home/.pi/agent/skills/testskill'
      }
    ];

    expect(createDoctorChecks('pi', plan)).toEqual([
      {
        name: 'core skills/testskill source',
        path: '/repo/core/skills/testskill'
      },
      {
        name: 'core skills/testskill destination',
        path: '/home/.pi/agent/skills/testskill'
      },
      {
        name: 'target root',
        path: path.join(home, '.pi')
      }
    ]);
  });
});
