import fs from "fs-extra";
import path from "node:path";
import { repoRoot, resolveNativeDirs } from "./paths.js";
import type { Target } from "./types.js";

export type PlannedResource = {
  name: string;
  source: string;
  destination: string;
};

export type InstallationPlan = PlannedResource[];

type ResourceRoot = {
  name: string;
  source: string;
  destination: string;
};

function resourceRoots(target: Target): ResourceRoot[] {
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

export async function createInstallationPlan(target: Target): Promise<InstallationPlan> {
  const plan: InstallationPlan = [];

  for (const root of resourceRoots(target)) {
    if (!(await fs.pathExists(root.source))) continue;

    const entries = (await fs.readdir(root.source))
      .filter((entry) => entry !== "README.md")
      .sort();

    for (const entry of entries) {
      plan.push({
        name: `${root.name}/${entry}`,
        source: path.join(root.source, entry),
        destination: path.join(root.destination, entry),
      });
    }
  }

  return plan;
}
