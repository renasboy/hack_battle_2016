var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');

io.on('connection', function(client) {  
    console.log('Client connected...');
});

// var publicDir = path.join(__dirname, 'assets');
// console.log(publicDir);
// app.use(express.static(publicDir));

// app.use(express.static(__dirname + '/assets'));

app.get('/', function(req, res, next) {  
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + 'assets'));

server.listen(3030);

var ttn = require('ttn');
var appEUI = '70B3D57ED00001FC';
var accessKey = 'xKr2JuF7718h7Bn/6HIJ97aay3hYiLeniN9RF5RrfwA=';
var client = new ttn.Client('staging.thethingsnetwork.org', appEUI, accessKey);

var distance_threshold = 80;

client.on('uplink', function (up) {
    console.log(up.fields)
    if (up.fields['distance'] < distance_threshold) {
        // close the client:
        client.end()

        var appEUI = '70B3D57ED00001FF';
        var accessKey = 'JdUxQPNUjzIxnuENhZeso9NOMpctclDYkNTbRxIjaqU=';
        var client2 = new ttn.Client('staging.thethingsnetwork.org', appEUI, accessKey);

        client2.on('uplink', function (up) {
            console.log(up.fields)
            if ('gas' in up.fields) {
              io.emit('updateGas', up.fields['gas']);
            }
            else if ('moisture' in up.fields) {
              io.emit('updateMoisture', up.fields['moisture']);
            }
            else if ('presence' in up.fields) {
              io.emit('updatePresence', up.fields['presence']);
            }
            
        });
    }
});

// These are messages sent by devices on The Things Network
client.on('message', function (msg) {
  console.log('We got a message from a device')
  console.log(msg)
  // msg = {
  //  devEUI: '00000000973572D0',
  //   fields: { /* ... */ },
  //   counter: 44,
  //   metadata: { /* ... */ },
  // }
});

// These are devices that are activated on The Things Network
client.on('activation', function (evt) {
  console.log('Activation took place')
  console.log(evt)
  // evt = {
  //  devEUI: '00000000973572D0',
  // }
});

client.on('error', function (err) {
  console.log('ERROR')
  console.log(err)
  // todo: handle error
});
