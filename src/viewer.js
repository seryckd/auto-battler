import * as util from './utils.js';
export class Viewer {

    constructor(scriptObj) {
        this.tray1 = scriptObj.players[0];
        this.tray2 = scriptObj.players[1];
        this.turns = scriptObj.turns;

        this.setup(this.tray1.minions, 'tray1');
        this.setup(this.tray2.minions, 'tray2');

        this.turnCount = -1;
        this.attackContext = {};

        this.phases = [ 'charge', 'hit', 'resolve', 'summon' ];
        this.phaseIdx = -1;
        this.phaseAnimations = [];
    }

    setup(minions, trayId) {
        let tray = document.getElementById(trayId);
        minions.forEach(element => {
            tray.appendChild(util.createMinion(element));
        });
    }

    getTrayIdForPlayer(id) {
        return (this.tray1.id == id) ? 'tray1' : 'tray2';
    }

    playAllTurns(onPlayFinishFn) {
        const self = this;
         
        this.onPlayFinishFn = onPlayFinishFn;
        this.onTurnFinishFn = self.nextTurn;

        this.turnCount = -1;
        this.phaseIdx = -1;

        this.nextTurn();        
    }

    playNextTurn(onPlayFinishFn) {
        this.onPlayFinishFn = onPlayFinishFn;
        this.onTurnFinishFn = onPlayFinishFn;

        this.nextTurn();
    }

    nextTurn() {
        this.turnCount++;

        if (this.turnCount >= this.turns.length) {
            console.log('All Turns Finished');
            this.onPlayFinishFn();
            return;
        }

        this.nextPhase();
    }

    nextPhase() {
        const self = this;
        let animations = [];
        let phaseName = this.phaseName();
        console.log('Turn: %s, Phase: %s', this.turnCount, phaseName);

        switch(phaseName) {
            case 'charge': {
                animations = this.createAnimationGroup('charge');
                break;
            }
            case 'hit': {
                animations = this.createAnimationGroup('hit');
                break;
            }
            case 'resolve': {
                animations = this.createAnimationGroup('resolve');

                // retreat animation
                if (this.attackContext != null) {
                    animations.push(
                        this.animationRetreat(
                            this.attackContext.minion, 
                            this.attackContext.delta.dX, 
                            this.attackContext.delta.dY)
                    );
                }
                break;
            }
            case 'summon': {
                animations = this.createAnimationGroup('summon');
                break;
            }
            case 'end': {
                this.onTurnFinishFn();
                return;
            }
            default: {
                console.assert(true, 'Unknown phase %s', phaseName);
            }
        }

        this.phaseAnimations = animations;

        // set default onfinish if not already set
        this.phaseAnimations.forEach(animation => {
            if (animation.onfinish == null) {
                animation.onfinish = () => self.finalizePhase();
            }
        });

        if (this.phaseAnimations.length == 0) {
            this.nextPhase();
        }
    }
   
    finalizePhase() {
        this.phaseAnimations.pop();

        if (this.phaseAnimations.length == 0) {
            this.nextPhase();
        }
    }
   

    createAnimationGroup(scriptPhase) {

        let self = this;
        let animations = [];
        let summons = { 'tray1':[], 'tray2': []};

        let actions = this.turns[this.turnCount][scriptPhase];

        if (actions !== undefined) {

            actions.forEach(a => {
                switch(a.action) {
                    case 'attack': {
                        console.log('Action: attack, id:%s, targetId:%s', a.id, a.targetId);
                        animations.push(this.actionAttack(a));
                        break;
                    }
                    case 'change': {
                        animations.push(this.actionChange(a));
                        break;
                    }
                    case 'remove': {
                        animations.push(this.actionRemove(a));
                        break;
                    }
                    case 'summon': {
                        let pid = this.getTrayIdForPlayer(a.player);
                        summons[pid].push(a);
                        break;
                    }
                    default: {
                        console.assert(true, 'Unknown action %s', a.action);
                    }
                }
            });

            let nextSummon = function(self, arrs) {

                let act = arrs.shift();
                let anim = self.actionSummon(act);

                if (arrs.length > 0) {
                    anim.onfinish = () => { nextSummon(self, arrs); }
                } else {
                    anim.onfinish = () => { self.finalizePhase(); }
                }

                return anim;
            };

            let sarray = summons['tray1'];
            if (sarray.length > 0) {
                animations.push(nextSummon(self, sarray));
            }

            let sarray2 = summons['tray2'];
            if (sarray2.length > 0) {
                animations.push(nextSummon(self, sarray2));
            }
        }

        return animations.filter(a => a !== null);
    }

    actionAttack(action) {
        let minion = this.minionById(action.id);
        let targetMinion = this.minionById(action.targetId)

        let delta = this.deltaToTarget(
            minion,
            targetMinion
            );

        this.attackContext = {
            id: action.id,
            minion: minion,
            delta: {
                dX: delta.dX,
                dY: delta.dY
            }
        };

        return this.animationAttack(
            minion, 
            delta.dX, 
            delta.dY);
    }

    actionChange(action) {
        let self=this;
        let minion = this.minionById(action.id);

        if (action.type === 'stat') {
            const attr = minion.getElementsByClassName(action.stat)[0];
            attr.innerText = action.value;
            return this.animationDamage(attr);

        } else {

            let elements = minion.getElementsByClassName(action.skill);

            let anim = this.animationRemoveShield(elements[0]);

            anim.onfinish = function() {
                Array
                    .from(elements)
                    .forEach(e => e.remove());

                self.finalizePhase();
            }

            return anim;
        }
    }

