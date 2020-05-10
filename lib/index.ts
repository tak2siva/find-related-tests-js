import dependencyTree, { DependencyObj }  from 'dependency-tree';
import log from 'loglevel';
import { Configuration, Accumulator } from "./model";
import fs from "fs";

export class Explorer {
    root: DependencyObj;

    constructor(root: DependencyObj) {
        this.root = root;
    }

    findConsumersOf(changedFileSet: Set<string>) : Set<string> {
        return this.search(this.root, changedFileSet);
    }

    search(tree: DependencyObj, changedFileSet: Set<string>) : Set<string> {
        let stack: Array<any>;
        let relatedFileSet: Set<string>;

        if (!tree || Object.keys(tree).length === 0) {
            return new Set();
        }

        stack = [Object.entries(tree)[0]];
        relatedFileSet = new Set();

        while(stack.length > 0) {
            let [parent, children] = stack.pop();
            for(let entry of Object.entries(children)) {
                let currentChild: string = entry[0];
                let grandChildren: DependencyObj = entry[1] as DependencyObj;

                if(changedFileSet.has(currentChild)) {
                    relatedFileSet.add(parent);
                }
                if(Object.keys(grandChildren).length > 0) {
                    stack.push([currentChild, grandChildren]);
                }
            }
        }

        return relatedFileSet;
    }
}

export function FindRelatedFiles(config: Configuration) : Set<string> {
    let tree: DependencyObj = dependencyTree({
        filename: config.entryPoint,
        directory: config.searchDir,
        filter: config.dependencyExcludeFilter
    });
    log.debug("Tree..", tree);
    let explorer: Explorer = new Explorer(tree);
    if (!config.changedFileSet) {
        throw Error("Modified candidates are missing..");
    }
    let sourceCandidates = explorer.findConsumersOf(config.changedFileSet);
    log.info("\nSource Candidates..");
    log.info(sourceCandidates);
    log.info("\n");

    let acc: Accumulator = new Accumulator();
    sourceCandidates.forEach((sourceFile) => {
        if (config.sourceToTestMapper) {
            config.sourceToTestMapper(sourceFile, acc);
        }
    });

    return acc.testCandidates;
}

export function FlushTestCandidates(config: Configuration, testCandidates: Set<string>) {
    if(config.outputFile) {
        log.info("Writing test candidates to ", config.outputFile);
        fs.writeFile(config.outputFile, Array.from(testCandidates).join(' '), err => {
            if(err) {
                console.log('output write error: ', err)
            }
        });
    }
}

export function Executor(config: Configuration) {
    let testCandidates = FindRelatedFiles(config);
    FlushTestCandidates(config, testCandidates);
}