const xdg = require('..');
const onEach = file => {
  file.keep = file.isDirectory() && !/(^|\/)\.(?!config)/.test(file.path);
};

const paths = xdg({ methods: true, platform: 'linux', onEach });
console.log(paths.config.files.sync('toolkit', { recursive: true }));
