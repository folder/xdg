'use strict';

const isWindows = process.platform === 'win32';
const os = require('os');
const path = require('path');
const join = path.join;
const expand = require('./lib/expand');
const { homedir, load, resolve, split } = require('./lib/utils');

/**
 * Get the XDG Base Directory paths for Linux, or equivalent paths for Windows or MaxOS.
 * @name xdg
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

  const lib = () => join(home, 'Library');
  const app = () => join(lib(), 'Application Support');
  const caches = () => join(lib(), 'Caches');

  const temp = options.tempdir || os.tmpdir();
  const home = options.homedir || homedir('darwin');
  const data = resolve(env.XDG_DATA_HOME || app(), subdir);
  const config = resolve(env.XDG_CONFIG_HOME || app(), subdir);
  const cch = resolve(env.XDG_CACHE_HOME || caches(), subdir);
  const etc = '/etc/xdg';

  const dirs = {
    cache: cch,
    config,
    config_dirs: [config, ...split(env.XDG_CONFIG_DIRS || etc)],
    data,
    data_dirs: [data, ...split(env.XDG_DATA_DIRS || '/usr/local/share/:/usr/share/')],
    runtime: resolve(env.XDG_RUNTIME_DIR || temp, subdir),
    logs: join(cch, 'logs')
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

  const cache = () => join(home, '.cache');
  const config = () => join(home, '.config');
  const share = () => join(home, '.local', 'share');

  const temp = options.tempdir || os.tmpdir();
  const home = options.homedir || homedir('linux');
  const data = resolve(env.XDG_DATA_HOME || share(), subdir);
  const cfg = resolve(env.XDG_CONFIG_HOME || config(), subdir);
  const cch = resolve(env.XDG_CACHE_HOME || cache(), subdir);
  const etc = '/etc/xdg';

  const dirs = {
    cache: cch,
    config: cfg,
    config_dirs: [cfg, ...split(env.XDG_CONFIG_DIRS || etc)],
    data,
    data_dirs: [data, ...split(env.XDG_DATA_DIRS || '/usr/local/share/:/usr/share/')],
    runtime: resolve(env.XDG_RUNTIME_DIR || temp, subdir),
    logs: join(cch, 'logs')
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
  const appdata = env.XDG_CONFIG_HOME || APPDATA;
  const cache = resolve(XDG_CACHE_HOME || local, subdir, 'Cache');
  const config = resolve(appdata, subdir, 'Config');

  const dirs = {
    cache,
    config,
    config_dirs: [config, ...split(XDG_CONFIG_DIRS)],
    data,
    data_dirs: [data, ...split(XDG_DATA_DIRS)],
    runtime: resolve(XDG_RUNTIME_DIR || temp, subdir),
    logs: join(cache, 'logs')
  };

  if (options.expanded === true) {
    return expand(dirs, options);
  }

  return dirs;
};

/**
 * Convenience methods
 */

xdg.load = load;
xdg.resolve = resolve;
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
