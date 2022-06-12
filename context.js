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

    /**
     * Adds a new minion to the end of the slot if there is room
     * 
     * @param {*} id 
     * @returns added minion or null
     */
    addMinionId(id, slot) {

        if (this.filledSlots() < 5) {
            let min = new Minion(id, this);

            if (slot === undefined) {
                this.slots.push(min);
            } else {
                this.slots.splice(slot, 0, min);
            }
            return min;
        }

        return null;
    }

    /**
     * Remove the minion and return the slot it was in.
     * 
     * @param {*} min 
     * @returns 
     */
    removeMinion(min) {
        var slot = this.getSlot(min);
        this.slots.splice(slot, 1);
        return slot;
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

        let minions = minion === undefined ?
            this.getMinions() : [ minion ];

        minions.forEach(m => {
            m
                .getSkills()
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