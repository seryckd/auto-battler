
export const SKILL_TYPE = {
    SELECT_DEFENDER: 'select-defender',
    MINION_DEATH: 'minion-death',
    MINION_DAMAGE: 'minion-damage',
    EVENT_LISTENER: 'event-listener'
};

export class Skill {

    constructor(name, type, minion) {
        this.name = name;
        this.type = type
        this.minion = minion;
    }

    static registry = {}

    static register(skill, ctor) {
        Skill.registry[skill] = ctor;
    }

    static factory(name, minion) {
        let ctor = Skill.registry[name];

        console.assert(ctor !== undefined, "Unknown skill '%s'", name);

        return new ctor(minion);
    }

    getName() {
        return this.name;
    }

    getType() {
        return this.type;
    }

    getContext() {
        return this.minion.getContext();
    }

    doesApply(minion) {

        if (minion === null) {
            return true;
        }

        console.assert(this.minion, 'skill is not associated with a minion');

        return this.minion.getId() === minion.getId();
    }

    isEqual(target) {
        return this.name === target.name && target.minion.getId() === this.minion.getId();
    }

    log() {
        console.log("skill %s, type:%s, context:%s min:%s(%s)", 
            this.name, this.type, 
            this.context.getName(),
            this.minion.getName(), this.minion.getId());
    }

    execute(battle, param) {
        return param;
    }
}

class WallSkill extends Skill {

    static NAME = 'wall';

    constructor(minion) {
        super(WallSkill.NAME, SKILL_TYPE.SELECT_DEFENDER, minion);
    }

    /**
     * Only return the minions with 'wall' skill
     * 
     * @param {*} o An array of minions 
     */
     execute(battle, minions) {

        return minions.filter(m => {
            return m.hasSkill(WallSkill.NAME)
        });
    }
}
class ShieldSkill extends Skill {

    static NAME = 'shield';

    constructor(minion) {
        super(ShieldSkill.NAME, SKILL_TYPE.MINION_DAMAGE, minion);
    }

    /**
     * Shield negates all damage, but shield is removed 
     * from this minion
     * 
     * @param {*} amount of damage
     */
     execute(battle, damage) {
        let self = this;
        battle.removeMinionSkill(this.minion, self);

        // all damage is abosrbed by the shield
        return 0;
    }
}

class SummonSkill extends Skill {

    static NAME = 'summon';

    constructor(minion) {
        super(SummonSkill.NAME, SKILL_TYPE.MINION_DEATH, minion);
    }

    /**
     * 
     * @param {array} actionStack array of actions
     */
    execute(battle) {

        let min = this.getContext().addMinionId('004');

        // Minions can only be summoned if there is room on
        // the board or they are lost
        if (min != null) {
            battle.bs.summonMinion(min.getContext().getName(), min);
        }
    }
}

Skill.register(WallSkill.NAME, WallSkill);
Skill.register(SummonSkill.NAME, SummonSkill);
Skill.register(ShieldSkill.NAME, ShieldSkill);
