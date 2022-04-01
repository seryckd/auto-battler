import { Minion } from "./minion.js";

export class Player {
    constructor(name, minionIds) {
        this.name = name;
        this.startingMinions = minionIds;

        this.reset();
    }

    reset() {
        this.positions = [];
    }

    getStartingMinions() {
        return this.startingMinions;
    }

    addMinion(id) {
        let min = new Minion(id);
        this.positions.push(min);
        return min;
    }

    removeMinion(min) {
        var slot = this.getSlot(min);
        this.positions.splice(slot, 1);
    }

    getName() {
        return this.name;
    }

    /**
     * Array of minions 
     * @returns {Array}
     */
    getMinions() {
       return this.positions;
    }

    /**
     * 0 offset
     * @param {int} pos 
     * @returns {Minion}
     */
    getMinionAtPosition(pos) {

        console.assert(pos>=0 | pos<=this.positions.length, 
            "pos %d out of range 0-%i", pos, this.positions.length);

        return this.positions[pos];
    }

    getSlot(minion) {

        const i = this.positions.indexOf(minion);
        console.assert(i != -1, "minion not found (%o)", minion);
        return i;
    }

    /**
     * 
     * @returns {boolean}
     */
    hasMinions() {
        return this.numPositions() > 0;
    }

    /**
     * 0 - empty
     * @returns {int}
     */
    numPositions() {
        return this.positions.length;
    }


    log() {
        console.groupCollapsed("player: %s, minions: %s", this.name, this.positions.length);
        this.positions.forEach((p, i) => console.log("%d %o", i, p));
        console.groupEnd();
    }
}