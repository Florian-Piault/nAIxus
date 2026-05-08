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
      `dry-run copy core skills/testskill: ${path.resolve('core', 'skills', 'testskill')} -> ${path.join(
        process.env.HOME ?? '',
        '.pi',
        'agent',
        'skills',
        'testskill'
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

    expect(messages.at(-1)).toBe(`✅ target root: ${path.join(process.env.HOME ?? '', '.pi')}`);
  });

  it('runs paths through the shared action seam', async () => {
    const messages: string[] = [];
    const runtime = {
      log: (message: string) => messages.push(message)
    } as Runtime;

    await runAction({ action: 'paths', target: 'pi' }, runtime);

    expect(messages).toContain('native dirs');
    expect(messages).toContain(`skills: ${path.join(process.env.HOME ?? '', '.pi', 'agent', 'skills')}`);
    expect(messages).toContain('resource roots');
  });
});
