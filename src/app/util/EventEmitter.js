

class EventEmitter {
    constructor() {
        this.handlers = {};
    }

    on(name, handler) {
        if (typeof this.handlers[name] === 'undefined') {
            this.handlers[name] = [];
        }
        this.handlers[name].push(handler);
    }

    dispatch(name, handler) {
        if (!this.handlers[name]) return;

        if (handler) {
            const index = this.handlers[name]

        }
    }

    off(name, handler) {
        if ()
    }
}
