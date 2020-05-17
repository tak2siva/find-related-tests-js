import {PostOrderCallback, Tree} from "./tree";
import {Accumulator} from "./model";

interface PostOrderResult {
    imodified: boolean;
    directImportModified: boolean;
    transitiveImportModified: boolean;
}

function newPostOrderResult(): PostOrderResult {
    return {
        imodified: false,
        directImportModified: false,
        transitiveImportModified: false,
    }
}

export function PostOrder(root: Tree, cb: PostOrderCallback, changedFileSet: Set<string>, testFileAcc: Accumulator): PostOrderResult {
    let res = newPostOrderResult();
    if (!root) {
        return res;
    }
    for (let tmp of Object.values(root.nodes || {})) {
        let tmpRes = PostOrder(tmp, cb, changedFileSet, testFileAcc);
        if (tmpRes.imodified) {
            if (cb.directDependencyModifiedCb) {
                cb.directDependencyModifiedCb(root.name, testFileAcc);
            }
            res.directImportModified = true;
        }

        if (tmpRes.directImportModified) {
            if (cb.transitiveDependencyModifiedCb) {
                cb.transitiveDependencyModifiedCb(root.name, testFileAcc);
            }
            res.transitiveImportModified = true;
        }
    }
    if (changedFileSet.has(root.name)) {
        if (cb.sourceFileModifiedCb) {
            cb.sourceFileModifiedCb(root.name, testFileAcc);
        }
        res.imodified = true;
    }

    return res;
}