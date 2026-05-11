import os from 'node:os';
import path from 'node:path';
const TARGET_CATALOG = {
    pi: {
        layout: (home) => {
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
        layout: (home) => {
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
        layout: (home) => {
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
};
export const TARGETS = Object.keys(TARGET_CATALOG);
export const TARGET_OPTION_HELP = TARGETS.join('|');
export const DEFAULT_TARGET = 'pi';
export function assertTarget(value) {
    // Valide les entrées utilisateur avant d'écrire dans les dossiers locaux.
    if (value in TARGET_CATALOG)
        return value;
    throw new Error(`Target invalide: ${value}. Options: ${TARGETS.join(', ')}`);
}
export function resolveTargetRoot(target) {
    return resolveHarnessLayout(target).root;
}
export function resolveHarnessLayout(target) {
    return TARGET_CATALOG[target].layout(os.homedir());
}
export const resolveNativeDirs = resolveHarnessLayout;
