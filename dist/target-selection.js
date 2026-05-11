import { TARGETS, assertTarget } from './types.js';
export function resolveTargetSelection(opts) {
    if (opts.all)
        return [...TARGETS];
    if (!opts.target)
        throw new Error('Option requise: --target <target> ou --all');
    return [assertTarget(opts.target)];
}
