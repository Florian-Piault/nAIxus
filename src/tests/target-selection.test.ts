import { describe, expect, it } from 'vitest';
import { resolveTargetSelection } from '../target-selection.js';
import { TARGETS } from '../types.js';

describe('resolveTargetSelection', () => {
  it('resolves all targets', () => {
    expect(resolveTargetSelection({ all: true })).toEqual([...TARGETS]);
  });

  it('resolves one target', () => {
    expect(resolveTargetSelection({ target: 'pi' })).toEqual(['pi']);
  });

  it('requires a target or all targets', () => {
    expect(() => resolveTargetSelection({})).toThrow('Option requise: --target <target> ou --all');
  });
});
