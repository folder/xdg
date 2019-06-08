'use strict';

const pwd = process.env.PWD;
const os = require('os');
const path = require('path');
const { files, find, first, resolve, read, load } = require('./utils');
const split = str => str ? str.split(path.delimiter) : [];

/**
 * Resolve the base directories to use for the current platform.
 * @param {Object} `config`
 * @return {Object}
 * @api public
 */

const xdg = (options = {}) => {
  const platform = options.platform || process.platform;
  const home = options.homedir || os.homedir();
  const env = options.env || process.env;
  const fn = xdg[platform];

  if (typeof fn !== 'function') {
    throw new Error(`Platform "${platform}" is not supported`);
  }

  const paths = fn(home, env);

  xdg.paths = {
    home,
    pwd,
    get cwd() {
      return options.cwd || process.cwd();
    },
    cache: {
      home: options.cacheDir || paths.cache
    },
    config: {
      home: options.configDir || paths.config,
      dirs: [options.configDir || paths.config, ...paths.configDirs]
    },
    data: {
      home: options.dataDir || paths.data,
      dirs: [options.dataDir || paths.data, ...paths.dataDirs]
    },
    runtime: {
      home: options.runtimeDir || paths.runtime
    }
  };

  if (options.methods === true) {
    for (let key of Object.keys(xdg.paths)) {
      if (key !== 'home' && key !== 'cwd' && key !== 'pwd') {
        xdg.paths[key].resolve = resolve(xdg.paths, key, options);
        xdg.paths[key].find = find(xdg.paths, key, options);
        xdg.paths[key].first = first(xdg.paths, key, options);
        xdg.paths[key].files = files(xdg.paths, key, options);
        xdg.paths[key].read = read(xdg.paths, key, options);
        xdg.paths[key].load = load(xdg.paths, key, options);
      }
    }
  }

  return xdg.paths;
};

xdg.darwin = (home = os.homedir(), env = process.env) => {
  return {
    cache: env.XDG_CACHE_HOME || path.join(home, 'Library', 'Caches'),
    config: env.XDG_CONFIG_HOME || path.join(home, 'Library'),
    configDirs: split(env.XDG_CONFIG_DIRS || '/etc/xdg'),
    data: env.XDG_DATA_HOME || path.join(home, 'Library', 'Application Support'),
    dataDirs: split(env.XDG_DATA_DIRS || '/usr/local/share/:/usr/share/'),
    runtime: env.XDG_RUNTIME_DIR || env.TMPDIR
  };
};

xdg.linux = (home = os.homedir(), env = process.env) => {
  return {
    cache: env.XDG_CACHE_HOME || path.join(home, '.cache'),
    config: env.XDG_CONFIG_HOME || path.join(home, '.config'),
    configDirs: split(env.XDG_CONFIG_DIRS || '/etc/xdg'),
    data: env.XDG_DATA_HOME || path.join(home, '.local', 'share'),
    dataDirs: split(env.XDG_DATA_DIRS || '/usr/local/share/:/usr/share/'),
    runtime: env.XDG_RUNTIME_DIR || env.TMPDIR
  };
};

xdg.win32 = (home = os.homedir(), env = process.env) => {
  const { TEMP, TMP, APPDATA, LOCALAPPDATA } = env;
  const local = path.join(home, 'AppData', 'Local');
  const roaming = path.join(home, 'AppData', 'Roaming');
  const temp = path.join(local, 'Temp');

  return {
    cache: env.XDG_CACHE_HOME || TEMP || TMP || temp,
    config: env.XDG_CONFIG_HOME || APPDATA || roaming,
    configDirs: split(env.XDG_CONFIG_DIRS) || [],
    data: env.XDG_DATA_HOME || LOCALAPPDATA || local,
    dataDirs: split(env.XDG_DATA_DIRS) || [],
    runtime: env.XDG_RUNTIME_DIR || TEMP || TMP || temp
  };
};

/**
 * Expose "xdg"
 */

module.exports = xdg;
