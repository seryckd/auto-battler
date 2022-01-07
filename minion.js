import { MinionDefs } from './minions-db.js'
export class Minion {

    static counter = 0;

    constructor(id) {
        this.defId = id;
        this.name = MinionDefs[id].name;
        this.portrait = MinionDefs[id].portrait;
        this.attack = MinionDefs[id].attack;
        this.health = MinionDefs[id].health;
        this.traits = Array.from(MinionDefs[id].traits);
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

    getTraits() {
        return this.traits;
    }

    hasTrait(trait) {
        return this.traits[trait] !== undefined;
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
            + ",traits:" + this.traits
            + "}";
    }
}