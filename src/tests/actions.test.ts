import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runAction } from '../actions.js';
import type { Runtime } from '../runtime.js';

describe('runAction', () => {
  it('runs install through the shared action seam', async () => {
    const messages: string[] = [];
    const runtime = {
      log: (message: string) => messages.push(message)
    } as Runtime;

    await runAction({ action: 'install', target: 'pi', mode: 'copy', dryRun: true }, runtime);

    expect(messages).toEqual([
      `dry-run copy core skills/brainstorm: ${path.resolve('core', 'skills', 'brainstorm')} -> ${path.join(
        process.env.HOME ?? '',
        '.pi',
        'agent',
        'skills',
        'brainstorm'
      )}`,
      `dry-run copy core skills/code-review: ${path.resolve('core', 'skills', 'code-review')} -> ${path.join(
        process.env.HOME ?? '',
        '.pi',
        'agent',
        'skills',
        'code-review'
      )}`,
      `dry-run copy core skills/commit: ${path.resolve('core', 'skills', 'commit')} -> ${path.join(
        process.env.HOME ?? '',
        '.pi',
        'agent',
        'skills',
        'commit'
      )}`
    ]);
  });

  it('runs doctor through the shared action seam', async () => {
    const messages: string[] = [];
    const runtime = {
      pathExists: async () => true,
      log: (message: string) => messages.push(message)
    } as Runtime;

    await runAction({ action: 'doctor', target: 'pi' }, runtime);

    expect(messages).toContain(`✅ target root: ${path.join(process.env.HOME ?? '', '.pi')}`);
    expect(messages).toContain(`manifest: ${path.join(process.env.HOME ?? '', '.pi', '.naixus-manifest.json')}`);
  });

  it('runs paths through the shared action seam', async () => {
    const messages: string[] = [];
    const runtime = {
      log: (message: string) => messages.push(message)
    } as Runtime;

    await runAction({ action: 'paths', target: 'pi' }, runtime);

    expect(messages).toContain('harness layout');
    expect(messages).toContain(`skills: ${path.join(process.env.HOME ?? '', '.pi', 'agent', 'skills')}`);
    expect(messages).toContain('resource roots');
  });
});
