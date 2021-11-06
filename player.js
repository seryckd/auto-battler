import { Minion } from "./minion.js";
import { cloneClass } from "./utils.js";

export class Player {
    constructor(name, minions) {
        this.name = name;
        this.minions = minions;

        // hero power
        this.power = null;
    }

    getName() {
        return this.name;
    }

    getMinions() {
        return this.minions;
    }
    
    copyMinions() {
        let copy = [];
        this.minions.forEach(element => {
            copy.push(cloneClass(Minion.prototype, element));
        });
        return copy;
    }
}