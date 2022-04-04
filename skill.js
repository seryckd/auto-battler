
export class Skill {

    constructor(name, phase) {
        this.name = name;
        this.phase = phase;
    }

    static factory(name) {
        switch(name) {
            case 'wall': return new WallSkill();
            case 'shield': return new ShieldSkill();
            default: return undefined;
        }
    }

    getName() {
        return this.name;
    }

    getPhase() {
        return this.phase;
    }

    bind(context, minion) {
        this.context = context;
        this.minion = minion;
    }

    doesApply(minion) {

        if (minion === null) {
            return true;
        }

        return this.minion.getId() === minion.getId();
    }

    isEqual(target) {
        return this.name === target.name && target.minion.getId() === this.minion.getId();
    }

    log() {
        console.log("skill %s, phase:%s, context:%s min:%s(%s)", 
            this.name, this.phase, 
            this.context.getName(),
            this.minion.getName(), this.minion.getId());
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

        // The skill disappears after use
        this.context.loseMinionSkill(this.minion, this);

        // all damage is abosrbed by the shield
        return 0;
    }
}