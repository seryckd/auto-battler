export class Minion {

    static counter = 0;

    constructor(name, portrait, health, attack) {
        this.name = name;
        this.portrait = portrait;
        this.health = health;
        this.attack = attack;
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

    isDead() {
        return this.health < 1;
    }

    takeDamage(value) {
        this.health = this.health - value;
        return this.health > 0;
    }

    clone() {
        return new Minion(this.name, this.portrait, this.health, this.attack);
    }

    toString() {
        return "{"
            + "id:" + this.id
            + ",name:" + this.name
            + ",portrait:" + this.portrait
            + ",attack:" + this.attack
            + ",health:" + this.health
            + "}";
    }
}