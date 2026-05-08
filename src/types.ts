export {
  DEFAULT_TARGET,
  TARGET_OPTION_HELP,
  TARGETS,
  assertTarget,
  type Target,
} from "./target-catalog.js";

export type Mode = "copy" | "link";
export type Action = "install" | "sync" | "doctor" | "paths" | "uninstall";

export function assertMode(value: string): Mode {
  if (value === "copy" || value === "link") return value;
  throw new Error(`Mode invalide: ${value}. Options: copy, link`);
}
