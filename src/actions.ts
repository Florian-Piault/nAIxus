import { materializePlan } from './materialize.js';
import { createInstallationPlan, createTargetPathReport } from './plan.js';
import { nodeRuntime, type Runtime } from './runtime.js';
import type { Action, Mode, Target } from './types.js';

export const ACTIONS = [
  'install',
  'sync',
  'doctor',
  'paths'
] as const satisfies readonly Action[];
export const DEFAULT_ACTION: Action = 'doctor';
export const MODES = ['copy', 'link'] as const;
export const DEFAULT_MODE: Mode = 'copy';
export const CLI_DEFAULT_MODE: Mode = 'link';

export type ActionRequest = {
  action: Action;
  target: Target;
  mode?: Mode;
  dryRun?: boolean;
  force?: boolean;
};

export async function runAction(
  request: ActionRequest,
  runtime: Runtime = nodeRuntime
): Promise<void> {
  const plan = await createInstallationPlan(request.target);

  if (request.action === 'doctor') {
    for (const check of plan.doctorChecks()) {
      const exists = await runtime.pathExists(check.path);
      runtime.log(`${exists ? '✅' : '❌'} ${check.name}: ${check.path}`);
    }
    return;
  }

  if (request.action === 'paths') {
    const report = createTargetPathReport(request.target);
    runtime.log('harness layout');
    for (const [name, dir] of Object.entries(report.harnessLayout)) {
      runtime.log(`${name}: ${dir}`);
    }
    runtime.log('resource roots');
    for (const root of report.resourceRoots) {
      runtime.log(
        `${root.name}: ${root.sourceSegments.join('/')} -> ${root.destination}`
      );
    }
    return;
  }

  await materializePlan(
    plan.materializationSteps(),
    request.mode ?? DEFAULT_MODE,
    Boolean(request.dryRun),
    runtime,
    Boolean(request.force)
  );
}
