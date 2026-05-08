import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { fingerprintResource, fingerprintsEqual } from '../manifest.js';

let tempDir: string | undefined;

afterEach(async () => {
  if (tempDir) await fs.remove(tempDir);
  tempDir = undefined;
});

describe('manifest fingerprints', () => {
  it('detects changed file content', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'naixus-'));
    const file = path.join(tempDir, 'resource.txt');
    await fs.writeFile(file, 'before');

    const before = await fingerprintResource(file);
    await fs.writeFile(file, 'after');

    expect(fingerprintsEqual(before, await fingerprintResource(file))).toBe(false);
  });

  it('detects changed directory content', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'naixus-'));
    const directory = path.join(tempDir, 'resource');
    await fs.ensureDir(directory);
    await fs.writeFile(path.join(directory, 'a.txt'), 'a');

    const before = await fingerprintResource(directory);
    await fs.writeFile(path.join(directory, 'b.txt'), 'b');

    expect(fingerprintsEqual(before, await fingerprintResource(directory))).toBe(false);
  });

  it('normalizes symlink targets', async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'naixus-'));
    const source = path.join(tempDir, 'source.txt');
    const link = path.join(tempDir, 'link.txt');
    await fs.writeFile(source, 'hello');
    await fs.symlink('source.txt', link);

    await expect(fingerprintResource(link)).resolves.toEqual({
      type: 'symlink',
      target: source,
    });
  });
});
