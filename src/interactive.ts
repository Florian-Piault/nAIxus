import readline from "node:readline/promises";
import { ACTIONS, DEFAULT_ACTION, DEFAULT_MODE, MODES, runAction } from "./actions.js";
import { listTargetResources } from "./plan.js";
import { DEFAULT_TARGET, TARGETS, type Mode, type Target } from "./types.js";

// Pose une question jusqu'à obtenir une valeur autorisée.
async function promptChoice<T extends string>(
  rl: readline.Interface,
  label: string,
  choices: readonly T[],
  defaultValue: T
): Promise<T> {
  const answer = await rl.question(
    `${label} (${choices.join("/")}) [${defaultValue}]: `
  );
  const value = (answer.trim() || defaultValue) as T;
  if (choices.includes(value)) return value;
  console.log(`Valeur invalide: ${value}`);
  return promptChoice(rl, label, choices, defaultValue);
}

async function promptResourceSelection(
  rl: readline.Interface,
  target: Target
): Promise<string[] | undefined> {
  const resources = await listTargetResources(target);
  if (resources.length === 0) return undefined;

  console.log("Ressources disponibles:");
  resources.forEach((resource, index) => {
    console.log(`${index + 1}. ${resource.id}`);
  });

  const answer = await rl.question(
    "Ressources à installer/synchroniser (numéros ou ids séparés par des virgules, vide = tout): "
  );
  const values = answer.split(',').map((value) => value.trim()).filter(Boolean);
  if (values.length === 0) return undefined;

  const selected = values.map((value) => {
    const index = Number(value);
    if (Number.isInteger(index) && index >= 1 && index <= resources.length) {
      return resources[index - 1].id;
    }
    return value;
  });
  const ids = new Set(resources.map((resource) => resource.id));
  const unknown = selected.filter((id) => !ids.has(id));
  if (unknown.length > 0) {
    console.log(`Ressource inconnue: ${unknown.join(', ')}`);
    return promptResourceSelection(rl, target);
  }
  return selected;
}

export async function runInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Le mode interactif reprend les mêmes actions que la CLI explicite.
    const action = await promptChoice(
      rl,
      "Commande",
      ACTIONS,
      DEFAULT_ACTION
    );
    const target = await promptChoice(rl, "Target", TARGETS, DEFAULT_TARGET);
    const mode: Mode =
      action === "doctor" || action === "paths" || action === "uninstall"
        ? "copy"
        : await promptChoice(rl, "Mode", MODES, DEFAULT_MODE);

    const include = action === "install" || action === "sync"
      ? await promptResourceSelection(rl, target)
      : undefined;

    await runAction({ action, target, mode, include });
  } finally {
    rl.close();
  }
}
