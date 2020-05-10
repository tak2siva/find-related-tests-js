import dependencyTree, { DependencyObj }  from 'dependency-tree';
import log from 'loglevel';

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

class Accumulator {
    testCandidates: Set<string>;

    constructor() {
        this.testCandidates = new Set<string>();
    }

    add(file: string) {
        this.testCandidates.add(file);
    }
}

export function FindRelatedFiles(entryPoint: string, searchDir: string,  changedFileSet: Set<string>, config: any) : Set<string> {
    let tree: DependencyObj = dependencyTree({
        filename: entryPoint,
        directory: searchDir,
        filter: config.dependencyExcludeFilter
    });
    log.debug("Tree..", tree);
    let explorer: Explorer = new Explorer(tree);
    let sourceCandidates = explorer.findConsumersOf(changedFileSet);
    log.info("\nSource Candidates..");
    log.info(sourceCandidates);
    log.info("\n");

    let acc: Accumulator = new Accumulator();
    sourceCandidates.forEach((sourceFile) => {
       config.sourceToTestMapper(sourceFile, acc);
    });

    return acc.testCandidates;
}

//
// dependencyTree({
//     filename: './App.js',
//     directory: './src',
//     filter: path => path.indexOf('node_modules') === -1
// })