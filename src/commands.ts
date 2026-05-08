import { materializePlan } from "./materialize.js";
import { createInstallationPlan } from "./plan.js";
import { nodeRuntime, type Runtime } from "./runtime.js";
import type { Mode, Target } from "./types.js";

export async function installOrSync(
  target: Target,
  mode: Mode,
  dryRun = false,
  runtime: Runtime = nodeRuntime
) {
  // Le même plan sert à installer et à resynchroniser les ressources partagées.
  const plan = await createInstallationPlan(target);
  await materializePlan(plan.materializationSteps(), mode, dryRun, runtime);
}

export async function doctor(target: Target, runtime: Runtime = nodeRuntime) {
  const checks = (await createInstallationPlan(target)).doctorChecks();

  for (const check of checks) {
    const exists = await runtime.pathExists(check.path);
    runtime.log(`${exists ? "✅" : "❌"} ${check.name}: ${check.path}`);
  }
}
