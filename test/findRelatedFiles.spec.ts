import {Explorer} from '../lib';
import {Accumulator} from "../lib/model";
import { expect } from 'chai';
import 'mocha';
import {Tree} from "../lib/tree";
import {PostOrder} from "../lib/explorer";

const DEPENDENCY_TREE = {
    'Facebook.js': {
        'NewsFeed.js': {
            'Tile.js': {
                'Style.js': {},
                'Status.js': {
                    'Log.js': {}
                }
            }
        },
        'Messenger.js': {
            'Chat.js': {
                'Style.js': {},
                'Thread.js': {}
            }
        },
        'Profile.js': {
            'Bio.js': {},
            'Likes.js': {
                'Emoji.js': {}
            }
        },
        'Log.js': {}
    }
}



describe('Find Related Files', () => {
    let tree: Tree;
    let testFileAcc: Accumulator;
    let postOrderCallbacks = {
        directDependencyModifiedCb: (path: string, relatedFiles: Accumulator) => {
            relatedFiles.add(path);
            return true;
        }
    }
    beforeEach(() => {
        tree = Tree.CreateTreeFromObject(DEPENDENCY_TREE) as Tree;
        testFileAcc = new Accumulator();
    });

    it('should return files importing Style.js i.e tile and chat new', () => {
        let changedFiles: Set<string> = new Set(['Style.js']);
        let expectedResult: Set<string> = new Set();
        expectedResult.add('Tile.js');
        expectedResult.add('Chat.js');

        PostOrder(tree, postOrderCallbacks, changedFiles, testFileAcc);
        expect(testFileAcc.toArray()).to.have.members(Array.from(expectedResult));
    });

    it('should return files importing Style.js i.e tile and chat', () => {
        let changedFiles: Set<string> = new Set(['Style.js']);
        let expectedResult: Set<string> = new Set();
        expectedResult.add('Tile.js');
        expectedResult.add('Chat.js');

        PostOrder(tree, postOrderCallbacks, changedFiles, testFileAcc);
        expect(testFileAcc.toArray()).to.have.members(Array.from(expectedResult));
    });

    it('should return files importing Emoji.js and Messenger.js i.e likes and facebook', () => {
        let changedFiles: Set<string> = new Set(['Emoji.js', 'Messenger.js']);
        let expectedResult: Set<string> = new Set();
        expectedResult.add('Likes.js');
        expectedResult.add('Facebook.js');

        PostOrder(tree, postOrderCallbacks, changedFiles, testFileAcc);
        expect(testFileAcc.toArray()).to.have.members(Array.from(expectedResult));
    });

    it('should return empty if only root file modified', () => {
        let changedFiles: Set<string> = new Set(['Facebook.js']);
        let explorer = new Explorer(DEPENDENCY_TREE);

        PostOrder(tree, postOrderCallbacks, changedFiles, testFileAcc);
        expect(testFileAcc.toArray()).to.have.length(0);
    });

    it('should return files importing Log.js i.e Facebook.js and Status.js', () => {
        let changedFiles: Set<string> = new Set(['Facebook.js', 'NewsFeed.js', 'Tile.js', 'Status.js']);
        let expectedResult: Set<string> = new Set(['Facebook.js', 'NewsFeed.js', 'Tile.js']);

        PostOrder(tree, postOrderCallbacks, changedFiles, testFileAcc);
        expect(testFileAcc.toArray()).to.have.members(Array.from(expectedResult));
    });

    it('should work even if imports / change list are skewed', () => {
        let changedFiles: Set<string> = new Set(['Facebook.js', 'NewsFeed.js', 'Tile.js', 'Status.js']);
        let expectedResult: Set<string> = new Set(['Facebook.js', 'NewsFeed.js', 'Tile.js']);

        PostOrder(tree, postOrderCallbacks, changedFiles, testFileAcc);
        expect(testFileAcc.toArray()).to.have.members(Array.from(expectedResult));
    });

});