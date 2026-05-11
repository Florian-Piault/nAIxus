import { checkbox, select } from "@inquirer/prompts";
import { ACTIONS, DEFAULT_ACTION, DEFAULT_MODE, MODES, runAction } from "./actions.js";
import { listTargetResources } from "./plan.js";
import { DEFAULT_TARGET, TARGETS, type Action, type Mode, type Target } from "./types.js";

async function promptResourceSelection(target: Target): Promise<string[] | undefined> {
  const resources = await listTargetResources(target);
  if (resources.length === 0) return undefined;

  const selected = await checkbox({
    message: "Ressources à installer/synchroniser (espace pour sélectionner, entrée pour valider)",
    choices: resources.map((resource) => ({
      name: resource.id,
      value: resource.id,
      checked: true,
    })),
  });

  return selected.length === resources.length ? undefined : selected;
}

export async function runInteractive() {
  const action = await select<Action>({
    message: "Commande",
    choices: ACTIONS.map((value) => ({ value })),
    default: DEFAULT_ACTION,
  });

  const target = await select<Target>({
    message: "Target",
    choices: TARGETS.map((value) => ({ value })),
    default: DEFAULT_TARGET,
  });

  const mode: Mode =
    action === "doctor" || action === "paths" || action === "uninstall"
      ? "copy"
      : await select<Mode>({
        message: "Mode",
        choices: MODES.map((value) => ({ value })),
        default: DEFAULT_MODE,
      });

  const include = action === "install" || action === "sync"
    ? await promptResourceSelection(target)
    : undefined;

  await runAction({ action, target, mode, include });
}
