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
    }

    setup(minions, trayId) {
        let tray = document.getElementById(trayId);
        minions.forEach(element => {
            tray.appendChild(this.createMinion(element));
        });
    }

    getTrayForPlayer(id) {
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
                animations.push(
                    this.retreatAnimation(
                        this.attackContext.minion, 
                        this.attackContext.delta.dX, 
                        this.attackContext.delta.dY)
                );
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

        let lastAnim = animations.pop();
        if (lastAnim !== undefined) {
            let existingOnFinish = lastAnim.onfinish;
            lastAnim.onfinish = function() {
                if (existingOnFinish !== null) {
                    existingOnFinish();
                }
                self.nextPhase();
            }
        } else {
            this.nextPhase();
        }
    }

    createAnimationGroup(scriptPhase) {

        let animations = [];

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
                        animations.push(this.actionSummon(a));
                        break;
                    }
                    default: {
                        console.assert(true, 'Unknown action %s', a.action);
                    }
                }
            });
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
            minion: minion,
            delta: {
                dX: delta.dX,
                dY: delta.dY
            }
        };

        return this.attackAnimation(
            minion, 
            delta.dX, 
            delta.dY);
    }

    actionChange(action) {
        let minion = this.minionById(action.id);

        if (action.type === 'stat') {
            const attr = minion.getElementsByClassName(action.stat)[0];
            return this.damageAnimation(attr, action.value);
        } else {

            let elements = minion.getElementsByClassName(action.skill);

            let anim = this.removeShieldAnimation(elements[0]);

            anim.onfinish = function() {
                Array
                    .from(elements)
                    .forEach(e => e.remove());
            }

            return anim;
        }
    }

    actionRemove(action) {
        const self = this;
        const minion = this.minionById(action.id);
        let anim = this.deadAnimation(minion);

        anim.onfinish = function() {
            document
                .getElementById(self.makeDomId(action.id))
                .remove();
        };        
    }

    actionSummon(action) {

        // create the new minion
        let min = this.createMinion(action.minion);

        // find the right tray
        let pid = this.getTrayForPlayer(action.player);
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

        return this.summonAnimation(min);
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
        return document.getElementById(this.makeDomId(id));
    }

    elementsByClassName(root, className) {
        return root.getElementsByClassName(className);
    }

    makeDomId(id) {
        return 'min' + id;
    }

    createMinion(minion) {

        let min = document.createElement('div');
        min.classList.add('minion');
        min.id = this.makeDomId(minion.id);

        let modifiers = "";

        if (minion.skills.find(e => e === 'wall')) {
            modifiers += '<div class="wall"></div>';
        }

        if (minion.skills.find(e => e === 'shield')) {
            modifiers += '<div class="shield"></div>';
        }

        if (minion.skills.find(e => e === 'summon')) {
            modifiers += '<div class="death"></div>';
        }

        min.innerHTML = `
            <div class="image">
                <div class="background"></div>
                <svg class="portrait">
                    <use href="#${minion.portrait}"/>
                </svg>
                ${modifiers}
            </div>
            <div class="stats">
                <div class="attack">${minion.attack}</div>
                <div class="health">${minion.health}</div>
            </div>
        `;

        return min;
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

    attackAnimation(minion, x, y) {
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

    retreatAnimation(minion, x, y) {
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
     * @param {Integer} newValue 
     * @returns 
     */
    damageAnimation(element, newValue) {

        element.innerText = newValue;

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

    deadAnimation(minion) {
        return minion.animate([
            { opacity: '100%' },
            { opacity: '0%' }
        ], {
            duration: 500,
            fill: 'forwards',
            iterations: 1
        });
    }

    summonAnimation(minion) {
        return minion.animate([
            { transform: 'scale(0)' },
            { transform: 'scale(1)' }
        ], {
            duration: 500,
            iterations: 1
        });
    }

    /**
     * The shield falls away and vanishes
     * @param {Element} el 
     * @returns 
     */
    removeShieldAnimation(el) {
        return el.animate([
            {
                opacity: '100%'
            },
            {
                opacity: '0%',
                top: 10
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

