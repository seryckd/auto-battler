
import { Player } from './player.js'
import { BattleScript } from './script.js'
import { randomInt } from './utils.js'

export class Battler {

    constructor(p1, p2) {
        this.players = [ p1, p2 ]
        this.activeSkills = new Map();
    }

    battle() {

        this.activeSkills.clear();
        this.players.forEach(p => {
            p.reset();
            p.getStartingMinions().forEach(m => {
                this.addMinion(p, m);
            });
        });

        this.bs = new BattleScript(
            this.players[0], this.players[0].getMinions(), 
            this.players[1], this.players[1].getMinions())

        const startPlayer = randomInt(2);

        let attackPlayer = this.players[startPlayer];
        let defendPlayer = this.players[1-startPlayer];

        while(attackPlayer.hasMinions() && defendPlayer.hasMinions())
        {
            console.log('start turn defendPlayer: %s', defendPlayer.getName());

            let possibleDefenders = defendPlayer.getMinions();

            console.log(possibleDefenders);

            let skills = this.getSkills(defendPlayer, 'choose-defender');

            if (skills.length > 0) {
                possibleDefenders = skills[0].execute(possibleDefenders);
            }

            console.log(possibleDefenders);

            let defendMinion = possibleDefenders[randomInt(possibleDefenders.length)];
            let defendSlot = defendPlayer.getSlot(defendMinion);
            let attackSlot = randomInt(attackPlayer.numPositions());
            let attackMinion = attackPlayer.getMinionAtPosition(attackSlot);

            this.combat(attackPlayer, attackSlot, attackMinion, 
                defendPlayer, defendSlot, defendMinion);
    
            if (attackMinion.isDead()) {
                this.removeMinion(attackPlayer, attackMinion);
            }
            if (defendMinion.isDead()) {
                this.removeMinion(defendPlayer, defendMinion);
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

    addMinion(player, id) {
        let minion = player.addMinion(id);
        minion.getSkills().forEach(s => this.registerSkill(player, s));
    }

    removeMinion(player, minion) {
        this.bs.removeMinion(minion);
        player.removeMinion(minion);
        minion.getSkills().forEach(s => this.unRegisterSkill(player, s));
    }

    getSkills(player, phase) {
        let list = this.activeSkills.get(player.getName() + "_" + phase);

        if (list === undefined) {
            list = [];
        }
        return list;
    }

    registerSkill(player, skill) {   
        const phase = player.getName() + "_" + skill.getPhase();
        let list = this.activeSkills.get(phase);
        if (list === undefined) {
            list = [];
            this.activeSkills.set(phase, list);
        }
        list.push(skill);
    }

    unRegisterSkill(player, skill) {
        const phase = player.getName() + "_" + skill.getPhase();
        let list = this.activeSkills.get(phase);
        list.splice(list.indexOf(skill), 1);
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