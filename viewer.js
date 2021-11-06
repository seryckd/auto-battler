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

        if (action.action === 'change') {

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

        function addAttr(name, value) {
           let attr = document.createElement("div");
           attr.className = name;
           attr.innerText = value;
           return attr;
        }

        let min = document.createElement('div');
        min.className = "minion";
        min.id = this.makeDomId(minion.id);
        min.appendChild(addAttr('name', minion.name));
        min.appendChild(addAttr('attack', minion.attack));
        min.appendChild(addAttr('health', minion.health));
        return min;
     }    
}

