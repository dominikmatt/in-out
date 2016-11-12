// server.js
// load the things we need
var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
    res.render('master.ejs');
});

// input page
app.get('/input', function(req, res) {
    res.render('input.ejs');
});

// studio page
app.get('/studio', function(req, res) {
    res.render('studio.ejs');
});

// studio page
app.get('/audio/:file', function(req, res) {
    var file = req.param('file');
    var filepath = path.join(__dirname, 'temp/' + file);
    var readStream = fs.createReadStream(filepath);

    res.set({'Content-Type': 'audio/ogg'});

    readStream.pipe(res);
});

app.use(express.static('web/'));

app.listen(9002);
console.log('run on 9002');
