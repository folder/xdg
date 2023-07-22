const xdg = require('..');

const dirs = xdg();

console.log(dirs.cache);
// console.log(process.env);
// console.log(xdg({ expanded: true }));
