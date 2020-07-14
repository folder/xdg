'use strict';

require('./fixtures/env');
const path = require('path');
const { userdirs } = require('..');

// console.log(userdirs.conf());
// console.log(userdirs.dirs());
// console.log(userdirs.defaults());

const { paths, defaults, dirs } = userdirs();
console.log(paths);
console.log({ ...defaults, ...dirs });

// console.log(userdirs.user_dirs_conf(process.env.XDG_USER_DIRS_CONF));
// console.log(load('user-dirs.conf'));
// console.log(load('user-dirs.defaults'));
// console.log(load('user-dirs.dirs'));
// // console.log(load('user-dirs.def'));
// console.log(process.env);
