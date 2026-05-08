// Cibles supportées par le CLI.
export const TARGETS = ["pi", "claude", "codex"] as const;

export type Target = (typeof TARGETS)[number];
export type Mode = "copy" | "link";
export type Action = "install" | "sync" | "doctor";

export function assertTarget(value: string): Target {
  // Valide les entrées utilisateur avant d'écrire dans les dossiers locaux.
  if ((TARGETS as readonly string[]).includes(value)) return value as Target;
  throw new Error(`Target invalide: ${value}. Options: ${TARGETS.join(", ")}`);
}

export function assertMode(value: string): Mode {
  if (value === "copy" || value === "link") return value;
  throw new Error(`Mode invalide: ${value}. Options: copy, link`);
}
