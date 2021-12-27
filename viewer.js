export class Viewer {

    constructor(scriptObj) {
        this.tray1 = scriptObj.players[0];
        this.tray2 = scriptObj.players[1];
        this.combat = scriptObj.combat;

        this.setup(this.tray1.minions, 'tray1');
        this.setup(this.tray2.minions, 'tray2');

        this.turnCount = 0;
        this.actionCount = 0;
    }

    setup(minions, trayId) {
        let tray = document.getElementById(trayId);
        minions.forEach(element => {
            tray.appendChild(this.createMinion(element));
        });
    }

    next() {

        if (this.turnCount >= this.combat.length) {
            return false;
        }

        let turn = this.combat[this.turnCount];

        let action = turn.changes[this.actionCount];

        console.log(action);

        if (action.action === 'attack') {
            let attackMin = document.getElementById(this.makeDomId(action.id));
            let targetMin = document.getElementById(this.makeDomId(action.targetId));

            const source = this.minionInfo(attackMin);
            const target = this.minionInfo(targetMin);

            // The source minion center moves towards the target minion center
            // but stops before it gets there
            const bigX = target.x - source.x;
            const bigY = target.y - source.y;
            const bigH = Math.sqrt(bigX*bigX + bigY*bigY);
            const smallH = bigH - 1.5*target.radius;
            const smallX = smallH * (bigX/bigH);
            const smallY = smallH * (bigY/bigH);

            const anim = attackMin.animate([
                { transform: 'translate(0px, 0px)'},
                { transform: `translate(${smallX}px, ${smallY}px)` }
            ], {
                // timing options
                duration: 1000,
                iterations: 1
            }).onfinish = function() {
                console.log('finished 1st anim');
                attackMin.animate([
                    { transform: `translate(${smallX}px, ${smallY}px)` },
                    { transform: 'translate(0px, 0px)'}    
                ], {
                    duration: 1000,
                    iterations: 1    
                });
            };

        } else if (action.action === 'change') {

            let minion = document.getElementById(this.makeDomId(action.id));
            let attr = minion.getElementsByClassName(action.stat)[0];
            attr.innerText = action.value;

        } else if (action.action === 'remove') {
            document.getElementById(this.makeDomId(action.id)).remove();
        }

        if (++this.actionCount >= turn.changes.length) {
            this.actionCount = 0;
            ++this.turnCount;
        }

        return true;
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

     minionInfo(min) {
         const r = min.getBoundingClientRect();
         return {
            x: r.left + r.width/2,
            y: r.top + r.height/2,
            radius: Math.max(r.width, r.height)/2
         };
     }
}

