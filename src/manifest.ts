import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'fs-extra';
import { resolveHarnessLayout } from './target-catalog.js';
import type { Mode, Target } from './types.js';

export type ResourceFingerprint = {
  type: 'file' | 'directory' | 'symlink';
  hash?: string;
  target?: string;
};

export type ManifestEntry = {
  name: string;
  source: string;
  destination: string;
  mode: Mode;
  fingerprint: ResourceFingerprint;
};

export type InstallationManifest = {
  version: 1;
  target: Target;
  installedAt: string;
  entries: ManifestEntry[];
};

export function resolveManifestPath(target: Target): string {
  return path.join(resolveHarnessLayout(target).root, '.naixus-manifest.json');
}

export async function fingerprintResource(resourcePath: string): Promise<ResourceFingerprint | undefined> {
  if (!(await fs.pathExists(resourcePath))) return undefined;

  const stat = await fs.lstat(resourcePath);
  if (stat.isSymbolicLink()) {
    return { type: 'symlink', target: path.resolve(path.dirname(resourcePath), await fs.readlink(resourcePath)) };
  }

  if (stat.isDirectory()) {
    const hash = crypto.createHash('sha256');
    hash.update('directory\0');
    await hashDirectory(resourcePath, resourcePath, hash);
    return { type: 'directory', hash: hash.digest('hex') };
  }

  return { type: 'file', hash: await hashFile(resourcePath) };
}

export function fingerprintsEqual(
  left: ResourceFingerprint | undefined,
  right: ResourceFingerprint | undefined
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export async function writeInstallationManifest(
  target: Target,
  entries: Omit<ManifestEntry, 'fingerprint'>[]
): Promise<void> {
  const manifestEntries: ManifestEntry[] = [];

  for (const entry of entries) {
    const fingerprint = await fingerprintResource(entry.destination);
    if (!fingerprint) continue;
    manifestEntries.push({ ...entry, fingerprint });
  }

  const manifest: InstallationManifest = {
    version: 1,
    target,
    installedAt: new Date().toISOString(),
    entries: manifestEntries,
  };

  const manifestPath = resolveManifestPath(target);
  await fs.ensureDir(path.dirname(manifestPath));
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });
}

export async function readInstallationManifest(target: Target): Promise<InstallationManifest | undefined> {
  const manifestPath = resolveManifestPath(target);
  if (!(await fs.pathExists(manifestPath))) return undefined;
  return fs.readJson(manifestPath) as Promise<InstallationManifest>;
}

export async function saveInstallationManifest(manifest: InstallationManifest): Promise<void> {
  const manifestPath = resolveManifestPath(manifest.target);
  await fs.ensureDir(path.dirname(manifestPath));
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });
}

export async function removeInstallationManifest(target: Target): Promise<void> {
  await fs.remove(resolveManifestPath(target));
}

async function hashDirectory(root: string, current: string, hash: crypto.Hash): Promise<void> {
  const entries = (await fs.readdir(current)).sort();

  for (const entry of entries) {
    const absolutePath = path.join(current, entry);
    const relativePath = path.relative(root, absolutePath);
    const stat = await fs.lstat(absolutePath);

    if (stat.isSymbolicLink()) {
      hash.update(`symlink\0${relativePath}\0${path.resolve(path.dirname(absolutePath), await fs.readlink(absolutePath))}\0`);
    } else if (stat.isDirectory()) {
      hash.update(`directory\0${relativePath}\0`);
      await hashDirectory(root, absolutePath, hash);
    } else {
      hash.update(`file\0${relativePath}\0${await hashFile(absolutePath)}\0`);
    }
  }
}

async function hashFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    fs.createReadStream(filePath)
      .on('data', chunk => hash.update(chunk))
      .on('error', reject)
      .on('end', () => resolve(hash.digest('hex')));
  });
}
