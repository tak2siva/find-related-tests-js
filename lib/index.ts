import dependencyTree, {DependencyObj} from 'dependency-tree';
import log from 'loglevel';
import {Accumulator} from "./model";
import fs from "fs";
import {Configuration} from "./config";
import {PostOrder} from "./explorer";
import {Tree} from "./tree";

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

export function FindRelatedFiles2(config: Configuration) : Set<string> {
    let treeMap: DependencyObj = dependencyTree({
        filename: config.entryPoint,
        directory: config.searchDir,
        filter: config.dependencyExcludeFilter
    });
    let tree = Tree.CreateTreeFromObject(treeMap);
    log.debug("Tree created.");
    let postOrderCallbacks = {
        directDependencyModifiedCb: (path: string, relatedFiles: Accumulator) => {
            relatedFiles.add(path);
            return true;
        }
    }
    if(config.directDependencyModifiedCb) {
        postOrderCallbacks.directDependencyModifiedCb = config.directDependencyModifiedCb;
    }
    let testFilesAcc = new Accumulator();
    if(tree) {
        if(config.changedFileSet) {
            log.debug("Traversing tree..");
            PostOrder(tree as Tree, postOrderCallbacks, config.changedFileSet, testFilesAcc);
            log.debug("Treverse completed..");
            // FlushTestCandidates(config, testFilesAcc.testCandidates);
        } else {
            log.info("ChangeNo files modified..")
        }
    } else {
        log.error("Unable to create tree from dependency obj");
    }

    return testFilesAcc.testCandidates;
}

export function FlushTestCandidates(config: Configuration, testCandidates: Set<string>) {
    if(config.outputFile) {
        log.info("Writing test candidates to ", config.outputFile + "\n\n");
        fs.writeFile(config.outputFile, Array.from(testCandidates).join(' '), err => {
            if(err) {
                console.log('output write error: ', err)
            }
        });
    }
}

export function Executor(config: Configuration) {
    let testCandidates = FindRelatedFiles2(config);
    FlushTestCandidates(config, testCandidates);
}