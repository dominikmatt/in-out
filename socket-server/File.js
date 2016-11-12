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
        this.startWatch();
    }

    /**
     * @returns {File}
     */
    static get instance() {
        if(!this[singleton]) {
            this[singleton] = new File(singletonEnforcer);
        }

        return this[singleton];
    }

    startWatch() {
        fs.watch('temp/', function (event, fileName) {
            if (!fs.existsSync(this.getFilePath(fileName))) {
                console.log('removed from filesystem');
                this.socket.emit('file.removed', {
                    fileName: fileName
                });
            }
        }.bind(this));
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
        var fileName = data.name + '.ogg';

        fileName = this.checkFileName(fileName, 0);

        console.log('save file with name', data.name);
        fs.writeFile(this.getFilePath(fileName), buf, function(err) {
            if(err) {
                console.log("err", err);
                return;
            }

            console.log('send new file event');
            this.socket.emit('file.new', {
                fileName: fileName,
                url: '/audio-stream/' + fileName,
                urlSend: '/audio-send/' + fileName
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
                        fileName: file,
                        url: '/audio-stream/' + file,
                        urlSend: '/audio-send/' + file
                    });
                }
            });

            console.log('send all', fileList);
            this.socket.emit('file.all', {
                fileList: fileList
            })
        });
    }

    /**
     * Remove file.
     *
     * @param fileName
     */
    remove(data) {
        if (fs.existsSync(this.getFilePath(data.fileName))) {
            var filePath = this.getFilePath(data.fileName);

            fs.unlinkSync(filePath);

            console.log('Remove file: ', data.fileName);
            this.socket.emit('file.removed', {
                fileName: data.fileName,
            });
        }
    }

    /**
     *
     * @param fileName
     * @returns {string}
     */
    getFilePath(fileName) {
        return 'temp/' + fileName;
    }

    /**
     * Check fileName if that name allready exists.
     *
     * @param {string} fileName
     * @returns {string}
     */
    checkFileName(fileName, count) {
        if (fs.existsSync(this.getFilePath(fileName))) {
            if (count > 0) {
                fileName = fileName.substring(0, fileName.length - 5) + count + '.ogg';
            } else {
                fileName = fileName.substring(0, fileName.length - 4) + '-1.ogg';
            }

            count++;
        } else {
            return fileName;
        }

        return this.checkFileName(fileName, count);
    }
};