import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { planMaterializeChildren } from '../materialize.js';

describe('planMaterializeChildren', () => {
  it('ignores README.md entries', () => {
    const steps = planMaterializeChildren(
      '/repo/core/skills',
      '/home/.pi/agent/skills',
      ['README.md', 'review']
    );

    expect(steps).toEqual([
      {
        source: path.join('/repo/core/skills', 'review'),
        destination: path.join('/home/.pi/agent/skills', 'review')
      }
    ]);
  });

  it('maps each source entry to the destination directory', () => {
    const steps = planMaterializeChildren('/src', '/dest', ['a.md', 'folder']);

    expect(steps).toEqual([
      {
        source: path.join('/src', 'a.md'),
        destination: path.join('/dest', 'a.md')
      },
      {
        source: path.join('/src', 'folder'),
        destination: path.join('/dest', 'folder')
      }
    ]);
  });
});
