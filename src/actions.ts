import { doctor, installOrSync } from "./commands.js";
import { nodeRuntime, type Runtime } from "./runtime.js";
import type { Action, Mode, Target } from "./types.js";

export const ACTIONS = ["install", "sync", "doctor"] as const satisfies readonly Action[];
export const DEFAULT_ACTION: Action = "doctor";
export const MODES = ["copy", "link"] as const;
export const DEFAULT_MODE: Mode = "copy";
export const CLI_DEFAULT_MODE: Mode = "link";

export type ActionRequest = {
  action: Action;
  target: Target;
  mode?: Mode;
  dryRun?: boolean;
};

export async function runAction(
  request: ActionRequest,
  runtime: Runtime = nodeRuntime
): Promise<void> {
  if (request.action === "doctor") {
    await doctor(request.target, runtime);
    return;
  }

  await installOrSync(
    request.target,
    request.mode ?? DEFAULT_MODE,
    Boolean(request.dryRun),
    runtime
  );
}
