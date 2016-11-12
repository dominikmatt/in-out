'use strict';

var fs = require('fs');

/**
 * @type {Symbol}
 */
let singleton = Symbol();

/**
 * @type {Symbol}
 */
let singletonEnforcer = Symbol();

module.exports = class Database {
    constructor(enforcer) {
        if(enforcer != singletonEnforcer) throw "Cannot construct singleton Database";

        this._conn = null;
    }

    /**
     * @returns {Database}
     */
    static get instance() {
        if(!this[singleton]) {
            this[singleton] = new Database(singletonEnforcer);
        }

        return this[singleton];
    }

    connect() {

    }
};