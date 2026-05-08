import { materializePlan } from "./materialize.js";
import { resolveNativeDirs } from "./paths.js";
import { createInstallationPlan } from "./plan.js";
import { nodeRuntime, type Runtime } from "./runtime.js";
import type { InstallationPlan } from "./plan.js";
import type { Mode, Target } from "./types.js";

export type DoctorCheck = {
  name: string;
  path: string;
};

export function createDoctorChecks(target: Target, plan: InstallationPlan): DoctorCheck[] {
  const dirs = resolveNativeDirs(target);

  return [
    ...plan.map((resource) => ({
      name: `${resource.name} source`,
      path: resource.source,
    })),
    ...plan.map((resource) => ({
      name: `${resource.name} destination`,
      path: resource.destination,
    })),
    { name: "target root", path: dirs.root },
  ];
}

export async function installOrSync(
  target: Target,
  mode: Mode,
  dryRun = false,
  runtime: Runtime = nodeRuntime
) {
  // Le même plan sert à installer et à resynchroniser les ressources partagées.
  await materializePlan(await createInstallationPlan(target), mode, dryRun, runtime);
}

export async function doctor(target: Target, runtime: Runtime = nodeRuntime) {
  const checks = createDoctorChecks(target, await createInstallationPlan(target));

  for (const check of checks) {
    const exists = await runtime.pathExists(check.path);
    runtime.log(`${exists ? "✅" : "❌"} ${check.name}: ${check.path}`);
  }
}
