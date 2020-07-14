'use strict';

require('./fixtures/env');
const path = require('path');
const { load, userdirs } = require('..');

const paths = userdirs();

console.log(paths);
console.log(load(paths.conf));
console.log(load(paths.defaults));
console.log(load(paths.dirs));
