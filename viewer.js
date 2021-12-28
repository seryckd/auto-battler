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

    turn() {

        this.turnCount++;

        if (this.turnCount >= this.combat.length) {
            return false;
        }

        console.log('turn:', this.turnCount);

        this.actionCount = -1;
        this.actionContext = {};

        this.action();
    }

    action() {
        const me=this;
        let actions = this.combat[this.turnCount].changes;
        this.actionCount++;

        if (this.actionCount >= actions.length) {
            this.retreatAnimation(
                this.actionContext.minion, 
                this.actionContext.delta.dX, 
                this.actionContext.delta.dY)
                .onfinish = function() {
                    console.log('end of turn');
                }
            return;
        }
        
        let action = actions[this.actionCount];
        let minion = document.getElementById(this.makeDomId(action.id));

        console.log(action);

        switch(action.action) {
            case 'attack': {
                this.actionContext.minion = minion;

                this.actionContext.delta = this.deltaToTarget(
                    minion,
                    document.getElementById(this.makeDomId(action.targetId)));

                this.attackAnimation(
                    minion, 
                    this.actionContext.delta.dX, 
                    this.actionContext.delta.dY)
                    .onfinish = function() {
                        me.action();
                    };
                    
                break;
            }

            case 'change': {
                let attr = minion.getElementsByClassName(action.stat)[0];
                this.damageAnimation(attr, action.value)
                    .onfinish = function() {
                        me.action();
                    };
                break;
            }

            case 'remove': 
                this.deadAnimation(minion)
                    .onfinish = function() {
                        minion.remove();
                        me.action();    
                    }
                break;
        }
    }

    makeDomId(id) {
        return 'min' + id;
    }

    createMinion(minion) {

        let min = document.createElement('div');
        min.className = "minion";
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
                    color: 'white'
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
}

