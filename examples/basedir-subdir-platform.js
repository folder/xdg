'use strict';

const xdg = require('..');

console.log('=== darwin ===');
console.log(xdg({ subdir: 'FooBar', platform: 'darwin' }));
console.log();
console.log('=== linux ===');
console.log(xdg({ subdir: 'FooBar', platform: 'linux' }));
console.log();
console.log('=== win32 ===');
console.log(xdg({ subdir: 'FooBar', platform: 'win32' }));
console.log();
