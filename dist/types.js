export { DEFAULT_TARGET, TARGET_OPTION_HELP, TARGETS, assertTarget, } from "./target-catalog.js";
export function assertMode(value) {
    if (value === "copy" || value === "link")
        return value;
    throw new Error(`Mode invalide: ${value}. Options: copy, link`);
}
