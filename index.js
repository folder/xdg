'use strict';

const os = require('os');
const path = require('path');
const join = path.join;

const split = str => str ? str.split(path.delimiter) : [];
const title = str => str[0].toUpperCase() + str.slice(1);
const homedir = platform => {
  return os.homedir() || (platform === 'win32' ? os.tmpdir() : '/usr/local/share');
};
const dir = (key, options = {}) => {
  let prop = options.envPrefix ? `${options.envPrefix}_${key}_dir` : null;
  let name = `${key}dir`;

  if (prop) {
    return process.env[prop.toUpperCase()] || options[name];
  }

  return options[name];
};

const expanded = (paths, options = {}) => {
  let cachedir = dir('cache', options);
  let configdir = dir('config', options);
  let datadir = dir('data', options);
  let runtimedir = dir('runtime', options);

  return {
    cwd: options.cwd || process.cwd(),
    home: dir('home', options) || homedir(options.platform || process.platform),
    temp: dir('temp', options) || os.tmpdir(),
    cache: {
      home: cachedir || paths.cache,
      logs: xdg.resolve(cachedir || paths.cache, 'logs')
    },
    config: {
      home: configdir || paths.config,
      dirs: [...new Set([configdir || paths.config, ...paths.configdirs])]
    },
    data: {
      home: datadir || paths.data,
      dirs: [...new Set([datadir || paths.data, ...paths.datadirs])]
    },
    runtime: {
      home: runtimedir || paths.runtime
    }
  };
};

/**
 * Get the XDG Base Directory paths for Linux, or the equivalents for Windows or MaxOS.
 * @name xdg()
 * @param {Object} `options`
 * @return {Object} Returns an object of paths for the current platform.
 * @api public
 */

const xdg = (options = {}) => {
  const platform = options.platform || process.platform;
  const fn = xdg[platform];

  if (typeof fn !== 'function') {
    throw new Error(`Platform "${platform}" is not supported`);
  }

  return fn(options);
};

/**
 * Get XDG equivalent paths for MacOS. Used by the main export when `process.platform`
 * is `darwin`. Aliased as `xdg.macos()`.
 *
 * ```js
 * const dirs = xdg.darwin();
 * // or
 * const dirs = xdg.macos();
 * ```
 * @param {Object} `options`
 * @return {Object} Returns an object of paths.
 * @api public
 */

xdg.darwin = (options = {}) => {
  const env = options.env || process.env;
  const subdir = options.subdir || '';
  const resolve = options.resolve || xdg.resolve;

  const temp = options.tempdir || os.tmpdir();
  const home = options.homedir || homedir('darwin');
  const lib = join(home, 'Library');
  const config = resolve(env.XDG_CONFIG_HOME || join(lib, 'Preferences'), subdir);
  const data = resolve(env.XDG_DATA_HOME || join(lib, 'Application Support'), subdir);

  const dirs = {
    cache: resolve(env.XDG_CACHE_HOME || join(lib, 'Caches'), subdir),
    config,
    configdirs: [config].concat(split(env.XDG_CONFIG_DIRS || '/etc/xdg')),
    data,
    datadirs: [data].concat(split(env.XDG_DATA_DIRS || '/usr/local/share/:/usr/share/')),
    runtime: resolve(env.XDG_RUNTIME_DIR || temp, subdir)
  };

  if (options.expanded === true) {
    return expanded(dirs, options);
  }

  return dirs;
};

/**
 * Get XDG equivalent paths for Linux. Used by the main export when `process.platform`
 * is `linux`.
 *
 * ```js
 * const dirs = xdg.linux();
 * ```
 * @return {Object} Returns an object of paths.
 * @return {Object} Returns an object of paths.
 * @api public
 */

xdg.linux = (options = {}) => {
  const env = options.env || process.env;
  const subdir = options.subdir || '';
  const resolve = options.resolve || xdg.resolve;

  const temp = options.tempdir || os.tmpdir();
  const home = options.homedir || homedir('linux');
  const config = resolve(env.XDG_CONFIG_HOME || join(home, '.config'), subdir);
  const data = resolve(env.XDG_DATA_HOME || join(home, '.local', 'share'), subdir);

  const dirs = {
    cache: resolve(env.XDG_CACHE_HOME || join(home, '.cache'), subdir),
    config,
    configdirs: [config].concat(split(env.XDG_CONFIG_DIRS || '/etc/xdg')),
    data,
    datadirs: [data].concat(split(env.XDG_DATA_DIRS || '/usr/local/share/:/usr/share/')),
    runtime: resolve(env.XDG_RUNTIME_DIR || temp, subdir)
  };

  if (options.expanded === true) {
    return expanded(dirs, options);
  }

  return dirs;
};

/**
 * Get XDG equivalent paths for MacOS. Used by the main export when `process.platform`
 * is `win32`. Aliased as `xdg.windows()`.
 *
 * ```js
 * const dirs = xdg.win32();
 * // or
 * const dirs = xdg.windows();
 * ```
 * @param {Object} `options`
 * @return {Object} Returns an object of paths.
 * @api public
 */

xdg.win32 = (options = {}) => {
  const env = options.env || process.env;
  const subdir = options.subdir || '';
  const resolve = options.resolve || xdg.resolve;
  const { APPDATA, LOCALAPPDATA } = env;

  const temp = options.tempdir || os.tmpdir();
  const home = options.homedir || homedir('win32');
  const local = LOCALAPPDATA || join(home, 'AppData', 'Local');
  const roaming = APPDATA || join(home, 'AppData', 'Roaming');
  const config = resolve(env.XDG_CONFIG_HOME || roaming, subdir, 'Config');
  const data = resolve(env.XDG_DATA_HOME || local, subdir, 'Data');

  const dirs = {
    cache: resolve(env.XDG_CACHE_HOME || join(local), subdir, 'Cache'),
    config,
    configdirs: [config].concat(split(env.XDG_CONFIG_DIRS)),
    data,
    datadirs: [data].concat(split(env.XDG_DATA_DIRS)),
    runtime: resolve(env.XDG_RUNTIME_DIR || temp, subdir)
  };

  if (options.expanded === true) {
    return expanded(dirs, options);
  }

  return dirs;
};

/**
 * Respect casing in user's existing paths
 */

xdg.resolve = (parentdir, subdir = '', ...rest) => {
  if (subdir && /^[A-Z]/.test(path.basename(parentdir))) {
    return path.join(parentdir, title(subdir), ...rest);
  }
  if (subdir) {
    return path.join(parentdir, subdir.toLowerCase(), ...rest);
  }
  return path.join(parentdir, 'xdg', ...rest);
};

/**
 * Expose "xdg"
 */

xdg.windows = xdg.win32;
xdg.macos = xdg.darwin;
module.exports = xdg;
