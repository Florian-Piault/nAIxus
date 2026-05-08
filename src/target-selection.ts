import { TARGETS, assertTarget, type Target } from './types.js';

export type TargetSelectionOptions = {
  target?: string;
  all?: boolean;
};

export function resolveTargetSelection(opts: TargetSelectionOptions): Target[] {
  if (opts.all) return [...TARGETS];
  if (!opts.target) throw new Error('Option requise: --target <target> ou --all');
  return [assertTarget(opts.target)];
}
