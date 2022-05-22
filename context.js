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

    addMinionId(id) {
        let min = new Minion(id);
        this.slots.push(min);

        this.registerSkills(min.getSkills(), min);

        return min;
    }

    removeMinion(min) {
        var slot = this.getSlot(min);
        this.slots.splice(slot, 1);

        this.unregisterSkills(min.getSkills());

        this.script.removeMinion(min);
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

 
    getSkills(phase) {
        let list = this.skills.get(phase);
        return (list === undefined) ? [] : list;
    }

    loseMinionSkill(minion, skill) {
        console.log("lose skill:%s minion:%s", skill.getName(), minion.getId());
        minion.loseSkill(name);
        this.unregisterSkills([skill]);
        this.script.loseSkill(minion, skill.getName());
    }

    log() {
        console.groupCollapsed("player: %s, minions: %s", this.player.getName(), this.slots.length);
        this.slots.forEach((p, i) => console.log("%d %o", i, p));
        console.groupEnd();
    }

    /**
     * private
     * @param {*} skills 
     */
    registerSkills(skills, minion) {
        skills.forEach(skill => {            
            skill.bind(this);

            let list = this.skills.get(skill.getPhase());
            if (list === undefined) {
                list = [];
                this.skills.set(skill.getPhase(), list);
            }
            list.push(skill);
        });
    }

    /**
     * private
     * @param {*} skills 
     */
    unregisterSkills(skills) {

        skills.forEach(skill => {
            let list = this.skills.get(skill.getPhase());
            list.splice(
                list.findIndex(s => s.isEqual(skill)), 
                1);
        });
    }

}