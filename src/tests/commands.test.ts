import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { doctor } from '../commands.js';
import type { Runtime } from '../runtime.js';

const home = process.env.HOME ?? '';

describe('doctor', () => {
  it('checks paths derived from the installation plan', async () => {
    const messages: string[] = [];
    const runtime = {
      pathExists: async () => true,
      log: (message: string) => messages.push(message)
    } as Runtime;

    await doctor('pi', runtime);

    expect(messages).toEqual([
      `✅ core skills/testskill source: ${path.resolve('core', 'skills', 'testskill')}`,
      `✅ core skills/testskill destination: ${path.join(home, '.pi', 'agent', 'skills', 'testskill')}`,
      `✅ target root: ${path.join(home, '.pi')}`
    ]);
  });
});
