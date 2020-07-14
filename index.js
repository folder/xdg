'use strict';

const isWindows = process.platform === 'win32';
const os = require('os');
const path = require('path');
const join = path.join;
const expand = require('./lib/expand');
const { homedir, resolve, split } = require('./lib/utils');

/**
 * Get the XDG Base Directory paths for Linux, or the equivalents for Windows or MaxOS.
 * @name xdg()
 * @param {Object} `options`
 * @return {Object} Returns an object of paths for the current platform.
 * @api public
 */

const xdg = (options = {}) => {
  const platform = options.platform || (isWindows ? 'win32' : 'linux');
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
  const data = resolve(env.XDG_DATA_HOME || join(lib, 'Application Support'), subdir);
  const config = resolve(env.XDG_CONFIG_HOME || join(lib, 'Application Support'), subdir);
  const etc = '/etc/xdg';

  const dirs = {
    cache: resolve(env.XDG_CACHE_HOME || join(lib, 'Caches'), subdir),
    config,
    config_dirs: [config].concat(split(env.XDG_CONFIG_DIRS || etc)),
    data,
    data_dirs: [data].concat(split(env.XDG_DATA_DIRS || '/usr/local/share/:/usr/share/')),
    runtime: resolve(env.XDG_RUNTIME_DIR || temp, subdir)
  };

  if (options.expanded === true) {
    return expand(dirs, options);
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
  const data = resolve(env.XDG_DATA_HOME || join(home, '.local', 'share'), subdir);
  const config = resolve(env.XDG_CONFIG_HOME || join(home, '.config'), subdir);
  const etc = '/etc/xdg';

  const dirs = {
    cache: resolve(env.XDG_CACHE_HOME || join(home, '.cache'), subdir),
    config,
    config_dirs: [config].concat(split(env.XDG_CONFIG_DIRS || etc)),
    data,
    data_dirs: [data].concat(split(env.XDG_DATA_DIRS || '/usr/local/share/:/usr/share/')),
    runtime: resolve(env.XDG_RUNTIME_DIR || temp, subdir)
  };

  if (options.expanded === true) {
    return expand(dirs, options);
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
  const temp = options.tempdir || os.tmpdir();
  const home = options.homedir || homedir('win32');
  const subdir = options.subdir || '';
  const resolve = options.resolve || xdg.resolve;

  const {
    APPDATA = join(home, 'AppData', 'Roaming'),
    LOCALAPPDATA = join(home, 'AppData', 'Local'),

    // XDG Base Dir variables
    XDG_CACHE_HOME,
    XDG_CONFIG_DIRS,
    XDG_DATA_DIRS,
    XDG_RUNTIME_DIR
  } = env;

  const local = options.roaming === true ? APPDATA : LOCALAPPDATA;
  const data = resolve(env.XDG_DATA_HOME || local, subdir, 'Data');
  const config = resolve(env.XDG_CONFIG_HOME || APPDATA, subdir, 'Config');

  const dirs = {
    cache: resolve(XDG_CACHE_HOME || join(local), subdir, 'Cache'),
    config,
    config_dirs: [config].concat(split(XDG_CONFIG_DIRS)),
    data,
    data_dirs: [data].concat(split(XDG_DATA_DIRS)),
    runtime: resolve(XDG_RUNTIME_DIR || temp, subdir)
  };

  if (options.expanded === true) {
    return expand(dirs, options);
  }

  return dirs;
};

/**
 * Respect casing in user's existing paths
 */

xdg.resolve = resolve;

/**
 * Convenience aliases
 */

xdg.windows = xdg.win32;
xdg.macos = xdg.darwin;

/**
 * Expose "user dirs"
 */

xdg.userdirs = require('./lib/userdirs');

/**
 * Expose "xdg"
 */

module.exports = xdg;
