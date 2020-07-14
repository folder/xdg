'use strict';

require('./fixtures/env');
const path = require('path');
const { userdirs } = require('..');

const { paths, config, defaults, dirs } = userdirs.expand();
console.log(config());

const merged = { ...defaults(), ...dirs() };
console.log(merged);
