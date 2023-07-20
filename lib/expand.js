'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const write = require('write');
const pico = require('picomatch');
const userdirs = require('./userdirs');
const { dir, homedir, read, resolve } = require('./utils');

const readfile = obj => (pathname, find = false) => {
  try {
    return read((obj.find && find) ? obj.find(pathname) : path.resolve(obj.home, pathname));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(err);
    }
    return null;
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

const expand = (paths, options = {}) => {
  const cachedir = dir('cache', options);
  const configdir = dir('config', options);
  const datadir = dir('data', options);
  const runtimedir = dir('runtime', options);

  const dirs = {
    cwd: options.cwd ? path.resolve(options.cwd) : process.cwd(),
    home: dir('home', options) || homedir(options.platform || process.platform),
    temp: dir('temp', options) || os.tmpdir(),
    cache: {
      home: cachedir || paths.cache,
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
      home: runtimedir || paths.runtime
    },
    userdirs: userdirs.expand(options)
  };

  for (const key of Object.keys(dirs)) {
    const data = dirs[key];

    if (data && typeof data !== 'string' && Array.isArray(data.dirs)) {
      data.find = find(data.dirs);
    }

    if (data && typeof data !== 'string' && data.home) {
      data.read = readfile(data);
      data.search = search(data.dirs);
      data.write = writefile(data.home);
    }
  }

  return dirs;
};

module.exports = expand;
