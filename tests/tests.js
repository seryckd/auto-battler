
import { Battler, PLAYERS } from '../src/battler.js';          
import { Player } from '../src/player.js';
import { TestMinionDefs } from './minions-test-db.js';
import { Minion } from '../src/minion.js';

var createMinionList = arr => {
    var mins = [];
    arr.forEach(m => {
        mins.push({
            health: m.health
        });
    });
    return mins;
};

export function runTests(tests) {

    Minion.setDatabase(TestMinionDefs);

    tests.forEach(test => {
        console.log('================================================');
        console.log('Running test %s: %s', test.id, test.desc);

        const engine = new Battler(
            new Player('p1', test.start.p1), 
            new Player('p2', test.start.p2)
        );

        engine.init(PLAYERS.PLAYER_1);

        var turns = test.turns === undefined ? 1 : test.turns;

        while(turns-- > 0) {
            engine.turn();
            engine.flipRoles();
        }

        var result = engine.state();

        console.log(result);

        var player1 = createMinionList(result.player1Mins);
        var player2 = createMinionList(result.player2Mins);

        console.assert(JSON.stringify(player1) === JSON.stringify(test.end.p1), 'p1 expected:%o actual: %o', test.end.p1, player1);
        console.assert(JSON.stringify(player2) === JSON.stringify(test.end.p2), 'p2 expected:%o actual: %o', test.end.p2, player2);
    });
}
