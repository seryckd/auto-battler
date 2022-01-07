
import { BattleScript } from './script.js'
import { Minion } from './minion.js';

class Tray {
    constructor(max) {
        this.max = max;
        this.slots = [];
    }

    add(minion) {
        if (this.slots.length >= this.max) {
            return false;
        }
        this.slots.push(minion);
        return true;
    }

    empty() {
        return this.slots.length === 0;
    }

    minions() {
        return this.slots;
    }

    randomAttackerSlot() {
        return Math.round(Math.random() * (this.slots.length - 1));
    }

    randomDefenderSlot() {
        return Math.round(Math.random() * (this.slots.length - 1));
    }

    minionAtSlot(n) {
        return this.slots[n];
    }

    removeSlot(i) {
        console.log('before remove', this.slots);
        this.slots.copyWithin(i, i+1);
        this.slots.pop();
        //this.slots.slice(i, 1);
        console.log('after remove', this.slots);
    }
}

class BattleContext {
    constructor(id, player) {
        this.id = id;
        this.tray = new Tray(7);

        player.getMinionIds().forEach(id => {
            this.tray.add(new Minion(id));
        });
    }

    getId() {
        return this.id;
    }

    hasMinions() {
        return !this.tray.empty();
    }

    minions() {
        return this.tray.minions();
    }

    randomAttackerSlot() {
        return this.tray.randomAttackerSlot();
    }

    randomDefenderSlot() {
        return this.tray.randomDefenderSlot();
    }

    minionAtSlot(n) {
        return this.tray.minionAtSlot(n)
    }

    removeSlot(i) {
        this.tray.removeSlot(i);
    }

    output() {
        let o = new Object();
        o['id'] = this.getId();

        this.tray.minions().forEach(m => {
            let om = new Object();
          
            om['name'] = m.getName();
            om['attack'] = m.getAttack();
            om['health'] = m.getHealth();
            om['traits'] = m.getTraits();
            
            //o['min' + i] = om;
        });

        console.log(JSON.stringify(o));
    }
}

export class Battler {

    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;        
    }

    battle() {

        this.context1 = new BattleContext(this.p1.getName(), this.p1);
        this.context2 = new BattleContext(this.p2.getName(), this.p2);

        this.bs = new BattleScript(
            this.p1, this.context1.minions(), 
            this.p2, this.context2.minions())

        let attackPlayer = this.context1;
        let defendPlayer = this.context2;

        console.log('start');

        while(attackPlayer.hasMinions() && defendPlayer.hasMinions())
        {
            let attackSlot = attackPlayer.randomAttackerSlot();
            let defendSlot = defendPlayer.randomDefenderSlot();

            let attackMinion = attackPlayer.minionAtSlot(attackSlot);
            let defendMinion = defendPlayer.minionAtSlot(defendSlot);
    
            console.log('attack', attackSlot, attackMinion);
            console.log('defend', defendSlot, defendMinion);

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

        this.bs.addAttack(attackMinion, defendMinion);

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