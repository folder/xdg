'use strict';

const start = Date.now();

require('./fixtures/env');
const xdg = require('..');

console.log(xdg({ subdir: 'toolkit', expanded: true }));
console.log(`${Date.now() - start}ms`);
