import { MinionDefs } from './minions-db.js'
import { Skill } from './skill.js'
export class Minion {

    static counter = 0;

    /**
     * Minion has a unique id, and knows which context it belongs to.
     * 
     * @param {*} defId the definitionId in the minions database
     * @param {*} context 
     */
    constructor(defId, context) {
        const self = this;
        this.defId = defId;
        this.context = context;
        this.name = MinionDefs[defId].name;
        this.portrait = MinionDefs[defId].portrait;
        this.attack = MinionDefs[defId].attack;
        this.health = MinionDefs[defId].health;

        this.skills = Array
            .from(MinionDefs[defId].skills)
            .map(s => Skill.factory(s, self));
        this.id = Minion.counter++;
    }

    getId() {
        return this.id;
    }

    getContext() {
        return this.context;
    }

    getName() {
        return this.name;
    }

    getPortrait() {
        return this.portrait;
    }

    getHealth() {
        return this.health;
    }

    getAttack() {
        return this.attack;
    }

    /**
     * An array of Skill objects
     * @returns {Array}
     */
    getSkills() {
        return this.skills;
    }

    loseSkill(name) {
        let idx = this.skills.findIndex(s => s.getName() == name);
        if (idx !== -1) {
            this.skills.splice(idx, 1);
        }
    }

    hasSkill(name) {
        let sl = this.skills.filter(s => {
            return s.getName() == name;
        });
        return sl.length > 0;
    }

    isDead() {
        return this.health < 1;
    }

    takeDamage(value) {
        this.health = this.health - value;
        return this.health > 0;
    }

    clone() {
        return new Minion(this.defId);
    }

    toString() {
        return "{"
            + "id:" + this.id
            + ",name:" + this.name
            + ",portrait:" + this.portrait
            + ",attack:" + this.attack
            + ",health:" + this.health
            + ",skills:" + this.skills.map(s => s.getName()).join()
            + "}";
    }
}