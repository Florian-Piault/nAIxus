import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { materializePlan } from '../materialize.js';
import type { Runtime } from '../runtime.js';

let tempDir: string | undefined;

afterEach(async () => {
  vi.restoreAllMocks();
  if (tempDir) await fs.remove(tempDir);
  tempDir = undefined;
});

describe('materializePlan', () => {
  it('materializes each planned resource', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'naixus-'));
    const source = path.join(tempDir, 'source.txt');
    const destination = path.join(tempDir, 'dest', 'source.txt');
    await fs.writeFile(source, 'hello');

    await materializePlan([{ name: 'source', source, destination }], 'copy');

    await expect(fs.readFile(destination, 'utf8')).resolves.toBe('hello');
  });

  it('prints planned resources without writing in dry-run mode', async () => {
    const messages: string[] = [];
    const runtime = {
      log: (message: string) => messages.push(message)
    } as Runtime;

    await materializePlan(
      [
        {
          name: 'source',
          source: '/source.txt',
          destination: '/dest/source.txt'
        }
      ],
      'copy',
      true,
      runtime
    );

    expect(messages).toEqual([
      'dry-run copy source: /source.txt -> /dest/source.txt'
    ]);
  });

  it('falls back to copy when link fails', async () => {
    const calls: string[] = [];
    const runtime: Runtime = {
      pathExists: async () => true,
      ensureDir: async path => calls.push(`ensureDir ${path}`),
      remove: async path => calls.push(`remove ${path}`),
      copy: async (source, destination) =>
        calls.push(`copy ${source} ${destination}`),
      lstat: async () => ({
        isDirectory: () => false,
        isSymbolicLink: () => false
      }),
      readdir: async () => [],
      readFile: async () => Buffer.from(''),
      readlink: async () => '',
      symlink: async () => {
        calls.push('symlink');
        throw new Error('no link');
      },
      log: message => calls.push(`log ${message}`),
      warn: message => calls.push(`warn ${message}`)
    };

    await materializePlan(
      [
        {
          name: 'source',
          source: '/source.txt',
          destination: '/dest/source.txt'
        }
      ],
      'link',
      false,
      runtime
    );

    expect(calls).toEqual([
      'ensureDir /dest',
      'remove /dest/source.txt',
      'symlink',
      'warn link impossible (Error: no link), fallback copy -> /dest/source.txt',
      'copy /source.txt /dest/source.txt',
      'log ok link source: /source.txt -> /dest/source.txt'
    ]);
  });

  it('rejects conflicting destinations unless force is enabled', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'naixus-'));
    const source = path.join(tempDir, 'source.txt');
    const destination = path.join(tempDir, 'dest', 'source.txt');
    await fs.ensureDir(path.dirname(destination));
    await fs.writeFile(source, 'from source');
    await fs.writeFile(destination, 'user content');

    await expect(
      materializePlan([{ name: 'source', source, destination }], 'copy')
    ).rejects.toThrow(
      `Conflict: existing destination not managed or modified: ${destination}. Use --force to overwrite.`
    );
    await expect(fs.readFile(destination, 'utf8')).resolves.toBe(
      'user content'
    );

    await materializePlan(
      [{ name: 'source', source, destination }],
      'copy',
      false,
      undefined,
      true
    );

    await expect(fs.readFile(destination, 'utf8')).resolves.toBe('from source');
  });

  it('allows replacing an identical copied resource', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'naixus-'));
    const source = path.join(tempDir, 'source.txt');
    const destination = path.join(tempDir, 'dest', 'source.txt');
    await fs.ensureDir(path.dirname(destination));
    await fs.writeFile(source, 'same content');
    await fs.writeFile(destination, 'same content');

    await materializePlan([{ name: 'source', source, destination }], 'copy');

    await expect(fs.readFile(destination, 'utf8')).resolves.toBe(
      'same content'
    );
  });

  it('allows replacing a symlink to the same source', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'naixus-'));
    const source = path.join(tempDir, 'source.txt');
    const destination = path.join(tempDir, 'dest', 'source.txt');
    await fs.ensureDir(path.dirname(destination));
    await fs.writeFile(source, 'hello');
    await fs.symlink(source, destination);

    await materializePlan([{ name: 'source', source, destination }], 'link');

    await expect(fs.readlink(destination)).resolves.toBe(source);
  });
});
