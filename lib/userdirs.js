'use strict';

const isWindows = process.platform === 'win32';
const path = require('path');
const utils = require('./utils');
const { homedir, load } = utils;

/**
 * Get the XDG User Directories for Linux, or equivalents for Windows or MaxOS.
 *
 * @name .userdirs()
 * @param {Object} `options`
 * @return {Object} Returns an object of directory paths.
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
 * Returns an object to with paths to `user-dirs.*` files, as well as functions to
 * load each file.
 *
 * @name .userdirs.expand()
 * @param {Object} `options`
 * @param {Object} `paths` Optionally pass the paths from the `userdirs()` function to avoid creating them again.
 * @return {Object} Returns an object with a `paths` object, and `config`, `defaults`, `dirs`, and `create` functions for actually loading the user-dir files.
 * @api public
 */

userdirs.expand = (options = {}, paths = userdirs(options)) => {
  const home = userdirs.home(options);
  const resolve = filepath => path.join(home, filepath);

  const data = {
    paths,
    config: opts => userdirs.load(paths.conf, { ...options, ...opts }),
    defaults: opts => userdirs.load(paths.defaults, { ...options, ...opts }, resolve),
    dirs: opts => userdirs.load(paths.dirs, { ...options, ...opts }, resolve),
    create: opts => {
      const config = data.config(opts);

      if (config.enabled !== false) {
        return Object.assign(data.defaults(opts), data.dirs(opts));
      }

      return {};
    }
  };

  return data;
};

/**
 * Loads and parses the contents of `user-dirs.conf`, if one exists in user home.
 *
 * ```js
 * const config = userdirs.conf();
 * console.log(config);
 * //=> { enabled: true, filename_encoding: 'UTF-8' }
 * ```
 * @name .userdirs.conf()
 * @param {Object} `options`
 * @return {Object} Returns configur
 * @api public
 */

userdirs.conf = options => {
  const dirs = userdirs({ ...options, load: false });
  return userdirs.load(dirs.conf, options);
};

/**
 * Loads and parses the contents of `user-dirs.defaults`, if one exists in user home.
 *
 * ```js
 * const defaults = userdirs.defaults();
 * console.log(defaults);
 * ```
 * // Example results:
 * // {
 * //   XDG_DESKTOP_DIR: '/Users/jonschlinkert/Desktop',
 * //   XDG_DOWNLOAD_DIR: '/Users/jonschlinkert/Downloads',
 * //   XDG_TEMPLATES_DIR: '/Users/jonschlinkert/Templates',
 * //   XDG_PUBLICSHARE_DIR: '/Users/jonschlinkert/Public',
 * //   XDG_DOCUMENTS_DIR: '/Users/jonschlinkert/Documents',
 * //   XDG_MUSIC_DIR: '/Users/jonschlinkert/Music',
 * //   XDG_PICTURES_DIR: '/Users/jonschlinkert/Pictures',
 * //   XDG_VIDEOS_DIR: '/Users/jonschlinkert/Videos'
 * // }
 * @name .userdirs.defaults()
 * @param {Object} `options`
 * @return {Object} Returns an object of paths.
 * @api public
 */

userdirs.defaults = (options = {}) => {
  const home = userdirs.home(options);
  const dirs = userdirs({ ...options, load: false });
  const resolve = filepath => path.join(home, filepath);
  return userdirs.load(dirs.defaults, options, resolve);
};

/**
 * Loads and parses the contents of `user-dirs.dirs`, if one exists in user home.
 *
 * ```js
 * const dirs = userdirs.dirs();
 * console.log(dirs);
 * // Example results:
 * // {
 * //   XDG_MUSIC_DIR: '/Users/jonschlinkert/Documents/Music',
 * //   XDG_PICTURES_DIR: '/Users/jonschlinkert/Documents/Pictures',
 * //   XDG_TEMPLATES_DIR: '/Users/jonschlinkert/Documents/Templates',
 * //   XDG_VIDEOS_DIR: '/Users/jonschlinkert/Documents/Videos'
 * // }
 * ```
 * @name .userdirs.dirs()
 * @param {Object} `options`
 * @return {Object} Returns an object of paths.
 * @api public
 */

userdirs.dirs = (options = {}) => {
  const home = userdirs.home(options);
  const dirs = userdirs({ ...options, load: false });
  const resolve = filepath => path.join(home, filepath);
  return userdirs.load(dirs.dirs, options, resolve);
};

/**
 * Get the actual XDG User Directories to use for MacOS. Gets the `user-dirs.conf`,
 * `user-dirs.defaults`, and the `user-dirs.dirs` files and, if not disabled in
 * `user-dirs.conf`, merges the values in defaults and dirs to create the paths to use.
 *
 * ```js
 * const dirs = userdirs.create();
 * console.log(dirs);
 * // Example results:
 * // {
 * //   XDG_DESKTOP_DIR: '/Users/jonschlinkert/Desktop',
 * //   XDG_DOWNLOAD_DIR: '/Users/jonschlinkert/Downloads',
 * //   XDG_TEMPLATES_DIR: '/Users/jonschlinkert/Documents/Templates',
 * //   XDG_PUBLICSHARE_DIR: '/Users/jonschlinkert/Public',
 * //   XDG_DOCUMENTS_DIR: '/Users/jonschlinkert/Documents',
 * //   XDG_MUSIC_DIR: '/Users/jonschlinkert/Documents/Music',
 * //   XDG_PICTURES_DIR: '/Users/jonschlinkert/Documents/Pictures',
 * //   XDG_VIDEOS_DIR: '/Users/jonschlinkert/Documents/Videos'
 * // }
 * ```
 * @name .userdirs.create()
 * @param {Object} `options`
 * @return {Object} Returns an object of paths.
 * @api public
 */

userdirs.create = (...args) => userdirs.expand(...args).create();

/**
 * Get the XDG User Directories for MacOS. This method is used by the main function
 * when `process.platform` is `darwin`. Exposed as a method so you can call it directly
 * if necessary. Also aliased as `userdirs.macos()`.
 *
 * ```js
 * const { dirs, conf, defaults } = userdirs.darwin(); // or userdirs.macos();
 * ```
 * @name .userdirs.darwin()
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
 * Gets the XDG User Directories for Linux. Used by the main export when
 * `process.platform` is `linux`.
 *
 * ```js
 * const { dirs, conf, defaults } = userdirs.linux();
 * ```
 * @name .userdirs.linux()
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
 * Gets the XDG User Directories for MacOS. Used by the `userdirs()` function when
 * `process.platform` is `win32`. Also aliased as `userdirs.windows()`.
 *
 * ```js
 * const { dirs, conf, defaults } = userdirs.win32(); // or userdirs.windows();
 * ```
 * @name .userdirs.win32()
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
 * Convenience methods
 */

userdirs.home = (options = {}) => {
  const platform = options.platform || (isWindows ? 'win32' : 'linux');
  return options.homedir || homedir(platform);
};
userdirs.load = load;
userdirs.windows = userdirs.win32;
userdirs.macos = userdirs.darwin;

/**
 * Expose "userdirs"
 */

module.exports = userdirs;
