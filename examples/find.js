const xdg = require('..');

const paths = xdg({ methods: true, platform: 'linux', dirs: [] });
paths.config.home = paths.config.home + '/toolkit';
paths.config.dirs.unshift(process.cwd() + '/test/fixtures');

console.log(paths.config.find('config.json'));
