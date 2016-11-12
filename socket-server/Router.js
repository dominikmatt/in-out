'use strict';

var fs = require('fs');
var file = require('./File.js').instance;

/**
 * @type {Symbol}
 */
let singleton = Symbol();

/**
 * @type {Symbol}
 */
let singletonEnforcer = Symbol();

/**
 * @class Router
 * @type {Router}
 */
module.exports = class Router {
    constructor(enforcer) {
        if(enforcer != singletonEnforcer) throw "Cannot construct singleton Router";

        this._io = null;
        this._socket = null;
    }

    /**
     * @returns {Router}
     */
    static get instance() {
        if(!this[singleton]) {
            this[singleton] = new Router(singletonEnforcer);
        }

        return this[singleton];
    }

    /**
     * @param {IO} io
     */
    set io(io) {
        this._io = io;
    }

    /**
     * @returns {IO}
     */
    get io() {
        return this._io;
    }

    /**
     * @param {Socket} socket
     */
    set socket(socket) {
        this._socket = socket;
    }

    /**
     * @returns {Socket}
     */
    get socket() {
        return this._socket;
    }

    /**
     * Start connection
     */
    start() {
        this.bindEvents();
    }

    /**
     * Bind IO events
     */
    bindEvents() {
        this.io.on('connection', this.onConnection.bind(this));
    }

    /**
     * on conncetion open
     *
     * @param socket
     */
    onConnection(socket) {
        this.socket = socket;
        file.socket = socket;
        this.bindRoutes();
    }

    /**
     * Bin all socket Routes
     */
    bindRoutes() {
        this.socket.on('file.get', file.getAll.bind(file));
        this.socket.on('file.upload', file.upload.bind(file));
        this.socket.on('file.remove', file.remove.bind(file));
    }
};