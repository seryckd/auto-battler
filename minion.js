import { MinionDefs } from './minions-db.js'
import { Skill } from './skill.js'
export class Minion {

    static counter = 0;

    constructor(id) {
        this.defId = id;
        this.name = MinionDefs[id].name;
        this.portrait = MinionDefs[id].portrait;
        this.attack = MinionDefs[id].attack;
        this.health = MinionDefs[id].health;
        this.skills = Array
            .from(MinionDefs[id].skills)
            .map(s => Skill.factory(s));
        this.id = Minion.counter++;
    }

    getId() {
        return this.id;
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

    hasSkill(skill) {
        let sl = this.skills.filter(s => {
            return s.getName() == skill;
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
            + ",skills:" + this.skills
            + "}";
    }
}