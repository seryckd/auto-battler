import { Player } from './player.js'
import { Minion } from './minion.js'

export const PHASE = {
    CHARGE: 'charge',
    HIT: 'hit',
    RESOLVE: 'resolve'
};

export class BattleScript {
    constructor() {
        this.script = {
            players: [],
            turns: []
        };
        this.turns = null;
        this.phase = null;
        this.phases = null;
    }

    fetchScript() {

        // Clean up empty arrays before returning

        const pruneEmpty = (array) => {
            console.log("array=%o", array);
            for (let i=array.length-1; i>=0; --i) {
                if (array[i].length == 0) {
                    array.splice(i, 1);
                }
            }
        };

        pruneEmpty(this.script.turns);

        return this.script;
    }

    addPlayer(player, minions) {
        let p = {};
        p['id'] = player.getName();

        let ms = new Array();

        minions.forEach(minion => {
            ms.push({
                id: minion.getId(),
                name: minion.getName(),
                portrait: minion.getPortrait(),
                attack: minion.getAttack(),
                health: minion.getHealth(),
                skills: minion.getSkills().map(s => s.getName())
            });

        });

        p['minions'] = ms;

        this.script.players.push(p);
    }

    nextTurn() {
        this.phases = {};
        this.script.turns.push(this.phases);
    }

    nextPhase(name) {
        this.phase = [];
        this.phases[name] = this.phase;
    }

    addAttack(attacker, defender) {
        this.phase.push({
            action: 'attack',
            id: attacker.getId(),
            targetId: defender.getId()
        });
    }

    addChange(minion, stat, value) {
        this.phase.push({
            action: 'change',
            id: minion.getId(),
            type: 'stat',
            stat: stat,
            value: value
        });
    }

    removeMinion(minion) {
        this.phase.push({
            action: 'remove',
            id: minion.getId()
        });
    }

    loseSkill(minion, name) {
        this.phase.push({
            action: 'change',
            id: minion.getId(),
            type: 'lose',
            skill: name
        });
    }
}
