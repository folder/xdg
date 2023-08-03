/* eslint-disable no-multi-assign */
'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const write = require('write');
const pico = require('picomatch');
const ini = require('ini');
const toml = require('toml');
const yaml = require('yaml');
const userdirs = require('./user-dirs');
const { dir, homedir, isObject, read, resolve } = require('./utils');

const readfile = config => (pathname, find = false) => {
  try {
    const fullpath = config.find && find
      ? config.find(pathname)
      : path.resolve(config.home, pathname);

    return read(fullpath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err);
    }
    return null;
  }
};

const parseNpmrc = (input = '') => {
  const data = ini.parse(input);
  const init = {};

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('init-')) {
      const segs = key.split('-');
      let k = segs[0];
      let o = init;

      while (segs.length) {
        k = segs.shift();
        o = o[k] = segs.length ? o[k] || {} : value;
      }

      delete data[key];
    }
  }

  if (init?.init) {
    data.init ||= init?.init;
  }

  return data;
};

const loadFile = config => (pathname, { find = true, ext } = {}) => {
  const basename = path.basename(pathname);
  const contents = config.read(pathname, find !== false);
  const extname = ext || (basename.startsWith('.env') ? '.env' : path.extname(basename));

  if (!contents) {
    return {};
  }

  const load = () => {
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

  const data = load();

  if (basename === '.npmrc') {
    return parseNpmrc(data);
  }

  return data;
};

const search = (dirs = []) => (patterns, folder) => {
  const isMatch = pico(patterns, { dot: true });
  const matches = [];

  for (const dir of dirs) {
    const dirname = folder ? path.join(dir, folder) : dir;
    const dirents = fs.existsSync(dirname) ? fs.readdirSync(dirname, { withFileTypes: true }) : [];

    for (const dirent of dirents) {
      dirent.path = path.resolve(dir, dirent.name);
      dirent.relative = path.relative(dir, dirent.path);

      if (isMatch(dirent.relative)) {
        matches.push(dirent);
      }
    }
  }

  return matches;
};

const writefile = dir => (pathname, ...args) => {
  return write(path.resolve(dir, pathname), ...args);
};

const find = config => pathname => {
  for (const dir of config.dirs) {
    const filepath = path.resolve(dir, pathname);

    if (fs.existsSync(filepath)) {
      return filepath;
    }
  }
  return null;
};

const create = config => {
  if (Array.isArray(config.dirs)) {
    config.find = find(config);
    config.search = search(config);
  }

  config.read = readfile(config);
  config.load = loadFile(config);
  config.parse = loadFile(config);
  config.write = writefile(config.home);
  return config;
};

const createDirs = dirs => {
  for (const key of Object.keys(dirs)) {
    const config = dirs[key];

    if (isObject(config)) {
      Reflect.defineProperty(config, 'parent', { value: dirs, enumerable: false });
      create(config);
    }
  }

  return dirs;
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

  createDirs(dirs);
  return dirs;
};

module.exports = {
  expand,
  create,
  createDirs,
  readfile,
  loadFile,
  search,
  writefile,
  find
};
