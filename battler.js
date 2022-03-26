
import { Player } from './player.js'
import { BattleScript } from './script.js'
import { randomInt } from './utils.js'

export class Battler {

    constructor(p1, p2) {
        this.players = [ p1, p2 ]
    }

    battle() {

        this.players.forEach(p => p.reset());

        this.bs = new BattleScript(
            this.players[0], this.players[0].getMinions(), 
            this.players[1], this.players[1].getMinions())

        const startPlayer = randomInt(2);

        let attackPlayer = this.players[startPlayer];
        let defendPlayer = this.players[1-startPlayer];

        console.log('start');

        while(attackPlayer.hasMinions() && defendPlayer.hasMinions())
        {
            let attackSlot = randomInt(attackPlayer.numPositions());
            let defendSlot = randomInt(defendPlayer.numPositions());

            let attackMinion = attackPlayer.getMinionAtPosition(attackSlot);
            let defendMinion = defendPlayer.getMinionAtPosition(defendSlot);

            this.combat(attackPlayer, attackSlot, attackMinion, 
                defendPlayer, defendSlot, defendMinion);
    
            if (attackMinion.isDead()) {
                this.bs.removeMinion(attackMinion);
                attackPlayer.removeMinionAtPosition(attackSlot);
            }
            if (defendMinion.isDead()) {
                this.bs.removeMinion(defendMinion);
                defendPlayer.removeMinionAtPosition(defendSlot);
            }

            let tmp = attackPlayer;
            attackPlayer = defendPlayer;
            defendPlayer = tmp;
        }

        let winner = attackPlayer.hasMinions() ? attackPlayer : defendPlayer;
        
        console.log('winner %o', winner);

        console.log(this.bs.fetchScript());

        return JSON.stringify(this.bs.fetchScript());
    }

    combat(attackPlayer, attackSlot, attackMinion, defendPlayer, defendSlot, defendMinion) {

        this.bs.startCombat();

        console.log('start combat ' + ' attack:' + attackSlot + ' defend:' + defendSlot);
        attackPlayer.log();
        defendPlayer.log();

        this.bs.addAttack(attackMinion, defendMinion);

        let damage = attackMinion.getAttack();
        defendMinion.takeDamage(damage);
        this.bs.addChange(defendMinion, "health", defendMinion.getHealth());

        damage = defendMinion.getAttack();
        attackMinion.takeDamage(damage);
        this.bs.addChange(attackMinion, "health", attackMinion.getHealth());

        console.log('end combat');
        attackPlayer.log();
        defendPlayer.log();

    }

}