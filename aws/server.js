'use strict';

const serverAws = require('./aws.js');

var server = new serverAws();

console.log(server.getData());