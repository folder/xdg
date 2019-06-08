const xdg = require('..');
const loaders = {
  json(file) {
    return JSON.parse(file.contents);
  }
};

const paths = xdg({ methods: true, platform: 'linux', loaders });

console.log(paths.config.load.sync('toolkit/config.json'));

paths.config.load('toolkit/config.json')
  .then(res => console.log(res))
  .catch(console.error);

