import fs from "fs-extra";

export type RuntimeStats = {
  isDirectory(): boolean;
  isSymbolicLink(): boolean;
};

export type Runtime = {
  pathExists(path: string): Promise<boolean>;
  ensureDir(path: string): Promise<void>;
  remove(path: string): Promise<void>;
  copy(source: string, destination: string): Promise<void>;
  lstat(path: string): Promise<RuntimeStats>;
  readdir(path: string): Promise<string[]>;
  readFile(path: string): Promise<Buffer>;
  readlink(path: string): Promise<string>;
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
  readdir: fs.readdir,
  readFile: fs.readFile,
  readlink: fs.readlink,
  symlink: fs.symlink,
  log: console.log,
  warn: console.warn,
};
