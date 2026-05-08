import fs from "fs-extra";
import path from "node:path";
import { repoRoot } from "./paths.js";
import { resolveNativeDirs, resolveTargetResourceRoots } from "./target-catalog.js";
import type { Target } from "./types.js";

export type PlannedResource = {
  name: string;
  source: string;
  destination: string;
};

export type DoctorCheck = {
  name: string;
  path: string;
};

export class InstallationPlan {
  constructor(
    private readonly target: Target,
    readonly resources: PlannedResource[]
  ) {}

  materializationSteps(): PlannedResource[] {
    return this.resources;
  }

  doctorChecks(): DoctorCheck[] {
    const dirs = resolveNativeDirs(this.target);

    return [
      ...this.resources.map((resource) => ({
        name: `${resource.name} source`,
        path: resource.source,
      })),
      ...this.resources.map((resource) => ({
        name: `${resource.name} destination`,
        path: resource.destination,
      })),
      { name: "target root", path: dirs.root },
    ];
  }
}

export async function createInstallationPlan(target: Target): Promise<InstallationPlan> {
  const resources: PlannedResource[] = [];

  for (const root of resolveTargetResourceRoots(target)) {
    const source = path.join(repoRoot, ...root.sourceSegments);
    if (!(await fs.pathExists(source))) continue;

    const entries = (await fs.readdir(source))
      .filter((entry) => entry !== "README.md")
      .sort();

    for (const entry of entries) {
      resources.push({
        name: `${root.name}/${entry}`,
        source: path.join(source, entry),
        destination: path.join(root.destination, entry),
      });
    }
  }

  return new InstallationPlan(target, resources);
}
