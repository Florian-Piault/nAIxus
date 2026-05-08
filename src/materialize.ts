import path from "node:path";
import { nodeRuntime, type Runtime } from "./runtime.js";
import type { Mode } from "./types.js";

// Crée la ressource cible en copie ou en lien symbolique.
async function materializeResource(
  step: MaterializationStep,
  mode: Mode,
  runtime: Runtime
): Promise<void> {
  const src = step.source;
  const dest = step.destination;
  await runtime.ensureDir(path.dirname(dest));
  await runtime.remove(dest);

  if (mode === "copy") {
    await runtime.copy(src, dest);
    return;
  }

  try {
    // Le type du lien dépend de la nature de la source et de la plateforme.
    const stat = await runtime.lstat(src);
    const type: "file" | "dir" | "junction" = stat.isDirectory()
      ? process.platform === "win32"
        ? "junction"
        : "dir"
      : "file";
    await runtime.symlink(src, dest, type);
  } catch (err) {
    runtime.warn(`link impossible (${String(err)}), fallback copy -> ${dest}`);
    await runtime.copy(src, dest);
  }
}

export type MaterializationStep = {
  name: string;
  source: string;
  destination: string;
};

export async function materializePlan(
  steps: MaterializationStep[],
  mode: Mode,
  dryRun = false,
  runtime: Runtime = nodeRuntime
): Promise<void> {
  for (const step of steps) {
    if (dryRun) runtime.log(`dry-run ${mode} ${step.name}: ${step.source} -> ${step.destination}`);
    else {
      await materializeResource(step, mode, runtime);
      runtime.log(`ok ${mode} ${step.name}: ${step.source} -> ${step.destination}`);
    }
  }
}
