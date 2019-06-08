const xdg = require('..');
const loaders = {
  json(file) {
    return JSON.parse(file.contents);
  }
};

const paths = xdg({ methods: true, platform: 'linux', loaders });
console.log(paths);
