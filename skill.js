
export class Skill {

    constructor(name, phase) {
        this.name = name;
        this.phase = phase;
    }

    static factory(name) {
        switch(name) {
            case 'wall': return new WallSkill();
            default: return undefined;
        }
    }

    getName() {
        return this.name;
    }

    getPhase() {
        return this.phase;
    }

    execute(o) {
        return o;
    }
}

class WallSkill extends Skill {

    constructor() {
        super('wall', 'choose-defender');
    }

    /**
     * 
     * @param {*} o An array of minions 
     */
    execute(minions) {
        // remove any that do not have wall

        return minions.filter(m => {
            return m.hasSkill("wall")
        });
    }
}

class ShieldSkill extends Skill {

    constructor() {
        super('shield', 'calc-damage');
    }

    /**
     * 
     * @param {*} amount of damage
     */
    execute(damage) {

        // 

        // all damage is abosrbed by the shield
        return 0;
    }
}