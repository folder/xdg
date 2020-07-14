'use strict';

const isWindows = process.platform === 'win32';
const path = require('path');
const utils = require('./utils');
const { homedir, load } = utils;

/**
 * Get the XDG Base Directory paths for Linux, or the equivalents for Windows or MaxOS.
 * @name userdirs()
 * @param {Object} `options`
 * @return {Object} Returns an object of paths for the current platform.
 * @api public
 */

const userdirs = (options = {}) => {
  const platform = options.platform || (isWindows ? 'win32' : 'linux');
  const fn = userdirs[platform];

  if (typeof fn !== 'function') {
    throw new Error(`Platform "${platform}" is not supported`);
  }

  return fn(options);
};

/**
 * Expand the user dirs object
 * @name userdirs()
 * @param {Object} `options`
 * @return {Object} Returns an object of paths for the current platform.
 * @api public
 */

userdirs.expand = (options = {}, paths = userdirs(options)) => {
  const platform = options.platform || (isWindows ? 'win32' : 'linux');
  const home = options.homedir || homedir(platform);
  const resolve = filepath => path.join(home, filepath);

  const data = {
    paths,
    config: () => userdirs.load(paths.conf, options),
    defaults: () => userdirs.load(paths.defaults, options, resolve),
    dirs: () => userdirs.load(paths.dirs, options, resolve),
    create: () => {
      const config = data.config();
      const obj = Object.create(null);

      if (config.enabled !== false) {
        return Object.assign(obj, data.defaults(), data.dirs());
      }

      return obj;
    }
  };

  return data;
};

/**
 * Get XDG equivalent paths for MacOS. Used by the main export when `process.platform`
 * is `darwin`. Aliased as `userdirs.macos()`.
 *
 * ```js
 * const dirs = userdirs.darwin();
 * // or
 * const dirs = userdirs.macos();
 * ```
 * @param {Object} `options`
 * @return {Object} Returns an object of paths.
 * @api public
 */

userdirs.darwin = (options = {}) => {
  const env = options.env || process.env;

  const etc = '/etc/xdg';
  const home = options.homedir || homedir('darwin');
  const lib = path.join(home, 'Library');
  const app = env.XDG_CONFIG_HOME || path.join(lib, 'Application Support');

  return {
    conf: env.XDG_USER_DIRS_CONF || path.join(etc, 'user-dirs.conf'),
    defaults: env.XDG_USER_DIRS_DEFAULTS || path.join(etc, 'user-dirs.defaults'),
    dirs: env.XDG_USER_DIRS || path.join(app, 'user-dirs.dirs')
  };
};

/**
 * Get XDG equivalent paths for Linux. Used by the main export when `process.platform`
 * is `linux`.
 *
 * ```js
 * const dirs = userdirs.linux();
 * ```
 * @return {Object} Returns an object of paths.
 * @return {Object} Returns an object of paths.
 * @api public
 */

userdirs.linux = (options = {}) => {
  const env = options.env || process.env;
  const home = options.homedir || homedir('linux');
  const config = env.XDG_CONFIG_HOME || path.join(home, '.config');
  const etc = '/etc/xdg';

  return {
    conf: env.XDG_USER_DIRS_CONF || path.join(etc, 'user-dirs.conf'),
    defaults: env.XDG_USER_DIRS_DEFAULTS || path.join(etc, 'user-dirs.defaults'),
    dirs: env.XDG_USER_DIRS || path.join(config, 'user-dirs.dirs')
  };
};

/**
 * Get XDG equivalent paths for MacOS. Used by the main export when `process.platform`
 * is `win32`. Aliased as `userdirs.windows()`.
 *
 * ```js
 * const dirs = userdirs.win32();
 * // or
 * const dirs = userdirs.windows();
 * ```
 * @param {Object} `options`
 * @return {Object} Returns an object of paths.
 * @api public
 */

userdirs.win32 = (options = {}) => {
  const env = options.env || process.env;
  const home = options.homedir || homedir('win32');

  const { APPDATA = path.join(home, 'AppData', 'Roaming') } = env;
  const appdata = env.XDG_CONFIG_HOME || APPDATA;

  return {
    conf: env.XDG_USER_DIRS_CONF || path.join(home, 'user-dirs.conf'),
    defaults: env.XDG_USER_DIRS_DEFAULTS || path.join(home, 'user-dirs.defaults'),
    dirs: env.XDG_USER_DIRS || path.join(appdata, 'user-dirs.dirs')
  };
};

/**
 * Load the contents of `user-dirs.conf`, if one exists in user home.
 *
 * ```js
 * const config = userdirs.conf();
 * console.log(config);
 * ```
 * @param {Object} `options`
 * @return {Object} Returns configur
 * @api public
 */

userdirs.conf = options => {
  const dirs = userdirs({ ...options, load: false });
  return userdirs.load(dirs.paths.conf, options);
};

/**
 * Load the contents of `user-dirs.defaults`, if one exists in user home.
 *
 * ```js
 * const dirs = userdirs.win32();
 * // or
 * const dirs = userdirs.windows();
 * ```
 * @param {Object} `options`
 * @return {Object} Returns an object of paths.
 * @api public
 */

userdirs.defaults = (options = {}) => {
  const platform = options.platform || (isWindows ? 'win32' : 'linux');
  const home = options.homedir || homedir(platform);
  const dirs = userdirs({ ...options, load: false });
  const resolve = filepath => path.join(home, filepath);
  return userdirs.load(dirs.paths.defaults, options, resolve);
};

/**
 * Load the contents of `user-dirs.dirs`, if one exists in user home.
 *
 * ```js
 * const dirs = userdirs.win32();
 * // or
 * const dirs = userdirs.windows();
 * ```
 * @param {Object} `options`
 * @return {Object} Returns an object of paths.
 * @api public
 */

userdirs.dirs = options => {
  const platform = options.platform || (isWindows ? 'win32' : 'linux');
  const home = options.homedir || homedir(platform);
  const dirs = userdirs({ ...options, load: false });
  const resolve = filepath => path.join(home, filepath);
  return userdirs.load(dirs.paths.dirs, options, resolve);
};

/**
 * Convenience methods
 */

userdirs.load = load;
userdirs.windows = userdirs.win32;
userdirs.macos = userdirs.darwin;

/**
 * Expose "userdirs"
 */

module.exports = userdirs;
