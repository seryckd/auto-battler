
import { Context } from './context.js';
import { SKILL_TYPE } from './skill.js';
import { BattleScript, TRANSCRIPT_PHASE } from './transcript.js'
import { randomInt } from './utils.js'

export const PLAYERS = {
    PLAYER_1: 0,
    PLAYER_2: 1
};

/**
 * Battle Engine. Executes a battle between two players and outputs
 * the result to a BattleScript.
 */
export class Battler {

    /**
     * 
     * @param {Context} p1 Player 1
     * @param {Context} p2 Player 2
     */
    constructor(p1, p2) {
        this.players = [ p1, p2 ];

        this.contexts = [];
        this.attackPlayer = {};
        this.defendPlayer = {};

        this.stats = {};
    }

    battle() {

        // select a random player
        this.init(randomInt(2))

        while(this.turn()) {
            this.flipRoles();
        }

        let winner = this.attackPlayer.hasMinions() ? this.attackPlayer : this.defendPlayer;
        
        console.log('winner %o', winner);

        let str = this.fetchTranscript();

        console.log("script: %s", str);

        return str;
    }

    // ------------------------------------------------------------------------
    // helper functions for testing

    /**
     * 
     * @param {PLAYERS} startPlayer must be 0 or 1
     */
    init(startPlayer) {

        console.assert(startPlayer==0 || startPlayer==1, 'startPlayer must be 0 or 1');

        this.bs = new BattleScript();
        this.actionQueue = [];

        this.stats = {
            numTurns: 0
        };

        this.contexts = [ 
            new Context(this.players[0], this.bs),
            new Context(this.players[1], this.bs)
        ];

        this.attackPlayer = this.contexts[startPlayer];
        this.defendPlayer = this.contexts[1-startPlayer];
    }

    /**
     * 
     * @returns true if a turn occurred; false if no minions
     */
    turn() {

        if (!(this.attackPlayer.hasMinions() && this.defendPlayer.hasMinions())) {
            return false;
        }

        this.turnActions();
        
        this.stats.numTurns++;

        return true;
    }

    turnActions() {
        console.log('start turn defendPlayer: %s', this.defendPlayer.getName());

        this.addAction('prepare', (battle) => {battle.prepareAction()})

        while(this.actionQueue.length > 0) {
            let action = this.actionQueue.shift();

            console.log('about to execute action: %s', action.name);
            
            action.callback(this);
        }
    }

    fetchTranscript() {
        return JSON.stringify(this.bs.fetchScript());
    }

    /**
     * Switch the attacker and defender roles
     */
     flipRoles() {
        let tmp = this.attackPlayer;
        this.attackPlayer = this.defendPlayer;
        this.defendPlayer = tmp;
    }

    state() {
        return {
            turnNum: this.stats.numTurns,
            player1Mins: this.contexts[0].getMinions(),
            player2Mins: this.contexts[1].getMinions()
        }
    }

    // ------------------------------------------------------------------------

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