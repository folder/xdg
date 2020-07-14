'use strict';

const isWindows = process.platform === 'win32';
const os = require('os');
const path = require('path');
const join = path.join;
const expand = require('./lib/expand');
const { homedir, load, resolve, split } = require('./lib/utils');

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
  const bare = resolve(env.XDG_CONFIG_HOME || join(lib, 'Application Support'));
  const config = resolve(env.XDG_CONFIG_HOME || join(lib, 'Application Support'), subdir);
  const etc = '/etc/xdg';

  const dirs = {
    cache: resolve(env.XDG_CACHE_HOME || join(lib, 'Caches'), subdir),
    config,
    config_dirs: [config].concat(split(env.XDG_CONFIG_DIRS || etc)),
    data,
    data_dirs: [data].concat(split(env.XDG_DATA_DIRS || '/usr/local/share/:/usr/share/')),
    runtime: resolve(env.XDG_RUNTIME_DIR || temp, subdir),
    user_dirs_conf: env.XDG_USER_DIRS_CONF || join(etc, 'user-dirs.conf'),
    user_dirs_global: env.XDG_USER_DIRS_DEFAULTS || join(etc, 'user-dirs.defaults'),
    user_dirs: env.XDG_USER_DIRS || join(bare, 'user-dirs.dirs'),
    load(type = 'dirs', opt) {
      return load(dirs[`user_${type}`], { ...options, ...opt });
    }
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
  const bare = resolve(env.XDG_CONFIG_HOME || join(home, '.config'));
  const config = resolve(env.XDG_CONFIG_HOME || join(home, '.config'), subdir);
  const etc = '/etc/xdg';

  const dirs = {
    cache: resolve(env.XDG_CACHE_HOME || join(home, '.cache'), subdir),
    config,
    config_dirs: [config].concat(split(env.XDG_CONFIG_DIRS || etc)),
    data,
    data_dirs: [data].concat(split(env.XDG_DATA_DIRS || '/usr/local/share/:/usr/share/')),
    runtime: resolve(env.XDG_RUNTIME_DIR || temp, subdir),
    user_dirs_conf: env.XDG_USER_DIRS_CONF || join(etc, 'user-dirs.conf'),
    user_dirs_global: env.XDG_USER_DIRS_DEFAULTS || join(etc, 'user-dirs.defaults'),
    user_dirs: env.XDG_USER_DIRS || join(bare, 'user-dirs.dirs'),
    load(type = 'dirs', opt) {
      return load(dirs[`user_${type}`], { ...options, ...opt });
    }
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
    ALLUSERSPROFILE,
    APPDATA = join(home, 'AppData', 'Roaming'),
    HOMEDRIVE = '',
    LOCALAPPDATA = join(home, 'AppData', 'Local'),
    PROGRAMDATA,
    SYSTEMDRIVE = 'C:',

    // XDG Base Dir variables
    XDG_CACHE_HOME,
    XDG_CONFIG_DIRS,
    XDG_DATA_DIRS,
    XDG_RUNTIME_DIR,

    // XDG User Dirs variables
    XDG_USER_DIRS_CONF,
    XDG_USER_DIRS_DEFAULTS,
    XDG_USER_DIRS
  } = env;

  const local = options.roaming === true ? APPDATA : LOCALAPPDATA;
  const data = resolve(env.XDG_DATA_HOME || local, subdir, 'Data');
  const bare = resolve(env.XDG_CONFIG_HOME || APPDATA, 'Config');
  const config = resolve(env.XDG_CONFIG_HOME || APPDATA, subdir, 'Config');
  const sys = SYSTEMDRIVE || HOMEDRIVE || '';
  const all = ALLUSERSPROFILE || PROGRAMDATA || join(sys, 'ProgramData');

  const dirs = {
    cache: resolve(XDG_CACHE_HOME || join(local), subdir, 'Cache'),
    config,
    config_dirs: [config].concat(split(XDG_CONFIG_DIRS)),
    data,
    data_dirs: [data].concat(split(XDG_DATA_DIRS)),
    runtime: resolve(XDG_RUNTIME_DIR || temp, subdir),
    user_dirs_conf: XDG_USER_DIRS_CONF || join(all, 'user-dirs.conf'),
    user_dirs_global: XDG_USER_DIRS_DEFAULTS || join(all, 'user-dirs.defaults'),
    user_dirs: XDG_USER_DIRS || join(bare, 'user-dirs.dirs'),
    load(type = 'dirs', opt) {
      return load(dirs[`user_${type}`], { ...options, ...opt });
    }
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
 * Expose "xdg"
 */

module.exports = xdg;

// const fs = require('fs');
// const paths = xdg({ subdir: 'toolkit', expanded: true, userdirs: false });
// console.log(paths);

