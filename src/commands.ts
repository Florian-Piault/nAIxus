import fs from "fs-extra";
import { materializeChildren } from "./materialize.js";
import { resolveNativeDirs } from "./paths.js";
import { createInstallationPlan } from "./plan.js";
import type { Mode, Target } from "./types.js";

export async function installOrSync(target: Target, mode: Mode, dryRun = false) {
  // Le même plan sert à installer et à resynchroniser les ressources partagées.
  for (const resource of createInstallationPlan(target)) {
    await materializeChildren(resource.source, resource.destination, mode, dryRun);
  }
}

export async function doctor(target: Target) {
  const dirs = resolveNativeDirs(target);
  const plan = createInstallationPlan(target);
  // Vérifications simples: plan d'installation + dossiers natifs de la cible.
  const checks = [
    ...plan.map((resource) => ({
      name: `${resource.name} source`,
      p: resource.source,
    })),
    ...plan.map((resource) => ({
      name: `${resource.name} destination`,
      p: resource.destination,
    })),
    { name: "target root", p: dirs.root },
  ];

  for (const c of checks) {
    const exists = await fs.pathExists(c.p);
    console.log(`${exists ? "✅" : "❌"} ${c.name}: ${c.p}`);
  }
}
