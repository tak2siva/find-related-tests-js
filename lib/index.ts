import dependencyTree, { DependencyObj }  from 'dependency-tree';

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

export function FindRelatedFiles(entryPoint: string, searchDir: string,  changedFileSet: Set<string>) : Set<string> {
    let tree: DependencyObj = dependencyTree({
        filename: entryPoint,
        directory: searchDir,
        filter: path => path.indexOf('node_modules') === -1
    });
    let explorer: Explorer = new Explorer(tree);
    return explorer.findConsumersOf(changedFileSet);
}