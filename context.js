import { Minion } from "./minion.js";

/**
 * Information about a player and their minsions during a battle. 
 */
export class Context {

    constructor(player, script) {

        this.player = player;
        this.script = script;

        this.slots = [];
        this.skills = new Map();

        this.player.getStartingMinionIds().forEach(id => {
            this.addMinionId(id);
        });

        this.script.addPlayer(this, this.getMinions());
    }

    getName() {
        return this.player.getName();
    }

    addMinionId(id) {
        let min = new Minion(id, this);
        this.slots.push(min);

        return min;
    }

    removeMinion(min) {
        var slot = this.getSlot(min);
        this.slots.splice(slot, 1);
    }

    /**
     * 
     * @returns {boolean}
     */
    hasMinions() {
        return this.filledSlots() > 0;
    }

    /**
     * Array of minions 
     * @returns {Array}
     */
    getMinions() {
        return this.slots;
    }

    /**
     * 0 offset
     * @param {int} pos 
     * @returns {Minion}
     */
     getMinionAtSlot(pos) {

        console.assert(pos>=0 | pos<=this.slots.length, 
            "pos %d out of range 0-%i", pos, this.slots.length);

        return this.slots[pos];
    }

    getSlot(minion) {

        const i = this.slots.indexOf(minion);
        console.assert(i != -1, "minion not found (%o)", minion);
        return i;
    }

    filledSlots() {
        return this.slots.length;
    }

 
    /**
     * Return the list of skills that match the given type
     * 
     * @param {} type 
     * @param {*} minion optional
     * @returns 
     */
    getSkills(type, minion) {

        let skills = [];

        minion = minion === undefined ? null : minion;

        this.getMinions().forEach(m => {

            m.getSkills()
                .filter(s => s.doesApply(minion))
                .filter(s => s.getType() === type)
                .forEach(s => skills.push(s));
        });

        return skills;
    }

    log() {
        console.groupCollapsed("player: %s, minions: %s", this.player.getName(), this.slots.length);
        this.slots.forEach((p, i) => console.log("%d %o", i, p));
        console.groupEnd();
    }
}