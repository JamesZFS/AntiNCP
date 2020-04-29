// c.r. https://stackoverflow.com/questions/21838436/map-using-tuples-or-objects

let tuple = (function () {
    let map = new Map();

    function tuple() {
        let current = map;
        let args = Object.freeze(Array.prototype.slice.call(arguments));

        for (let item of args) {
            if (current.has(item)) {
                current = current.get(item);
            } else {
                let next = new Map();
                current.set(item, next);
                current = next;
            }
        }

        if (!current.final) {
            current.final = args;
        }

        return current.final;
    }

    return tuple;
})();

module.exports = tuple;
