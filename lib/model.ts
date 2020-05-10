
export class Accumulator {
    testCandidates: Set<string>;

    constructor() {
        this.testCandidates = new Set<string>();
    }

    add(file: string) {
        this.testCandidates.add(file);
    }
}

export enum InputMode {
    stdin = "stdin",
    config = "config"
}

export class Configuration {
    entryPoint: string;
    searchDir: string;
    gitRoot: string; // need to figure out absolute path // required if input is stdin
    inputMode: InputMode; // 'stdin' || 'config',
    gitIncludeFilter?(path: string): boolean;
    dependencyExcludeFilter?(path: string): boolean;
    sourceToTestMapper?(sourceFile: string, acc: Accumulator): void;
    outputFile?: string;
    changedFileSet?: Set<string>;

    constructor(config: any) {
        if(!config.entryPoint) {
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
        this.gitRoot = config.gitRoot;

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
        this.gitIncludeFilter = config.gitIncludeFilter;
        this.dependencyExcludeFilter = config.dependencyExcludeFilter;
        this.sourceToTestMapper = config.sourceToTestMapper;
        this.outputFile = config.outputFile;
    }
}