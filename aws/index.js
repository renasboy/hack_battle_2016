'use strict';

const util = require('util');
const ttn = require('ttn');
const awsiot = require('aws-iot-device-sdk');

const mqttBroker = 'staging.thethingsnetwork.org'
const appEUI = '70B3D57ED00001FC';
const appAccessKey = 'xKr2JuF7718h7Bn/6HIJ97aay3hYiLeniN9RF5RrfwA=';
const keyPath = './devices';
const region = 'eu-west-1';


var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/bower_components'));  
app.get('/', function(req, res, next) {  
    res.sendFile(__dirname + '/index.html');
});

server.listen(3030);

io.on('connection', function(client) {  
    console.log('Client connected...');
    io.emit('updateData', 'hello');
});

var getData = function(data) {
  io.emit('updateData', data);
  // var random = Math.random().toString(36).substring(7);
  // console.log(random);
};


// Create the client to The Things Network
var client = new ttn.Client(mqttBroker, appEUI, appAccessKey);

var devices = {};

// A device activates
client.on('activation', activation => {
  console.log('%s: Device activated', activation.devEUI);

  // If we already have a connection, close it first
  if (devices[activation.devEUI]) {
    console.log('%s: Closing existing connection', activation.devEUI);
    devices[activation.devEUI].end();
  }

  // Initialize the device with the security keys. Get these from the AWS IoT
  var device = awsiot.device({
    clientCert: util.format('%s/%s.crt', keyPath, activation.devEUI),
    privateKey: util.format('%s/%s.key', keyPath, activation.devEUI),
    caCert: util.format('%s/root-CA.crt', keyPath),
    clientId: activation.devEUI,
    region: region
  });

  device.on('connect', () => {
    console.log('%s: Connected', activation.devEUI);
    devices[activation.devEUI] = device;
  });

  device.on('error', err => {
    console.log('%s: %s', err);
  })
});

// A device sends a message
client.on('uplink', uplink => {
  
  getData(JSON.stringify(uplink.fields));

  console.log('%s: Got uplink: %j', uplink.devEUI, uplink.fields);

  var device = devices[uplink.devEUI];
  if (!device) {
    console.warn('%s: Device is not activated', uplink.devEUI);
    return;
  }

  // Prepare the message to send
  var data = Object.assign({
    counter: uplink.counter,
    time: uplink.metadata.server_time
  }, uplink.fields);

  // Send the message to AWS IoT
  console.log('%s: Sending message: %j', uplink.devEUI, data);
  device.publish('up', JSON.stringify(data));
});

client.connect();
