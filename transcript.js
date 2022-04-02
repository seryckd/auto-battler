import { Player } from './player.js'
import { Minion } from './minion.js'


export class BattleScript {
    constructor() {
        this.script = {
            players: [],
            combat: []
        };
        this.combat = null;
    }

    fetchScript() {
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

    startCombat() {
        this.combat = {
            changes: []
        }
        this.script.combat.push(this.combat);
    }

    addAttack(attacker, defender) {
        this.combat.changes.push({
            action: 'attack',
            id: attacker.getId(),
            targetId: defender.getId()
        });
    }

    addChange(minion, stat, value) {
        this.combat.changes.push({
            action: 'change',
            id: minion.getId(),
            stat: stat,
            value: value
        });
    }

    removeMinion(minion) {
        this.combat.changes.push({
            action: 'remove',
            id: minion.getId()
        });
    }
}
