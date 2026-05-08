import path from "node:path";
import { repoRoot, resolveNativeDirs } from "./paths.js";
import type { Target } from "./types.js";

export type PlannedResource = {
  name: string;
  source: string;
  destination: string;
};

export type InstallationPlan = PlannedResource[];

export function createInstallationPlan(target: Target): InstallationPlan {
  const dirs = resolveNativeDirs(target);

  return [
    {
      name: "core skills",
      source: path.join(repoRoot, "core", "skills"),
      destination: dirs.skills,
    },
    {
      name: "core prompts",
      source: path.join(repoRoot, "core", "prompts"),
      destination: dirs.prompts,
    },
    {
      name: "core context",
      source: path.join(repoRoot, "core", "context"),
      destination: dirs.context,
    },
    {
      name: "harness config",
      source: path.join(repoRoot, "harness", target),
      destination: dirs.config,
    },
  ];
}
