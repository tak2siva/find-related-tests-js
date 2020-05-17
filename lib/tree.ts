import {DependencyObj} from "dependency-tree";
import {Accumulator} from "./model";

interface NodeDataType {
    [key: string]: Tree;
}

export class PostOrderCallback {
    sourceFileModifiedCb?(path: string, relatedFiles: Accumulator): boolean;

    directDependencyModifiedCb?(path: string, relatedFiles: Accumulator): boolean;

    transitiveDependencyModifiedCb?(path: string, relatedFiles: Accumulator): boolean;
}

export class Tree {
    name: string
    // nodes: Map<string, Tree>
    nodes: NodeDataType

    constructor(name: string) {
        this.name = name;
        // this.nodes = new Map<string, Tree>();
        this.nodes = {};
    }

    addNode(name: string): Tree {
        if (this.nodes[name]) {
            throw Error("Key already exists in tree: " + name);
        }
        let temp: Tree = new Tree(name);
        this.nodes[name] = temp;
        return temp;
    }

    getNode(name: string): Tree | undefined {
        return this.nodes[name];
    }

    static CreateTreeFromObject(obj: DependencyObj): Tree | undefined {
        if (!obj || Object.keys(obj).length === 0) {
            return undefined;
        }

        let root: Tree = new Tree('root');
        Tree.traverse(root, obj);

        // return root.getNode(Array.from(root.nodes.keys())[0]);
        return root.getNode(Object.keys(root.nodes)[0]);
    }

    static traverse(parent: Tree, obj: DependencyObj) {
        if (!obj || Object.keys(obj).length === 0) {
            return undefined;
        }
        let [key1, value1] = Object.entries(obj)[0];
        let current: Tree = parent.addNode(key1);

        for (let entry of Object.entries(value1)) {
            let key2: string = entry[0];
            let value2: DependencyObj = entry[1] as DependencyObj;
            let tmp: DependencyObj = {};
            tmp[key2] = value2;
            Tree.traverse(current, tmp);
        }
    }
}