    actionRemove(action) {
        const self = this;
        const minion = this.minionById(action.id);

        console.log("remove id:%d", action.id);

        if (this.attackContext && this.attackContext.id == action.id) {
            this.attackContext = null;
        }

        let anim = this.animationDead(minion);

        anim.onfinish = function() {
            document
                .getElementById(util.makeDomId(action.id))
                .remove();

            self.finalizePhase();
        }; 
        
        return anim;
    }

    actionSummon(action) {

        // create the new minion
        let min = util.createMinion(action.minion);

        console.log("summon id:%d slot:%d", action.minion.id, action.slot);

        // find the right tray
        let pid = this.getTrayIdForPlayer(action.player);
        let tray = document.getElementById(pid);

        // insert new minion in the specified slot
        // 1. if the given slot exits then use 'insertAdjacentElement'
        // 2. if the given slot does not exist then use 'appendChild'

        let current = tray.firstElementChild;

        for(let i=0; i<action.slot; i++) {
            current = current.nextElementSibling;
            if (current == null) {
                break;
            }
        }

        if (current == null) {
            tray.appendChild(min);
        } else {
            current.insertAdjacentElement('beforebegin', min);
        }

        return this.animationSummon(min);
    }

    phaseName() {
        this.phaseIdx++;
        if (this.phaseIdx < this.phases.length) {
            return this.phases[this.phaseIdx];
        }
        this.phaseIdx = -1;
        return 'end';
    }

    minionById(id) {
        return document.getElementById(util.makeDomId(id));
    }

    elementsByClassName(root, className) {
        return root.getElementsByClassName(className);
    }

    deltaToTarget(sourceMin, targetMin) {

        const info = function(min) {
            console.assert(min !== null, 'null minion');
            const r = min.getBoundingClientRect();
            return {
                x: r.left + r.width/2,
                y: r.top + r.height/2,
                radius: Math.max(r.width, r.height)/2
            };    
        }

        // The source minion center moves towards the target minion center
        // but stops before it gets there

        const source = info(sourceMin);
        const target = info(targetMin);

        const bigX = target.x - source.x;
        const bigY = target.y - source.y;
        const bigH = Math.sqrt(bigX*bigX + bigY*bigY);
        const smallH = bigH - 1.5*target.radius;

        return {
            dX: smallH * (bigX/bigH),
            dY: smallH * (bigY/bigH)
        }
    }

    animationAttack(minion, x, y) {
        return minion.animate(
            [
                {
                    position: 'relative',
                    left: 0,
                    top: 0
                },
                {
                    position: 'relative',
                    left: `${x}px`,
                    top: `${y}px`
                }
                /*
                { transform: 'translate(0px, 0px)'},
                { transform: `translate(${x}px, ${y}px)` }
                */
            ], {
                duration: 400,
                fill: 'forwards',
                iterations: 1
            });
    }

    animationRetreat(minion, x, y) {
        return minion.animate(
            [
                {
                    position: 'relative',
                    left: `${x}px`,
                    top: `${y}px`
                },
                {
                    position: 'relative',
                    left: 0,
                    top: 0
                }
            ], {
                duration: 500,
                fill: 'forwards',
                iterations: 1
            })
    }

    /**
     * 
     * @param {Element} element 
     * @returns 
     */
    animationDamage(element) {

        return element.animate(
            [
                {
                    color: 'white'
                },
                {
                    color: 'black',
                    transform: 'scale(1.5)',
                    fontWeight: 'bold',
                    background: 'red',
                    fontSize: '18px'
                },
                {
                    transform: 'scale(1)'

                }
            ], {
                duration: 500,
                iterations: 1
            }
        );
    }

    animationDead(minion) {
        return minion.animate([
            { 
                opacity: '100%',
                filter: 'grayscale(10%)'
            },
            {
                opacity: '0%',
                transform: 'scale(3)',
                filter: 'grayscale(100%)'
            }
        ], {
            duration: 500,
            fill: 'forwards',
            iterations: 1
        });
    }

    animationSummon(minion) {
        return minion.animate([
            { 
                transform: 'scale(0.5)' 
            },
            { 
                transform: 'scale(1.5)' 
            },
            { 
                transform: 'scale(1)' 
            }
        ], {
            duration: 1000,
            iterations: 1
        });
    }

    /**
     * The shield falls away and vanishes
     * @param {Element} el 
     * @returns 
     */
    animationRemoveShield(el) {
        console.assert(el != undefined, 'animate remove shield');
        return el.animate([
            {
                opacity: '100%'
            },
            {
                opacity: '0%',
                // Chrome gives an error for a length type
                // 'invalid keyframe value for property top: 10'
                top: '20%',
                transform: 'rotate(25deg)'
            }
        ], {
            duration: 500,
            iterations: 1
        });
    }

    restartPlay() {
        // Returns a 'live' HTMLCollection (not an array)
        // Copy it so 
        //    1) we can use forEach 2
        //    2) it does not mutate as we remove elements
        Array
            .from(document.getElementsByClassName('minion'))
            .forEach(e => e.remove());

        this.turnCount = -1;
        this.phaseIdx = -1;
    }
}

