'use strict';

const path = require('path');
const userdirs = require('../lib/userdirs');

process.env.XDG_USER_DIRS = path.join(__dirname, 'fixtures/user-dirs.dirs');
process.env.XDG_USER_DIRS_DEFAULTS = path.join(__dirname, 'fixtures/user-dirs.defaults');
process.env.XDG_USER_DIRS_CONF = path.join(__dirname, 'fixtures/user-dirs.conf');

console.log(userdirs.conf());
console.log(userdirs.dirs());
console.log(userdirs.defaults());

const { defaults, dirs } = userdirs();
console.log({ ...defaults, ...dirs });

// console.log(userdirs.user_dirs_conf(process.env.XDG_USER_DIRS_CONF));
// console.log(load('user-dirs.conf'));
// console.log(load('user-dirs.defaults'));
// console.log(load('user-dirs.dirs'));
// // console.log(load('user-dirs.def'));
// console.log(process.env);
