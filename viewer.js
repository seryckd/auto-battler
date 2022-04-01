export class Viewer {

    constructor(scriptObj) {
        this.tray1 = scriptObj.players[0];
        this.tray2 = scriptObj.players[1];
        this.combat = scriptObj.combat;

        this.setup(this.tray1.minions, 'tray1');
        this.setup(this.tray2.minions, 'tray2');

        this.turnCount = -1;
        this.actionCount = 0;
        this.actionContext = {};
    }

    setup(minions, trayId) {
        let tray = document.getElementById(trayId);
        minions.forEach(element => {
            tray.appendChild(this.createMinion(element));
        });
    }

    play(playCallback) {
        const self = this;
        this.playCallback = playCallback;

        function turnFinish(isEnd) {
            if (!isEnd) {
                self.turn(turnFinish);
            } else {
                self.playCallback();
            }
        }

        this.turn(turnFinish);
    }

    turn(turnCallback) {
        const self = this;

        this.turnCount++;
        this.turnCallback = turnCallback;

        if (this.turnCount >= this.combat.length) {
            this.turnCallback(true);
            return;
        }

        this.actionCount = -1;
        this.actionContext = {};

        let action = this.combat[this.turnCount].changes[0];

        this.actionContext.minion = document.getElementById(this.makeDomId(action.id));
        console.assert(this.actionContext.minion != null, 
            "Minion %d not in dom", action.id);

        let targetMinion = document.getElementById(this.makeDomId(action.targetId));
        console.assert(this.actionContext.minion != null, 
            "Target Minion %d not in dom", action.targetId);

        console.log("start turn action=%o, min=%o", action, this.actionContext.minion);

        this.actionContext.delta = this.deltaToTarget(
            this.actionContext.minion,
            targetMinion
            );

        this.attackAnimation(
            this.actionContext.minion, 
            this.actionContext.delta.dX, 
            this.actionContext.delta.dY)
            .onfinish = function() {
                self.action('change');
            };
    }

    action(type) {
        const self = this;

        const typeMap = {
            'attack': 'attack',
            'change': 'change',
            'remove': 'remove',
            'end': 'remove'
        }

        let actions = this.combat[this.turnCount]
            .changes
            .filter(action => action.action === typeMap[type]);

        console.log("Turn: %i, Action: %s, Actions: %o, Changes:%o",
            this.turnCount, 
            type, 
            actions, 
            this.combat[this.turnCount].changes
            );

        switch(type) {

            case 'change': {
                let anim = null;
                actions.forEach((action, index) => {
                    const minion = document.getElementById(this.makeDomId(action.id));
                    const attr = minion.getElementsByClassName(action.stat)[0];
                    anim = this.damageAnimation(attr, action.value);
                });
                anim.onfinish = function() {
                    self.action('remove');
                };
                break;
            }

            case 'remove': {
                if (actions.length === 0) {
                    self.action('end');
                    return;
                }
                let anim = null;
                actions.forEach(action => {
                    const minion = document.getElementById(this.makeDomId(action.id));
                    anim = this.deadAnimation(minion);
                });
                anim.onfinish = function() {
                    actions.forEach(action => {
                        document
                            .getElementById(self.makeDomId(action.id))
                            .remove();
                    });
                    self.action('end');
                };
                break;
            }

            case 'end': {
                this.retreatAnimation(
                    this.actionContext.minion, 
                    this.actionContext.delta.dX, 
                    this.actionContext.delta.dY)
                    .onfinish = function() {
                        self.turnCallback(false);
                    }
                break;
            }
        }
    }

    makeDomId(id) {
        return 'min' + id;
    }

    createMinion(minion) {

        let min = document.createElement('div');
        min.classList.add('minion');

        if (minion.skills.find(e => e === 'wall')) {
            min.classList.add('wall');
        } else {
            min.classList.add('base');
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

    cleanAll() {
        // Returns a 'live' HTMLCollection (not an array)
        // Copy it so 
        //    1) we can use forEach 2
        //    2) it does not mutate as we remove elements
        Array
            .from(document.getElementsByClassName('minion'))
            .forEach(e => e.remove());
    }
}

