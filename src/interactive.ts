import readline from "node:readline/promises";
import { doctor, installOrSync } from "./commands.js";
import { TARGETS, type Mode } from "./types.js";

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
      ["install", "sync", "doctor"],
      "doctor"
    );
    const target = await promptChoice(rl, "Target", TARGETS, "pi");
    const mode: Mode =
      action === "doctor"
        ? "copy"
        : await promptChoice(rl, "Mode", ["copy", "link"], "copy");

    if (action === "doctor") await doctor(target);
    else await installOrSync(target, mode);
  } finally {
    rl.close();
  }
}
