import { Minion } from "./minion.js";

export class Player {
    constructor(name, minionIds) {
        this.name = name;
        this.startingMinions = minionIds;

        this.reset();
    }

    reset() {
        this.positions = [];
        this.minions = new Map();

        this.startingMinions.forEach(id => {
            var min = new Minion(id);

            this.minions.set(min.getId(), min);
            this.positions.push(min);
        });
    }

    getName() {
        return this.name;
    }

    getMinions() {
        const view = [];
        for (let v of this.minions.values()) {
            view.push(v)
        }
        return view;
    }

    /**
     * 0 offset
     * @param {int} pos 
     * @returns {Minion}
     */
    getMinionAtPosition(pos) {
        return this.positions[pos];
    }

    /**
     * 0 offset
     * @param {int} pos 
     */
    removeMinionAtPosition(pos) {
        this.positions.splice(pos, 1);
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
        console.log("player: %s, positions: $o, minions: $o", this.name, this.positions, this.minions);
    }
}