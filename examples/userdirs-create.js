'use strict';

require('./fixtures/env');
const path = require('path');
const { userdirs } = require('..');

const dirs = userdirs.expand();
console.log(dirs.create());
