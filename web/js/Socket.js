'use strict';

/**
 * @type {Symbol}
 */
let singleton = Symbol();

/**
 * @type {Symbol}
 */
let singletonEnforcer = Symbol();

/**
 * @class InputManager
 */
class Socket {
    constructor(enforcer) {
        if (enforcer !== singletonEnforcer) {
            throw "Cannot construct singleton Player";
        }

        this.connection = io('ws://api-in-out.domready.at', {
            transports: ['websocket']
        });
    }

    set connection(connection) {
        this._connection = connection;
    }

    get connection() {
        return this._connection;
    }

    /**
     * @returns {Socket}
     */
    static get instance() {
        if (!this[singleton]) {
            this[singleton] = new Socket(singletonEnforcer);
        }

        return this[singleton];
    }
}

let socket = Socket.instance;
