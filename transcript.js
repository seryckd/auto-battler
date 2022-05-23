import { Player } from './player.js'
import { Minion } from './minion.js'

/**
 * The battler script comprises of
 * 
 * Player Information
 * 
 * Starting Board Information
 * 
 * Turns
 * A turn comprises of
 * 1) selecting of attacker & defender
 * 2) changes to minions that occur as a result of combat
 * 3) changes to the board as a result of combat
 */

/**
 * The phases of a turn 
 */
export const TRANSCRIPT_PHASE = {
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
        this.phases = {
            'charge': [],
            'hit': [],
            'resolve': []
        };
        this.script.turns.push(this.phases);
    }

    /**
     * This automatically starts a new turn
     * 
     * @param {Minion} attacker 
     * @param {Minion} defender 
     */
    addAttack(attacker, defender) {
        this.nextTurn();

        this.phases[TRANSCRIPT_PHASE.CHARGE].push({
            action: 'attack',
            id: attacker.getId(),
            targetId: defender.getId()
        });
    }

    addChange(minion, stat, value) {
        this.phases[TRANSCRIPT_PHASE.HIT].push({
            action: 'change',
            id: minion.getId(),
            type: 'stat',
            stat: stat,
            value: value
        });
    }

    removeMinion(minion) {
        this.phases[TRANSCRIPT_PHASE.RESOLVE].push({
            action: 'remove',
            id: minion.getId()
        });
    }

    loseSkill(minion, name) {
        this.phases[TRANSCRIPT_PHASE.HIT].push({
            action: 'change',
            id: minion.getId(),
            type: 'lose',
            skill: name
        });
    }
}
