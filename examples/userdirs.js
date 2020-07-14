'use strict';

require('./fixtures/env');
const path = require('path');
const { userdirs } = require('..');

console.log(userdirs.conf());
console.log(userdirs.dirs());
console.log(userdirs.defaults());
console.log(userdirs());
