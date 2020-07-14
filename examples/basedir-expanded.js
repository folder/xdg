'use strict';

const start = Date.now();

require('./fixtures/env');
const xdg = require('..');
const paths = xdg({ subdir: 'toolkit', expanded: true });

console.log(paths.config.find('config.json', true));
console.log(paths.config.read('config.json'));
console.log(`${Date.now() - start}ms`);
