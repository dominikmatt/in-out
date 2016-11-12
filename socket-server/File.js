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

module.exports = class File {
    constructor(enforcer) {
        if(enforcer != singletonEnforcer) throw "Cannot construct singleton File";

        this._socket = null;
    }

    /**
     * @returns {Camera}
     */
    static get instance() {
        if(!this[singleton]) {
            this[singleton] = new File(singletonEnforcer);
        }

        return this[singleton];
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
     * Upload audio file
     *
     * @param {object} data
     */
    upload(data) {
        var buf = new Buffer(data.buffer);

        console.log('save file with name', data.name);
        fs.writeFile('temp/' + data.name + '.ogg', buf, function(err) {
            if(err) {
                console.log("err", err);
                return;
            }

            console.log('send new file event');
            this.socket.emit('file.new', {
                url: '/audio/' + data.name + '.ogg'
            });
        }.bind(this))
    }

    /**
     * Returns all files
     */
    getAll() {
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
    }
};