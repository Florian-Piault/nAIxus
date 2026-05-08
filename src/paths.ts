import path from "node:path";
import { fileURLToPath } from "node:url";
export { resolveNativeDirs, resolveTargetRoot } from "./target-catalog.js";

export const cliDir = path.dirname(fileURLToPath(import.meta.url));
// Le build place dist/ à la racine, donc son parent correspond au dépôt.
export const repoRoot = path.resolve(cliDir, "..");
