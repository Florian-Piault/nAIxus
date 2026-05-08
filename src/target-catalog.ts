import os from 'node:os';
import path from 'node:path';

export const TARGETS = ['pi', 'claude', 'codex'] as const;
export const TARGET_OPTION_HELP = TARGETS.join('|');
export const DEFAULT_TARGET: Target = 'pi';

export type Target = (typeof TARGETS)[number];

export type NativeDirs = {
  root: string;
  config: string;
  skills: string;
  prompts: string;
  context: string;
};

export type TargetResourceRoot = {
  name: string;
  sourceSegments: string[];
  destination: string;
};

export type TargetPathReport = {
  nativeDirs: NativeDirs;
  resourceRoots: TargetResourceRoot[];
};

export function assertTarget(value: string): Target {
  // Valide les entrées utilisateur avant d'écrire dans les dossiers locaux.
  if ((TARGETS as readonly string[]).includes(value)) return value as Target;
  throw new Error(`Target invalide: ${value}. Options: ${TARGETS.join(', ')}`);
}

export function resolveTargetRoot(target: Target): string {
  const home = os.homedir();

  switch (target) {
    case 'pi':
      return path.join(home, '.pi');
    case 'claude':
      return path.join(home, '.claude');
    case 'codex':
      return path.join(home, '.codex');
  }
}

export function resolveNativeDirs(target: Target): NativeDirs {
  const root = resolveTargetRoot(target);
  // Chaque harness expose des dossiers natifs différents pour skills/prompts/context.

  switch (target) {
    case 'pi':
      return {
        root,
        config: path.join(root, 'agent'),
        skills: path.join(root, 'agent', 'skills'),
        prompts: path.join(root, 'agent', 'prompts'),
        context: path.join(root, 'agent')
      };
    case 'claude':
      return {
        root,
        config: root,
        skills: path.join(root, 'skills'),
        prompts: path.join(root, 'commands'),
        context: root
      };
    case 'codex':
      return {
        root,
        config: root,
        skills: path.join(root, 'skills'),
        prompts: path.join(root, 'prompts'),
        context: root
      };
  }
}

export function resolveTargetResourceRoots(target: Target): TargetResourceRoot[] {
  const dirs = resolveNativeDirs(target);

  return [
    {
      name: 'core skills',
      sourceSegments: ['core', 'skills'],
      destination: dirs.skills,
    },
    {
      name: 'core prompts',
      sourceSegments: ['core', 'prompts'],
      destination: dirs.prompts,
    },
    {
      name: 'core context',
      sourceSegments: ['core', 'context'],
      destination: dirs.context,
    },
    {
      name: 'harness config',
      sourceSegments: ['harness', target],
      destination: dirs.config,
    },
  ];
}

export function createTargetPathReport(target: Target): TargetPathReport {
  return {
    nativeDirs: resolveNativeDirs(target),
    resourceRoots: resolveTargetResourceRoots(target),
  };
}
