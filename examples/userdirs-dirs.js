'use strict';

require('./fixtures/env');
const path = require('path');
const { userdirs } = require('..');

console.log(userdirs.dirs());
