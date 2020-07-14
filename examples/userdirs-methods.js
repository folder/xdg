'use strict';

require('./fixtures/env');
const { userdirs } = require('..');

console.log(userdirs.conf());
console.log(userdirs.dirs());
console.log(userdirs.defaults());
