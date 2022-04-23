
import { Context } from './context.js';
import { BattleScript, PHASE } from './transcript.js'
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

            this.bs.nextTurn();
            this.bs.nextPhase(PHASE.CHARGE);

            let possibleDefenders = this.applySkill(
                'choose-defender',
                defendPlayer,
                defendPlayer.getMinions(),
                null
            );

            let defendMinion = possibleDefenders[randomInt(possibleDefenders.length)];
            let defendSlot = defendPlayer.getSlot(defendMinion);
            let attackSlot = randomInt(attackPlayer.filledSlots());
            let attackMinion = attackPlayer.getMinionAtSlot(attackSlot);

            this.combat(attackPlayer, attackSlot, attackMinion, 
                defendPlayer, defendSlot, defendMinion);
            
            this.bs.nextPhase(PHASE.RESOLVE);
    
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

        let transcript = this.bs.fetchScript();

        let str = JSON.stringify(transcript);
        console.log("script: %s", str);
        return str;
    }

    combat(attackPlayer, attackSlot, attackMinion, defendPlayer, defendSlot, defendMinion) {

        console.log("start combat defendPlayer:%s, attackSlot:%i, defendSlot:%i",
            defendPlayer.getName(), attackSlot, defendSlot);

        attackPlayer.log();
        defendPlayer.log();

        this.bs.addAttack(attackMinion, defendMinion);
        this.bs.nextPhase(PHASE.HIT);

        let damage = this.applySkill(
            'calc-damage',
            defendPlayer,
            attackMinion.getAttack(),
            defendMinion
            );

        if (damage > 0) {
            defendMinion.takeDamage(damage);
            this.bs.addChange(defendMinion, "health", defendMinion.getHealth());
        }

        damage = this.applySkill(
            'calc-damage',
            attackPlayer,
            defendMinion.getAttack(),
            attackMinion
        );
        
        if (damage > 0) {
            attackMinion.takeDamage(damage);
            this.bs.addChange(attackMinion, "health", attackMinion.getHealth());
        }

        console.log('state after combat');
        attackPlayer.log();
        defendPlayer.log();

    }

    applySkill(phase, context, value, target) {
        let skills = context.getSkills(phase);

        skills = skills.filter(s => s.doesApply(target));

        if (skills.length > 0) {
            return skills[0].execute(value);
        }

        return value;
    }

}