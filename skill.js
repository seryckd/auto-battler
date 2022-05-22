import { BATTLE_PHASE } from './battler.js'

export class Skill {

    constructor(name, phase, minion) {
        this.name = name;
        this.phase = phase;
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

    getPhase() {
        return this.phase;
    }

    bind(context) {
        this.context = context;
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

    static NAME = 'wall';

    constructor(minion) {
        super(WallSkill.NAME, BATTLE_PHASE.CHOOSE_DEFENDER, minion);
    }

    /**
     * 
     * @param {*} o An array of minions 
     */
     execute(minions) {
        // remove any that do not have wall

        return minions.filter(m => {
            return m.hasSkill(WallSkill.NAME)
        });
    }
}
class ShieldSkill extends Skill {

    static NAME = 'shield';

    constructor(minion) {
        super(ShieldSkill.NAME, BATTLE_PHASE.CALC_DAMAGE, minion);
    }

    /**
     * 
     * @param {*} amount of damage
     */
     execute(damage) {
        let ctx = this.context;
        let min = this.minion;
        let self = this;

        /*
        this.engine.pushAction(function() {
            // The skill disappears after use
            ctx.loseMinionSkill(min, self);
        });
        */
        ctx.loseMinionSkill(min, self);

        // all damage is abosrbed by the shield
        return 0;
    }
}

class SummonSkill extends Skill {

    static NAME = 'summon';

    constructor(minion) {
        super(SummonSkill.NAME, BATTLE_PHASE.MINION_DEATH, minion);
    }

    /**
     * 
     * @param {array} actionStack array of actions
     */
    execute(actionStack) {
        console.log('summon skill');
        /*
        actionStack.push({
            context: this.context,
            minionId: '004'
        });
        */
        this.context.addMinionId('004');
    }
}

Skill.register(WallSkill.NAME, WallSkill);
Skill.register(SummonSkill.NAME, SummonSkill);
Skill.register(ShieldSkill.NAME, ShieldSkill);
