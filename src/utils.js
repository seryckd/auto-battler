
/**
 * Integer from 0 to (max-1)
 * @param {int} max 
 * @returns {int}
 */
export function randomInt(max) {
    return Math.floor(Math.random() * max)
}

export function makeDomId(id) {
    return 'min' + id;
}

/**
 * 
 * @param {*} minion 
 * @returns Element
 */
export function createMinion(minion) {

    let min = document.createElement('div');
    min.classList.add('minion');
    min.id = makeDomId(Object.hasOwn(minion, 'id') ? minion.id : null);
    min.title = minion.portrait;

    let modifiers = "";

    if (minion.skills.find(e => e === 'wall')) {
        modifiers += '<div class="wall"></div>';
    }

    if (minion.skills.find(e => e === 'shield')) {
        modifiers += '<div class="shield"></div>';
    }

    if (minion.skills.find(e => e.startsWith('summon') == true)) {
        modifiers += '<div class="death"></div>';
    }

    if (minion.skills.find(e => e === 'poison')) {
        modifiers += '<div class="poison"></div>';
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
