'use strict';

const StartServerAws = require('./detectUser.js');

var image = '';

var userDetected = new StartServerAws();

// console.log(userDetected.getData());


userDetected.getData();

var express = require('express');
var app = express(); 
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// app.use(express.static(__dirname + '/bower_components'));  
app.get('/', function(req, res, next) {  
    res.sendFile(__dirname + '/index.html');
});


server.listen(3030);


io.on('connection', function(client) {  
    console.log('Client connected...');
});

io.on('userInfo', function(userInfo) {
  console.log(userInfo);
});

// var getData = function(data) {
//   io.emit('updateUser', data);
//   // var random = Math.random().toString(36).substring(7);
//   // console.log(random);
// };