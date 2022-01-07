
export function cloneClass(proto, obj) {
    const c = Object.assign({}, obj);
    Object.setPrototypeOf(c, proto);    
    return c;
}
