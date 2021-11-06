export class Minion {

    static counter = 0;

    constructor(name, health, attack) {
        this.name = name;
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
        return new Minion(this.name, this.health, this.attack);
    }

    toString() {
        return "{"
            + "id:" + this.id
            + ",name:" + this.name
            + ",attack:" + this.attack
            + ",health:" + this.health
            + "}";
    }
}