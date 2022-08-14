
import { Context } from './context.js';
import { SKILL_TYPE } from './skill.js';
import { BattleScript, TRANSCRIPT_PHASE } from './transcript.js'
import { randomInt } from './utils.js'

/**
 * Battle Engine. Executes a battle between two players and outputs
 * the result to a BattleScript.
 */
export class Battler {

    constructor(p1, p2) {
        this.players = [ p1, p2 ];

        this.contexts = [];
        this.attackPlayer = {};
        this.defendPlayer = {};
    }

    battle() {

        this.bs = new BattleScript();
        this.actionQueue = [];

        this.contexts = [ 
            new Context(this.players[0], this.bs),
            new Context(this.players[1], this.bs)
        ];

        const startPlayer = randomInt(2);

        this.attackPlayer = this.contexts[startPlayer];
        this.defendPlayer = this.contexts[1-startPlayer];

        while(this.attackPlayer.hasMinions() && this.defendPlayer.hasMinions())
        {
            console.log('start turn defendPlayer: %s', this.defendPlayer.getName());

            this.addAction('prepare', (battle) => {battle.prepareAction()})

            while(this.actionQueue.length > 0) {
                let action = this.actionQueue.shift();

                console.log('about to execute action: %s', action.name);
                
                action.callback(this);
            }

            let tmp = this.attackPlayer;
            this.attackPlayer = this.defendPlayer;
            this.defendPlayer = tmp;
        }

        let winner = this.attackPlayer.hasMinions() ? this.attackPlayer : this.defendPlayer;
        
        console.log('winner %o', winner);

        let transcript = this.bs.fetchScript();

        let str = JSON.stringify(transcript);
        console.log("script: %s", str);
        return str;
    }

    /**
     * Select the attacker and defender
     */
    prepareAction() {

        let possibleDefenders = this.filterDefenders(
            this.defendPlayer,
            this.defendPlayer.getMinions()
        );

        let defendMinion = possibleDefenders[randomInt(possibleDefenders.length)];
        let defendSlot = this.defendPlayer.getSlot(defendMinion);

        let attackSlot = this.attackPlayer.getNextAttackSlot();
        let attackMinion = this.attackPlayer.getMinionAtSlot(attackSlot);

        this.addAction('attack', (battle) => {
            battle.attackAction(defendSlot, defendMinion, attackSlot, attackMinion)
        })
    }

    /**
     * Actions that occur after selection, but before combat.
     * 
     * @param {*} defendSlot 
     * @param {*} defendMinion 
     * @param {*} attackSlot 
     * @param {*} attackMinion 
     */
    attackAction(defendSlot, defendMinion, attackSlot, attackMinion) {

        this.bs.addAttack(attackMinion, defendMinion);

        this.addAction('combat', (battle) => {
            battle.combatAction(defendSlot, defendMinion, attackSlot, attackMinion);
        })
    }

    /**
     * Actiosn that occur as a result of combat between minions.
     * 
     * @param {*} defendSlot 
     * @param {*} defendMinion 
     * @param {*} attackSlot 
     * @param {*} attackMinion 
     */
    combatAction(defendSlot, defendMinion, attackSlot, attackMinion) {

        console.log("combat defendPlayer:%s, attackSlot:%i, defendSlot:%i, attackMinion: %s, defendMinion: %s",
            this.defendPlayer.getName(), attackSlot, defendSlot, attackMinion.toString(), defendMinion.toString());

        this.attackPlayer.log();
        this.defendPlayer.log();

        this.addAction('applyDamage', (battle) => {
            battle.applyDamageAction(
                this.attackPlayer, attackSlot, attackMinion, 
                this.calculateAttack(defendMinion))
        });

        this.addAction('applyDamage', (battle) => {
            battle.applyDamageAction(
                this.defendPlayer, defendSlot, defendMinion, 
                this.calculateAttack(attackMinion))
        });
    }

    /**
     * Apply damage to a minion and kill it if required
     * 
     * @param {*} player 
     * @param {*} slot 
     * @param {*} minion 
     * @param {*} reqestedDamage -1 is instant kill, 0 is no damage, +ve is amount of damage taken
     */
    applyDamageAction(player, slot, minion, reqestedDamage) {

        let actualDamage = this.modifyDamage(
            player,
            minion,
            reqestedDamage
            );

        if (actualDamage < 0) {
            // instant kill
            console.log('instant kill');
            minion.takeDamage(minion.getHealth());
            this.bs.addChange(minion, "health", minion.getHealth());
        }

        if (actualDamage > 0) {
            minion.takeDamage(actualDamage);
            this.bs.addChange(minion, "health", minion.getHealth());

        }

        if (minion.isDead()) {
            this.addAction('removeMinion', (battle) => {
                let slot = player.removeMinion(minion);
                battle.bs.removeMinion(minion);
                battle.triggerMinionDeath(player, minion, slot);
            });
        }
    }

    /**
     * Helper function that can be called from Skills module
     * 
     * @param {*} minion 
     * @param {*} skill 
     */
    removeMinionSkill(minion, skill) {
        console.log("lose skill:%s minion:%s", skill.getName(), minion.getId());
        minion.loseSkill(skill.getName());
        this.bs.loseSkill(minion, skill.getName());
    }

    // ------------------------------------------------------------------------

    filterDefenders(context, value) {
        let skills = context.getSkills(SKILL_TYPE.SELECT_DEFENDER);

        skills.forEach(s => value = s.execute(this, value));

        return value;
    }

    /**
     * apply to skills that are listening
     * -- not implemented --
     * @param {*} name 
     */
    fireEvent(context, name, value) {
        let self = this;
        let skills = context.getSkills(EVENT_LISTENER);
        // filter on the event name
        skills.forEach(s => self.addAction('listener-skill', (battle) => s.execute(this, value)));
    }

    /**
     * minion skills to be triggered at death
     * @param {*} name 
     * @param {*} minion 
     */
    triggerMinionDeath(context, minion, slot) {
        let self = this;
        let skills = context.getSkills(SKILL_TYPE.MINION_DEATH, minion);

        skills.forEach(
            s => self.addAction(
                'death-skill', (battle) => s.execute(this, slot)));
    }

    /**
     * Return the attack done by the minion
     * 
     * @param {*} minion attack minion
     * @returns attack damage, -1 is instant kill, 0 is no damage, +ve is amount of damage
     */
    calculateAttack(minion) {
        let baseAttack = minion.getAttack();

        // Apply any modifiers
        let skills = minion.getContext().getSkills(SKILL_TYPE.MINION_ATTACK, minion);
 
        return (skills.length > 0) 
            ? skills[0].execute(this, baseAttack)
            : baseAttack;   
    }

    /**
     * apply damage modifiers 
     * @param {*} context 
     * @param {*} minion 
     * @param {*} damage 
     */
    modifyDamage(context, minion, damage) {
        let skills = context.getSkills(SKILL_TYPE.MINION_DAMAGE, minion);

        return (skills.length > 0) 
            ? skills[0].execute(this, damage)
            : damage; 
    }

    // ------------------------------------------------------------------------

    addAction(name, fn) {
        this.actionQueue.push({
            name: name,
            callback: fn
        });
    }

}