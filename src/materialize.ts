import fs from "fs-extra";
import path from "node:path";
import type { Mode } from "./types.js";

// Crée la ressource cible en copie ou en lien symbolique.
export async function materialize(
  src: string,
  dest: string,
  mode: Mode,
  fallbackToCopy = true
): Promise<void> {
  await fs.ensureDir(path.dirname(dest));
  await fs.remove(dest);

  if (mode === "copy") {
    await fs.copy(src, dest, { overwrite: true });
    return;
  }

  try {
    // Le type du lien dépend de la nature de la source et de la plateforme.
    const stat = await fs.lstat(src);
    const type: "file" | "dir" | "junction" = stat.isDirectory()
      ? process.platform === "win32"
        ? "junction"
        : "dir"
      : "file";
    await fs.symlink(src, dest, type);
  } catch (err) {
    if (!fallbackToCopy) throw err;
    console.warn(`link impossible (${String(err)}), fallback copy -> ${dest}`);
    await fs.copy(src, dest, { overwrite: true });
  }
}

// Matérialise chaque entrée d'un dossier source vers le dossier cible.
export async function materializeChildren(
  srcDir: string,
  destDir: string,
  mode: Mode
): Promise<void> {
  if (!(await fs.pathExists(srcDir))) {
    console.warn(`skip (absent): ${srcDir}`);
    return;
  }

  // Les README internes documentent les sources mais ne sont pas installés.
  const entries = (await fs.readdir(srcDir)).filter((entry) => entry !== "README.md");
  if (entries.length === 0) {
    await fs.ensureDir(destDir);
    console.log(`ok mkdir: ${destDir}`);
    return;
  }

  for (const entry of entries) {
    const src = path.join(srcDir, entry);
    const dest = path.join(destDir, entry);
    await materialize(src, dest, mode, true);
    console.log(`ok ${mode}: ${src} -> ${dest}`);
  }
}
