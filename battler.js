
import { Context } from './context.js';
import { BattleScript } from './transcript.js'
import { randomInt } from './utils.js'

export class Battler {

    constructor(p1, p2) {
        this.players = [ p1, p2 ]
    }

    battle() {

        this.bs = new BattleScript();

        this.contexts = [ 
            new Context(this.players[0], this.bs),
            new Context(this.players[1], this.bs)
        ];

        const startPlayer = randomInt(2);

        let attackPlayer = this.contexts[startPlayer];
        let defendPlayer = this.contexts[1-startPlayer];

        while(attackPlayer.hasMinions() && defendPlayer.hasMinions())
        {
            console.log('start turn defendPlayer: %s', defendPlayer.getName());

            let possibleDefenders = defendPlayer.getMinions();

            console.log(possibleDefenders);

            let skills = defendPlayer.getSkills('choose-defender');

            if (skills.length > 0) {
                possibleDefenders = skills[0].execute(possibleDefenders);
            }

            console.log(possibleDefenders);

            let defendMinion = possibleDefenders[randomInt(possibleDefenders.length)];
            let defendSlot = defendPlayer.getSlot(defendMinion);
            let attackSlot = randomInt(attackPlayer.filledSlots());
            let attackMinion = attackPlayer.getMinionAtSlot(attackSlot);

            this.combat(attackPlayer, attackSlot, attackMinion, 
                defendPlayer, defendSlot, defendMinion);
    
            if (attackMinion.isDead()) {
                attackPlayer.removeMinion(attackMinion);
            }
            if (defendMinion.isDead()) {
                defendPlayer.removeMinion(defendMinion);
            }

            let tmp = attackPlayer;
            attackPlayer = defendPlayer;
            defendPlayer = tmp;
        }

        let winner = attackPlayer.hasMinions() ? attackPlayer : defendPlayer;
        
        console.log('winner %o', winner);

        console.log("script: %o", this.bs.fetchScript());

        return JSON.stringify(this.bs.fetchScript());
    }

    combat(attackPlayer, attackSlot, attackMinion, defendPlayer, defendSlot, defendMinion) {

        this.bs.startCombat();

        console.log("start combat defendPlayer:%s, attackSlot:%i, defendSlot:%i",
            defendPlayer.getName(), attackSlot, defendSlot);

        attackPlayer.log();
        defendPlayer.log();

        this.bs.addAttack(attackMinion, defendMinion);

        let damage = attackMinion.getAttack();

        defendMinion.takeDamage(damage);
        this.bs.addChange(defendMinion, "health", defendMinion.getHealth());

        damage = defendMinion.getAttack();
        attackMinion.takeDamage(damage);
        this.bs.addChange(attackMinion, "health", attackMinion.getHealth());

        console.log('state after combat');
        attackPlayer.log();
        defendPlayer.log();

    }

}