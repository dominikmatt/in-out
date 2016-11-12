var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var router = require('./Router.js').instance;

router.io = io;
router.start();

server.listen(9003);

console.log('run on 9003');