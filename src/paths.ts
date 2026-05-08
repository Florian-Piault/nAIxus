import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Target } from "./types.js";

export const cliDir = path.dirname(fileURLToPath(import.meta.url));
// Le build place dist/ à la racine, donc son parent correspond au dépôt.
export const repoRoot = path.resolve(cliDir, "..");

export function resolveTargetRoot(target: Target): string {
  const home = os.homedir();
  const isWindows = process.platform === "win32";

  switch (target) {
    case "pi":
      return path.join(home, ".pi");
    case "claude":
      return isWindows
        ? path.join(home, "AppData", "Roaming", "claude")
        : path.join(home, ".claude");
    case "codex":
      return isWindows
        ? path.join(home, "AppData", "Roaming", "codex")
        : path.join(home, ".codex");
  }
}

export function resolveNativeDirs(target: Target) {
  const root = resolveTargetRoot(target);
  // Chaque harness expose des dossiers natifs différents pour skills/prompts/context.

  switch (target) {
    case "pi":
      return {
        root,
        config: path.join(root, "agent"),
        skills: path.join(root, "agent", "skills"),
        prompts: path.join(root, "agent", "prompts"),
        context: path.join(root, "agent"),
      };
    case "claude":
      return {
        root,
        config: root,
        skills: path.join(root, "skills"),
        prompts: path.join(root, "commands"),
        context: root,
      };
    case "codex":
      return {
        root,
        config: root,
        skills: path.join(root, "skills"),
        prompts: path.join(root, "prompts"),
        context: root,
      };
  }
}
