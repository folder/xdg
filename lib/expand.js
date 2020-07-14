'use strict';

const os = require('os');
const path = require('path');
const { dir, homedir, load, resolve } = require('./utils');

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
    user: {
      conf: paths.user_dirs_conf,
      global: paths.user_dirs_global,
      dirs: paths.user_dirs,
      load(type = 'dirs', opt) {
        return load(dirs.user[type], { ...options, ...opt });
      }
    }
  };

  const conf = dirs.user.load('conf');

  if (options.userdirs !== false && conf.enabled !== false) {
    const defaults = dirs.user.load('global');
    const userdirs = dirs.user.load('dirs');
    dirs.userdirs = { ...defaults, ...userdirs };
  }

  return dirs;
};

module.exports = expand;
