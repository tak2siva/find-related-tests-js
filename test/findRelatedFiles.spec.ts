import { Explorer } from '../lib';
import { expect } from 'chai';
import 'mocha';

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
    it('should return files importing Style.js i.e tile and chat', () => {
        let changedFiles: Set<string> = new Set(['Style.js']);
        let expectedResult: Set<string> = new Set();
        expectedResult.add('Tile.js');
        expectedResult.add('Chat.js');

        let explorer = new Explorer(DEPENDENCY_TREE);
        
        let actualResult: Set<string> = explorer.findConsumersOf(changedFiles);
        expect(Array.from(actualResult)).to.have.members(Array.from(expectedResult));
    });

    it('should return files importing Emoji.js and Messenger.js i.e likes and facebook', () => {
        let changedFiles: Set<string> = new Set(['Emoji.js', 'Messenger.js']);
        let expectedResult: Set<string> = new Set();
        expectedResult.add('Likes.js');
        expectedResult.add('Facebook.js');

        let explorer = new Explorer(DEPENDENCY_TREE);

        let actualResult: Set<string> = explorer.findConsumersOf(changedFiles);
        expect(Array.from(actualResult)).to.have.members(Array.from(expectedResult));
    });

    it('should return empty if only root file modified', () => {
        let changedFiles: Set<string> = new Set(['Facebook.js']);
        let explorer = new Explorer(DEPENDENCY_TREE);
        let actualResult: Set<string> = explorer.findConsumersOf(changedFiles);
        expect(Array.from(actualResult)).to.have.length(0);
    });

    it('should return files importing Log.js i.e Facebook.js and Status.js', () => {
        let changedFiles: Set<string> = new Set(['Facebook.js', 'NewsFeed.js', 'Tile.js', 'Status.js']);
        let explorer = new Explorer(DEPENDENCY_TREE);
        let expectedResult: Set<string> = new Set(['Facebook.js', 'NewsFeed.js', 'Tile.js']);
        let actualResult: Set<string> = explorer.findConsumersOf(changedFiles);
        expect(Array.from(actualResult)).to.have.members(Array.from(expectedResult));
    });

    it('should work even if imports / change list are skewed', () => {
        let changedFiles: Set<string> = new Set(['Facebook.js', 'NewsFeed.js', 'Tile.js', 'Status.js']);
        let explorer = new Explorer(DEPENDENCY_TREE);
        let expectedResult: Set<string> = new Set(['Facebook.js', 'NewsFeed.js', 'Tile.js']);
        let actualResult: Set<string> = explorer.findConsumersOf(changedFiles);
        expect(Array.from(actualResult)).to.have.members(Array.from(expectedResult));
    });
});