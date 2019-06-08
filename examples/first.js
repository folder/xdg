const xdg = require('..');

const paths = xdg({ methods: true, platform: 'linux', dirs: [process.cwd()] });
console.log(paths.config.first('package.json'));
