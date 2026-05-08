import readline from "node:readline/promises";
import { ACTIONS, DEFAULT_ACTION, DEFAULT_MODE, MODES, runAction } from "./actions.js";
import { DEFAULT_TARGET, TARGETS, type Mode } from "./types.js";

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

    await runAction({ action, target, mode });
  } finally {
    rl.close();
  }
}
