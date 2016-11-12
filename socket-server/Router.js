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
        if(enforcer != singletonEnforcer) throw "Cannot construct singleton Router";

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
            console.log('new connection');
            console.log(data);
        });
    }

    bindStreams() {
        this.socket.on('file.get', function() {
            console.log('get all');
            var fileList = [];

            fs.readdir('temp/', (err, files) => {
                files.forEach((file) => {
                    if (file.substr(file.length - 3) === 'ogg') {
                        fileList.push({
                            url: '/audio/' + file
                        });
                    }
                });

                console.log('send all', fileList);
                this.socket.emit('file.all', {
                    fileList: fileList
                })
            });
        }.bind(this));

        // send data
        this.socket.on('file.upload', function(data) {
            var buf = new Buffer(data.buffer);

            console.log('save file with name', data.name);
            fs.writeFile('temp/' + data.name + '.ogg', buf, function(err) {
                if(err) {
                    console.log("err", err);
                    return;
                }

                console.log('send new file event');
                this.socket.emit('file.new')
            }.bind(this))
        }.bind(this));
    }
};