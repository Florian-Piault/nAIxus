import fs from "fs-extra";
export const nodeRuntime = {
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
