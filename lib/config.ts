import {Accumulator} from "./model";

export enum InputMode {
    stdin = "stdin",
    config = "config"
}

export class Configuration {
    entryPoint: string;
    searchDir: string;
    inputMode: InputMode; // 'stdin' || 'config',

    dependencyExcludeFilter?(path: string): boolean;

    sourceFileModifiedCb?(path: string, relatedFiles: Accumulator): boolean;
    directDependencyModifiedCb?(path: string, relatedFiles: Accumulator): boolean;
    transitiveDependencyModifiedCb?(path: string, relatedFiles: Accumulator): boolean;

    outputFile?: string;
    changedFileSet?: Set<string>;

    constructor(config: any) {
        if (!config.entryPoint) {
            throw Error("Entry point file name is not provided. Ex: Root.js");
        }
        this.entryPoint = config.entryPoint;

        if (!config.searchDir) {
            throw Error("Search directory path is missing");
        }
        this.searchDir = config.searchDir;

        if (!config.gitRoot) {
            throw Error("Root path for this git repository is missing");
        }

        if (config.inputMode) {
            this.inputMode = config.inputMode as InputMode;
        } else {
            this.inputMode = 'stdin' as InputMode;
        }

        if (config.inputMode == InputMode.config) {
            if (config.changedFileSet && Array.isArray(config.changedFileSet) && config.changedFileSet.length > 0) {
                this.changedFileSet = new Set(config.changedFileSet);
            } else {
                throw Error('Input mode is config. Expecting list of files modified in the branch in configuration.');
            }
        }
        this.dependencyExcludeFilter = config.dependencyExcludeFilter;
        this.outputFile = config.outputFile;
    }
}