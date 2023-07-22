const xdg = require('..');

const dirs = xdg({ expanded: true });
const configs = [
  dirs.config.parse('.env'),
  dirs.local.parse('.env')
];

console.log(Object.assign({}, ...configs));
