import fs from "fs-extra";
import path from "node:path";
import { materializeChildren } from "./materialize.js";
import { repoRoot, resolveNativeDirs } from "./paths.js";
import type { Mode, Target } from "./types.js";

export async function installOrSync(target: Target, mode: Mode, dryRun = false) {
  const dirs = resolveNativeDirs(target);

  // Le même flux sert à installer et à resynchroniser les ressources partagées.
  await materializeChildren(path.join(repoRoot, "core", "skills"), dirs.skills, mode, dryRun);
  await materializeChildren(path.join(repoRoot, "core", "prompts"), dirs.prompts, mode, dryRun);
  await materializeChildren(path.join(repoRoot, "core", "context"), dirs.context, mode, dryRun);
  await materializeChildren(path.join(repoRoot, "harness", target), dirs.config, mode, dryRun);
}

export async function doctor(target: Target) {
  const dirs = resolveNativeDirs(target);
  // Vérifications simples: sources du dépôt + dossiers natifs de la cible.
  const checks = [
    { name: "core skills source", p: path.join(repoRoot, "core", "skills") },
    { name: "core prompts source", p: path.join(repoRoot, "core", "prompts") },
    { name: "core context source", p: path.join(repoRoot, "core", "context") },
    { name: "harness source", p: path.join(repoRoot, "harness", target) },
    { name: "target root", p: dirs.root },
    { name: "target config", p: dirs.config },
    { name: "target skills", p: dirs.skills },
    { name: "target prompts", p: dirs.prompts },
    { name: "target context", p: dirs.context },
  ];

  for (const c of checks) {
    const exists = await fs.pathExists(c.p);
    console.log(`${exists ? "✅" : "❌"} ${c.name}: ${c.p}`);
  }
}
