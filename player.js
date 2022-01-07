import { Minion } from "./minion.js";
import { cloneClass } from "./utils.js";

export class Player {
    constructor(name, minionIds) {
        this.name = name;
        this.minionIds = minionIds;
    }

    getName() {
        return this.name;
    }

    getMinionIds() {
        return this.minionIds;
    }
    
    /*
    copyMinions() {
        let copy = [];
        this.minions.forEach((element,idx) => {
            console.log('copy', )
            copy.push(cloneClass(Minion.prototype, element));
        });
        return copy;
    }
    */
}