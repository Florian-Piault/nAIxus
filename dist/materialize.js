import path from 'node:path';
import { nodeRuntime } from './runtime.js';
async function assertNoConflict(source, destination, force, runtime) {
    if (!(await runtime.pathExists(destination)) || force)
        return;
    if (await resourcesMatch(source, destination, runtime))
        return;
    throw new Error(`Conflict: existing destination not managed or modified: ${destination}. Use --force to overwrite.`);
}
async function resourcesMatch(source, destination, runtime) {
    const sourceStat = await runtime.lstat(source);
    const destinationStat = await runtime.lstat(destination);
    if (destinationStat.isSymbolicLink()) {
        const linkTarget = await runtime.readlink(destination);
        const resolvedTarget = path.resolve(path.dirname(destination), linkTarget);
        return resolvedTarget === path.resolve(source);
    }
    if (sourceStat.isSymbolicLink())
        return false;
    if (sourceStat.isDirectory() !== destinationStat.isDirectory())
        return false;
    if (!sourceStat.isDirectory()) {
        const [sourceContent, destinationContent] = await Promise.all([
            runtime.readFile(source),
            runtime.readFile(destination)
        ]);
        return sourceContent.equals(destinationContent);
    }
    const [sourceEntries, destinationEntries] = await Promise.all([
        runtime.readdir(source),
        runtime.readdir(destination)
    ]);
    if (sourceEntries.length !== destinationEntries.length)
        return false;
    const sortedSourceEntries = [...sourceEntries].sort();
    const sortedDestinationEntries = [...destinationEntries].sort();
    for (let index = 0; index < sortedSourceEntries.length; index += 1) {
        if (sortedSourceEntries[index] !== sortedDestinationEntries[index])
            return false;
        if (!(await resourcesMatch(path.join(source, sortedSourceEntries[index]), path.join(destination, sortedDestinationEntries[index]), runtime))) {
            return false;
        }
    }
    return true;
}
// Crée la ressource cible en copie ou en lien symbolique.
async function materializeResource(step, mode, force, runtime) {
    const src = step.source;
    const dest = step.destination;
    await runtime.ensureDir(path.dirname(dest));
    await assertNoConflict(src, dest, force, runtime);
    await runtime.remove(dest);
    if (mode === 'copy') {
        await runtime.copy(src, dest);
        return;
    }
    try {
        // Le type du lien dépend de la nature de la source et de la plateforme.
        const stat = await runtime.lstat(src);
        const type = stat.isDirectory()
            ? process.platform === 'win32'
                ? 'junction'
                : 'dir'
            : 'file';
        await runtime.symlink(src, dest, type);
    }
    catch (err) {
        runtime.warn(`link impossible (${String(err)}), fallback copy -> ${dest}`);
        await runtime.copy(src, dest);
    }
}
export async function materializePlan(steps, mode, dryRun = false, runtime = nodeRuntime, force = false) {
    for (const step of steps) {
        if (dryRun)
            runtime.log(`dry-run ${mode} ${step.name}: ${step.source} -> ${step.destination}`);
        else {
            await materializeResource(step, mode, force, runtime);
            runtime.log(`ok ${mode} ${step.name}: ${step.source} -> ${step.destination}`);
        }
    }
}
