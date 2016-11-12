'use strict';

var stream = require('socket.io-stream');
var fs = require('fs');

/**
 * @type {Symbol}
 */
let singleton = Symbol();

/**
 * @type {Symbol}
 */
let singletonEnforcer = Symbol();

module.exports = class Router {
    constructor(enforcer) {
        if(enforcer != singletonEnforcer) throw "Cannot construct singleton Player";

        this._io = null;
        this._socket = null;
    }

    /**
     * @returns {Camera}
     */
    static get instance() {
        if(!this[singleton]) {
            this[singleton] = new Router(singletonEnforcer);
        }

        return this[singleton];
    }

    set io(io) {
        this._io = io;
    }

    get io() {
        return this._io;
    }

    set socket(socket) {
        this._socket = socket;
    }

    get socket() {
        return this._socket;
    }

    start() {
        this.bindEvents();
    }

    bindEvents() {
        this.io.on('connection', this.onConnection.bind(this));
    }

    onConnection(socket) {
        this.socket = socket;
        this.bindRoutes();
        this.bindStreams();
    }

    bindRoutes() {
        this.socket.on('event', function (data) {
            console.log(data);
        });
    }

    bindStreams() {
        stream(this.socket).on('audio', (stream) => {
            stream.pipe(fs.createWriteStream('foo.txt'));
        });
    }
};