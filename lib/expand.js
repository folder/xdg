'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const write = require('write');
const userdirs = require('./userdirs');
const { dir, homedir, read, resolve } = require('./utils');

const readfile = obj => (pathname, find = false) => {
  return read((obj.find && find) ? obj.find(pathname) : path.join(obj.home, pathname));
};

const writefile = dir => (pathname, ...args) => {
  return write(path.join(dir, pathname), ...args);
};

const find = dirs => (pathname, ...args) => {
  return dirs.map(dir => path.join(dir, pathname)).find(fp => fs.existsSync(fp));
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
      data.write = writefile(data.home);
    }
  }

  return dirs;
};

module.exports = expand;
