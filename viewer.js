export class Viewer {

    constructor(scriptObj) {
        this.tray1 = scriptObj.players[0];
        this.tray2 = scriptObj.players[1];
        this.turns = scriptObj.turns;

        this.setup(this.tray1.minions, 'tray1');
        this.setup(this.tray2.minions, 'tray2');

        this.turnCount = -1;
        this.attackContext = {};

        this.phases = [ 'charge', 'hit', 'resolve' ];
        this.phaseIdx = -1;
    }

    setup(minions, trayId) {
        let tray = document.getElementById(trayId);
        minions.forEach(element => {
            tray.appendChild(this.createMinion(element));
        });
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
                animations = this.createAnimations('charge');
                break;
            }
            case 'hit': {
                animations = this.createAnimations('hit');
                break;
            }
            case 'resolve': {
                animations = this.createAnimations('resolve');

                // retreat animation
                animations.push(
                    this.retreatAnimation(
                        this.attackContext.minion, 
                        this.attackContext.delta.dX, 
                        this.attackContext.delta.dY)
                );
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

    createAnimations(scriptPhase) {

        let animations = [];

        let actions = this.turns[this.turnCount][scriptPhase];

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
                default: {
                    console.assert(true, 'Unknown action %s', a.action);
                }
            }
        });

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
            minion.classList.remove(action.skill);
            return null;
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

        min.classList.add('base');

        if (minion.skills.find(e => e === 'wall')) {
            min.classList.add('wall');
        }

        if (minion.skills.find(e => e === 'shield')) {
            min.classList.add('shield');
        }

        min.id = this.makeDomId(minion.id);

        min.innerHTML = `
            <div class="name" id="${min.id}">
                <svg class="name" width="60" height="60">
                    <use href="#${minion.portrait}"/>
                </svg>
            </div>
            <div class="attack">${minion.attack}</div>
            <div class="health">${minion.health}</div>
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

    damageAnimation(element, newValue) {

        element.innerText = newValue;

        return element.animate(
            [
                {
                    color: 'blue'
                },
                {
                    color: 'black'
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

