import { materializePlan } from './materialize.js';
import { fingerprintResource, fingerprintsEqual, readInstallationManifest, removeInstallationManifest, resolveManifestPath, saveInstallationManifest, writeInstallationManifest, } from './manifest.js';
import path from 'node:path';
import { createInstallationPlan, createTargetPathReport, listTargetResources } from './plan.js';
import { nodeRuntime } from './runtime.js';
export const ACTIONS = [
    'install',
    'sync',
    'doctor',
    'paths',
    'uninstall'
];
export const DEFAULT_ACTION = 'doctor';
export const MODES = ['copy', 'link'];
export const DEFAULT_MODE = 'copy';
export const CLI_DEFAULT_MODE = 'link';
export async function runAction(request, runtime = nodeRuntime) {
    const selectedResourceIds = await resolveSelectedResourceIds(request);
    const plan = await createInstallationPlan(request.target, selectedResourceIds);
    if (request.action === 'doctor') {
        for (const check of plan.doctorChecks()) {
            const exists = await runtime.pathExists(check.path);
            runtime.log(`${exists ? '✅' : '❌'} ${check.name}: ${check.path}`);
        }
        const manifest = await readInstallationManifest(request.target);
        runtime.log(`manifest: ${resolveManifestPath(request.target)}`);
        if (!manifest) {
            runtime.log('manifest status: missing');
        }
        else {
            runtime.log(`manifest status: ${manifest.entries.length} managed resources`);
            for (const entry of manifest.entries) {
                const currentFingerprint = await fingerprintResource(entry.destination);
                const status = fingerprintsEqual(currentFingerprint, entry.fingerprint)
                    ? 'managed'
                    : currentFingerprint
                        ? 'modified'
                        : 'missing';
                runtime.log(`${status === 'managed' ? '✅' : '❌'} ${entry.name}: ${status}`);
            }
        }
        return;
    }
    if (request.action === 'uninstall') {
        const manifest = await readInstallationManifest(request.target);
        if (!manifest) {
            runtime.log(`manifest missing: ${resolveManifestPath(request.target)}`);
            return;
        }
        const skippedEntries = [];
        for (const entry of manifest.entries) {
            if (!isInsideTargetRoot(entry.destination, request.target)) {
                runtime.warn(`skip unsafe destination ${entry.name}: ${entry.destination}`);
                skippedEntries.push(entry);
                continue;
            }
            const currentFingerprint = await fingerprintResource(entry.destination);
            if (!fingerprintsEqual(currentFingerprint, entry.fingerprint)) {
                runtime.warn(`skip modified or missing ${entry.name}: ${entry.destination}`);
                skippedEntries.push(entry);
                continue;
            }
            if (request.dryRun)
                runtime.log(`dry-run remove ${entry.name}: ${entry.destination}`);
            else {
                await runtime.remove(entry.destination);
                runtime.log(`removed ${entry.name}: ${entry.destination}`);
            }
        }
        if (request.dryRun)
            runtime.log(`dry-run update manifest: ${resolveManifestPath(request.target)}`);
        else if (skippedEntries.length > 0) {
            await saveInstallationManifest({
                ...manifest,
                installedAt: new Date().toISOString(),
                entries: skippedEntries,
            });
        }
        else {
            await removeInstallationManifest(request.target);
        }
        return;
    }
    if (request.action === 'paths') {
        const report = createTargetPathReport(request.target);
        runtime.log('harness layout');
        for (const [name, dir] of Object.entries(report.harnessLayout)) {
            runtime.log(`${name}: ${dir}`);
        }
        runtime.log('resource roots');
        for (const root of report.resourceRoots) {
            runtime.log(`${root.name}: ${root.sourceSegments.join('/')} -> ${root.destination}`);
        }
        return;
    }
    const steps = plan.materializationSteps();
    await materializePlan(steps, request.mode ?? DEFAULT_MODE, Boolean(request.dryRun), runtime, Boolean(request.force));
    if (!request.dryRun) {
        await writeInstallationManifest(request.target, steps.map(step => ({
            ...step,
            mode: request.mode ?? DEFAULT_MODE,
        })), selectedResourceIds);
    }
}
export async function listResources(request, runtime = nodeRuntime) {
    const resources = await listTargetResources(request.target);
    const manifest = await readInstallationManifest(request.target);
    const selected = manifest?.selectedResources ? new Set(manifest.selectedResources) : undefined;
    const installed = new Set(manifest?.entries.map((entry) => entry.id).filter(Boolean));
    if (request.json) {
        runtime.log(JSON.stringify(resources.map((resource) => ({
            id: resource.id,
            name: resource.name,
            source: resource.source,
            destination: resource.destination,
            selected: selected ? selected.has(resource.id) : undefined,
            installed: installed.has(resource.id),
        })), null, 2));
        return;
    }
    for (const resource of resources) {
        if (request.verbose) {
            const status = selected
                ? selected.has(resource.id) ? 'selected' : 'not selected'
                : installed.has(resource.id) ? 'installed' : 'available';
            runtime.log(`${resource.id} (${status})`);
            runtime.log(`  ${resource.source} -> ${resource.destination}`);
        }
        else {
            runtime.log(`${resource.id} - ${resource.name}`);
        }
    }
}
async function resolveSelectedResourceIds(request) {
    if (request.action === 'sync' && !request.include?.length && !request.exclude?.length) {
        const manifest = await readInstallationManifest(request.target);
        if (manifest?.selectedResources)
            return manifest.selectedResources;
    }
    if (!request.include?.length && !request.exclude?.length)
        return undefined;
    const resources = await listTargetResources(request.target);
    const availableIds = new Set(resources.map((resource) => resource.id));
    const requestedIds = [...(request.include ?? []), ...(request.exclude ?? [])];
    const unknownIds = requestedIds.filter((id) => !availableIds.has(id));
    if (unknownIds.length > 0) {
        throw new Error(`Unknown resource id(s): ${unknownIds.join(', ')}`);
    }
    const selected = new Set(request.include?.length ? request.include : resources.map((resource) => resource.id));
    for (const id of request.exclude ?? [])
        selected.delete(id);
    return [...selected].sort();
}
function isInsideTargetRoot(destination, target) {
    const targetRoot = path.dirname(resolveManifestPath(target));
    const relativeDestination = path.relative(targetRoot, destination);
    return Boolean(relativeDestination) && !relativeDestination.startsWith('..') && !path.isAbsolute(relativeDestination);
}
