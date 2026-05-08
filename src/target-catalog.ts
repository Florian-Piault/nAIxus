import os from 'node:os';
import path from 'node:path';

export type HarnessLayout = {
  root: string;
  config: string;
  skills: string;
  prompts: string;
  context: string;
};

type TargetDefinition = {
  layout: (home: string) => HarnessLayout;
};

const TARGET_CATALOG = {
  pi: {
    layout: (home: string) => {
      const root = path.join(home, '.pi');
      const agent = path.join(root, 'agent');

      return {
        root,
        config: agent,
        skills: path.join(agent, 'skills'),
        prompts: path.join(agent, 'prompts'),
        context: agent,
      };
    },
  },
  claude: {
    layout: (home: string) => {
      const root = path.join(home, '.claude');

      return {
        root,
        config: root,
        skills: path.join(root, 'skills'),
        prompts: path.join(root, 'commands'),
        context: root,
      };
    },
  },
  codex: {
    layout: (home: string) => {
      const root = path.join(home, '.codex');

      return {
        root,
        config: root,
        skills: path.join(root, 'skills'),
        prompts: path.join(root, 'prompts'),
        context: root,
      };
    },
  },
} as const satisfies Record<string, TargetDefinition>;

export type Target = keyof typeof TARGET_CATALOG;
export const TARGETS = Object.keys(TARGET_CATALOG) as Target[];
export const TARGET_OPTION_HELP = TARGETS.join('|');
export const DEFAULT_TARGET: Target = 'pi';

export function assertTarget(value: string): Target {
  // Valide les entrées utilisateur avant d'écrire dans les dossiers locaux.
  if (value in TARGET_CATALOG) return value as Target;
  throw new Error(`Target invalide: ${value}. Options: ${TARGETS.join(', ')}`);
}

export function resolveTargetRoot(target: Target): string {
  return resolveHarnessLayout(target).root;
}

export function resolveHarnessLayout(target: Target): HarnessLayout {
  return TARGET_CATALOG[target].layout(os.homedir());
}

export const resolveNativeDirs = resolveHarnessLayout;
export type NativeDirs = HarnessLayout;
