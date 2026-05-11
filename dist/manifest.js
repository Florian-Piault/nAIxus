import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'fs-extra';
import { resolveHarnessLayout } from './target-catalog.js';
export function resolveManifestPath(target) {
    return path.join(resolveHarnessLayout(target).root, '.naixus-manifest.json');
}
export async function fingerprintResource(resourcePath) {
    if (!(await fs.pathExists(resourcePath)))
        return undefined;
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
export function fingerprintsEqual(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}
export async function writeInstallationManifest(target, entries, selectedResources) {
    const manifestEntries = [];
    for (const entry of entries) {
        const fingerprint = await fingerprintResource(entry.destination);
        if (!fingerprint)
            continue;
        manifestEntries.push({ ...entry, fingerprint });
    }
    const manifest = {
        version: 1,
        target,
        installedAt: new Date().toISOString(),
        selectedResources: selectedResources ? [...selectedResources].sort() : undefined,
        entries: manifestEntries,
    };
    const manifestPath = resolveManifestPath(target);
    await fs.ensureDir(path.dirname(manifestPath));
    await fs.writeJson(manifestPath, manifest, { spaces: 2 });
}
export async function readInstallationManifest(target) {
    const manifestPath = resolveManifestPath(target);
    if (!(await fs.pathExists(manifestPath)))
        return undefined;
    return fs.readJson(manifestPath);
}
export async function saveInstallationManifest(manifest) {
    const manifestPath = resolveManifestPath(manifest.target);
    await fs.ensureDir(path.dirname(manifestPath));
    await fs.writeJson(manifestPath, manifest, { spaces: 2 });
}
export async function removeInstallationManifest(target) {
    await fs.remove(resolveManifestPath(target));
}
async function hashDirectory(root, current, hash) {
    const entries = (await fs.readdir(current)).sort();
    for (const entry of entries) {
        const absolutePath = path.join(current, entry);
        const relativePath = path.relative(root, absolutePath);
        const stat = await fs.lstat(absolutePath);
        if (stat.isSymbolicLink()) {
            hash.update(`symlink\0${relativePath}\0${path.resolve(path.dirname(absolutePath), await fs.readlink(absolutePath))}\0`);
        }
        else if (stat.isDirectory()) {
            hash.update(`directory\0${relativePath}\0`);
            await hashDirectory(root, absolutePath, hash);
        }
        else {
            hash.update(`file\0${relativePath}\0${await hashFile(absolutePath)}\0`);
        }
    }
}
async function hashFile(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        fs.createReadStream(filePath)
            .on('data', chunk => hash.update(chunk))
            .on('error', reject)
            .on('end', () => resolve(hash.digest('hex')));
    });
}
