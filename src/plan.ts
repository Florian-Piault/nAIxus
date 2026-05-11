import fs from "fs-extra";
import path from "node:path";
import { repoRoot } from "./paths.js";
import { resolveHarnessLayout, type HarnessLayout } from "./target-catalog.js";
import type { Target } from "./types.js";

export type PlannedResource = {
  id: string;
  name: string;
  source: string;
  destination: string;
};

export type DoctorCheck = {
  name: string;
  path: string;
};

export type TargetResourceRoot = {
  name: string;
  sourceSegments: string[];
  destination: string;
};

export type TargetPathReport = {
  harnessLayout: HarnessLayout;
  resourceRoots: TargetResourceRoot[];
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
    const layout = resolveHarnessLayout(this.target);

    return [
      ...this.resources.map((resource) => ({
        name: `${resource.name} source`,
        path: resource.source,
      })),
      ...this.resources.map((resource) => ({
        name: `${resource.name} destination`,
        path: resource.destination,
      })),
      { name: "target root", path: layout.root },
    ];
  }
}

export function resolveTargetResourceRoots(target: Target): TargetResourceRoot[] {
  const layout = resolveHarnessLayout(target);

  return [
    {
      name: "core skills",
      sourceSegments: ["core", "skills"],
      destination: layout.skills,
    },
    {
      name: "core prompts",
      sourceSegments: ["core", "prompts"],
      destination: layout.prompts,
    },
    {
      name: "core context",
      sourceSegments: ["core", "context"],
      destination: layout.context,
    },
    {
      name: "harness config",
      sourceSegments: ["harness", target],
      destination: layout.config,
    },
  ];
}

export function createTargetPathReport(target: Target): TargetPathReport {
  return {
    harnessLayout: resolveHarnessLayout(target),
    resourceRoots: resolveTargetResourceRoots(target),
  };
}

export async function listTargetResources(target: Target): Promise<PlannedResource[]> {
  const resources: PlannedResource[] = [];

  for (const root of resolveTargetResourceRoots(target)) {
    const source = path.join(repoRoot, ...root.sourceSegments);
    if (!(await fs.pathExists(source))) continue;

    const entries = (await fs.readdir(source))
      .filter((entry) => entry !== "README.md")
      .sort();

    for (const entry of entries) {
      resources.push({
        id: [...root.sourceSegments, entry].join('/'),
        name: `${root.name}/${entry}`,
        source: path.join(source, entry),
        destination: path.join(root.destination, entry),
      });
    }
  }

  return resources;
}

export async function createInstallationPlan(
  target: Target,
  selectedResourceIds?: readonly string[]
): Promise<InstallationPlan> {
  const resources = await listTargetResources(target);
  const selected = selectedResourceIds ? new Set(selectedResourceIds) : undefined;
  return new InstallationPlan(
    target,
    selected ? resources.filter((resource) => selected.has(resource.id)) : resources
  );
}
