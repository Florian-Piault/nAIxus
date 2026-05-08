import fs from "fs-extra";

export type Runtime = {
  pathExists(path: string): Promise<boolean>;
  ensureDir(path: string): Promise<void>;
  remove(path: string): Promise<void>;
  copy(source: string, destination: string): Promise<void>;
  lstat(path: string): Promise<{ isDirectory(): boolean }>;
  symlink(source: string, destination: string, type: "file" | "dir" | "junction"): Promise<void>;
  log(message: string): void;
  warn(message: string): void;
};

export const nodeRuntime: Runtime = {
  pathExists: fs.pathExists,
  ensureDir: fs.ensureDir,
  remove: fs.remove,
  copy: (source, destination) => fs.copy(source, destination, { overwrite: true }),
  lstat: fs.lstat,
  symlink: fs.symlink,
  log: console.log,
  warn: console.warn,
};
