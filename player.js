/**
 * 
 */
export class Player {
    constructor(name, minionIds) {
        this.name = name;
        this.startingMinions = minionIds;
    }

    getStartingMinionIds() {
        return this.startingMinions;
    }

    getName() {
        return this.name;
    }
}