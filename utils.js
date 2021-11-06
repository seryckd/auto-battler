
export function cloneClass(proto, obj) {
    const c = Object.assign({}, obj);
    Object.setPrototypeOf(c, proto);    
    return c;
}

/**
 * positions are from 0 to max-1
 */
export class Slots {
    constructor(size) {
        this.maxSize = size;
        this.slots = [];
        this.countSize = 0;
        for(var i=0; i<this.maxSize; i++) {
            this.slots[i] = null;
        }
    }
    
    count() {
        return this.countSize;
    }

    max() {
        return this.maxSize;
    }

    all() {
        return this.slots;
    }

    fetch(pos) {
        return this.slots[pos];
    }

    add(thing) {
        if (this.countSize >= this.maxSize) {
            throw "Slots-exceeded-size";
        }

        this.slots[this.countSize++] = thing;
    }

    removePos(pos) {
        if (pos < 0 && pos > this.countSize) {
            throw "Slots-invalid-param"
        }

        for(var i=pos; i<this.countSize-1; i++) {
            this.slots[i] = this.slots[i+1];
        }
        this.countSize--;
    }
}

export function testSlots() {
    let s = new Slots(3);

    console.log('slots: ' + s.count() + '/' + s.max());
    
    s.add("one")
    console.log('slots: ' + s.count() + '/' + s.max() + ' ' + s.fetch(0));
    s.add("two")
    console.log('slots: ' + s.count() + '/' + s.max() + ' ' + s.fetch(1));
    s.add("three")
    console.log('slots: ' + s.count() + '/' + s.max() + ' ' + s.fetch(2));
    try {
        s.add("four")
    } catch {
        console.log('failed to add');
    }
    s.removePos(0);
    console.log(s);
    s.removePos(1);
    console.log(s);
    s.add("five")
    console.log(s);
    s.removePos(0);
    console.log(s);
    s.removePos(0);
    console.log(s);
}