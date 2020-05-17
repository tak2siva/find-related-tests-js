import { expect } from 'chai';
import 'mocha';
import {Tree} from "../lib/tree";

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


describe('Tree', () => {
    it('should create tree', () => {
        let actual : Tree = Tree.CreateTreeFromObject(DEPENDENCY_TREE) as Tree;
        let root : Tree = new Tree('Facebook.js');
        let tile = root.addNode('NewsFeed.js').addNode('Tile.js');
        tile.addNode('Style.js');
        tile.addNode('Status.js').addNode('Log.js');

        let chat = root.addNode('Messenger.js').addNode('Chat.js');
        chat.addNode('Style.js');
        chat.addNode('Thread.js');

        let profile = root.addNode('Profile.js');
        profile.addNode('Bio.js');
        profile.addNode('Likes.js').addNode('Emoji.js');
        root.addNode('Log.js');

        // console.log(root);
        expect(actual).to.eql(root);
    });
});