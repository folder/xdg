'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const write = require('write');
const pico = require('picomatch');
const ini = require('ini');
const toml = require('toml');
const yaml = require('yaml');
const userdirs = require('./userdirs');
const { dir, homedir, read, resolve } = require('./utils');

const readfile = config => (pathname, find = false) => {
  try {
    const fullpath = config.find && find ? config.find(pathname) : path.resolve(config.home, pathname);
    return read(fullpath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err);
    }
    return null;
  }
};

const loadFile = config => (pathname, find = true) => {
  const contents = config.read(pathname, find !== false);
  const extname = pathname.startsWith('.env') ? '.env' : path.extname(pathname);

  if (!contents) {
    return {};
  }

  switch (extname) {
    case '.env':
    case '.ini':
      return ini.parse(contents);
    case '.json':
      return JSON.parse(contents);
    case '.toml':
      return toml.parse(contents);
    case '.yaml':
    case '.yml':
      return yaml.parse(contents);
    case '.js':
      return require(pathname);
    default: {
      return contents;
    }
  }
};

const search = (dirs = []) => (pattern, folder) => {
  const isMatch = pico(pattern, { dot: true, basename: true });
  const matches = [];

  for (const dir of dirs) {
    const dirname = folder ? path.join(dir, folder) : dir;
    const dirents = fs.existsSync(dirname) ? fs.readdirSync(dirname, { withFileTypes: true }) : [];

    for (const dirent of dirents) {
      dirent.path = path.resolve(dir, dirent.name);

      if (isMatch(dirent.path)) {
        matches.push(dirent);
      }
    }
  }

  return matches;
};

const writefile = dir => (pathname, ...args) => {
  return write(path.resolve(dir, pathname), ...args);
};

const find = dirs => (pathname, ...args) => {
  return dirs.map(dir => path.resolve(dir, pathname)).find(fp => fs.existsSync(fp));
};

const decorateMethods = dirs => {
  for (const key of Object.keys(dirs)) {
    const config = dirs[key];

    if (config && typeof config !== 'string') {
      if (Array.isArray(config.dirs)) {
        config.find = find(config.dirs);
        config.search = search(config.dirs);
      }

      config.read = readfile(config);
      config.load = loadFile(config);
      config.parse = loadFile(config);
      config.write = writefile(config.home);
    }
  }
};

// eslint-disable-next-line complexity
const expand = (paths, options = {}) => {
  const cachedir = dir('cache', options);
  const configdir = dir('config', options);
  const datadir = dir('data', options);
  const runtimedir = dir('runtime', options);
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();

  const dirs = {
    cwd,
    home: dir('home', options) || homedir(options.platform || process.platform),
    temp: dir('temp', options) || os.tmpdir(),
    cache: {
      home: cachedir || paths.cache,
      dirs: [cachedir || paths.cache],
      logs: resolve(cachedir || paths.cache, 'logs')
    },
    config: {
      home: configdir || paths.config,
      dirs: [...new Set([configdir || paths.config, ...paths.config_dirs])]
    },
    data: {
      home: datadir || paths.data,
      dirs: [...new Set([datadir || paths.data, ...paths.data_dirs])]
    },
    runtime: {
      home: runtimedir || paths.runtime,
      dirs: [runtimedir || paths.runtime]
    },
    userdirs: userdirs.expand(options),
    local: {
      name: path.basename(cwd),
      home: cwd,
      dirs: [cwd]
    }
  };

  decorateMethods(dirs);
  return dirs;
};

module.exports = expand;
