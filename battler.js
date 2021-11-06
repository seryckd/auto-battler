
import { Player } from './player.js'
import { Slots } from './utils.js'
import { BattleScript } from './script.js'


class BattleContext {
    constructor(id, player) {
        this.id = id;
        this.slots = new Slots(7);

        player.getMinions().forEach(element => {
            this.slots.add(element.clone());
        });
    }

    getId() {
        return this.id;
    }

    hasMinions() {
        return this.slots.count() > 0;
    }

    minions() {
        return this.slots.all().filter(mins => mins !== null);
    }

    randomSlot() {
        return Math.round(Math.random() * (this.slots.count() - 1));
    }

    minionAtSlot(n) {
        return this.slots.fetch(n)
    }

    removeSlot(i) {
        //delete this.slots[i];

        this.slots.removePos(i);
    }

    output() {
        let o = new Object();
        o['id'] = this.getId();
        for(var i=0; i<this.slots.count(); i++) {
            let om = new Object();
          
            let m = this.slots.fetch(i);
            om['name'] = m.getName();
            om['attack'] = m.getAttack();
            om['health'] = m.getHealth();
            
            o['min' + i] = om;
        }

        console.log(JSON.stringify(o));
    }
}

export class Battler {

    constructor(p1, p2) {

        this.context1 = new BattleContext(p1.getName(), p1);
        this.context2 = new BattleContext(p2.getName(), p2);

        console.log(this.context2.minions());
        
        this.bs = new BattleScript(p1, this.context1.minions(), p2, this.context2.minions())
    }

    battle() {

        let attackPlayer = this.context1;
        let defendPlayer = this.context2;

        console.log('start');

        while(attackPlayer.hasMinions() && defendPlayer.hasMinions())
        {

            let attackSlot = attackPlayer.randomSlot();
            let defendSlot = defendPlayer.randomSlot();

            let attackMinion = attackPlayer.minionAtSlot(attackSlot);
            let defendMinion = defendPlayer.minionAtSlot(defendSlot);

    
            this.combat(attackPlayer, attackSlot, attackMinion, 
                defendPlayer, defendSlot, defendMinion);
    
            if (attackMinion.isDead()) {
                this.bs.removeMinion(attackMinion);
                attackPlayer.removeSlot(attackSlot);
            }
            if (defendMinion.isDead()) {
                this.bs.removeMinion(defendMinion);
                defendPlayer.removeSlot(defendSlot);
            }

            let tmp = attackPlayer;
            attackPlayer = defendPlayer;
            defendPlayer = tmp;
        }

        let winner = attackPlayer.hasMinions() ? attackPlayer : defendPlayer;
        
        console.log('winner', winner);

        console.log(this.bs.fetchScript());

        return JSON.stringify(this.bs.fetchScript());
    }

    combat(attackPlayer, attackSlot, attackMinion, defendPlayer, defendSlot, defendMinion) {

        this.bs.startCombat();

        console.log('start combat ' + ' attack:' + attackSlot + ' defend:' + defendSlot);
        attackPlayer.output();
        defendPlayer.output();

        let damage = attackMinion.getAttack();
        defendMinion.takeDamage(damage);
        this.bs.addChange(defendMinion, "health", defendMinion.getHealth());

        damage = defendMinion.getAttack();
        attackMinion.takeDamage(damage);
        this.bs.addChange(attackMinion, "health", attackMinion.getHealth());

        console.log('end combat');
        attackPlayer.output();
        defendPlayer.output();

    }

}