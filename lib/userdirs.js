'use strict';

const isWindows = process.platform === 'win32';
const fs = require('fs');
const path = require('path');
const { homedir, formatKey, formatValue } = require('./utils');

const createConfig = (options = {}) => {
  const platform = options.platform || (isWindows ? 'win32' : 'linux');
  const home = options.homedir || homedir(platform);
  return { platform, home };
};

/**
 * Get the XDG Base Directory paths for Linux, or the equivalents for Windows or MaxOS.
 * @name userdirs()
 * @param {Object} `options`
 * @return {Object} Returns an object of paths for the current platform.
 * @api public
 */

const userdirs = (options = {}) => {
  const { home, platform } = createConfig(options);
  const fn = userdirs[platform];

  if (typeof fn !== 'function') {
    throw new Error(`Platform "${platform}" is not supported`);
  }

  const resolve = filepath => path.join(home, filepath);
  const paths = fn(options);
  const config = userdirs.load(paths.conf, options);
  const result = { config, paths, defaults: {}, dirs: {} };

  if (config.enabled !== false && options.load !== false) {
    result.defaults = userdirs.load(paths.defaults, options, resolve);
    result.dirs = userdirs.load(paths.dirs, options, resolve);
  }

  return result;
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

  const etc = '/etc/userdirs';
  const home = options.homedir || homedir('darwin');
  const lib = path.join(home, 'Library');
  const bare = path.resolve(env.XDG_CONFIG_HOME || path.join(lib, 'Application Support'));

  return {
    home,
    conf: env.XDG_USER_DIRS_CONF || path.join(etc, 'user-dirs.conf'),
    defaults: env.XDG_USER_DIRS_DEFAULTS || path.join(etc, 'user-dirs.defaults'),
    dirs: env.XDG_USER_DIRS || path.join(bare, 'user-dirs.dirs')
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
  const bare = path.resolve(env.XDG_CONFIG_HOME || path.join(home, '.config'));
  const etc = '/etc/userdirs';

  return {
    home,
    conf: env.XDG_USER_DIRS_CONF || path.join(etc, 'user-dirs.conf'),
    defaults: env.XDG_USER_DIRS_DEFAULTS || path.join(etc, 'user-dirs.defaults'),
    dirs: env.XDG_USER_DIRS || path.join(bare, 'user-dirs.dirs')
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

  const bare = path.resolve(env.XDG_CONFIG_HOME || APPDATA, 'Config');
  const sys = env.SYSTEMDRIVE || env.HOMEDRIVE || 'C:';
  const all = env.ALLUSERSPROFILE || env.PROGRAMDATA || path.join(sys, 'ProgramData');

  return {
    home,
    conf: env.XDG_USER_DIRS_CONF || path.join(all, 'user-dirs.conf'),
    defaults: env.XDG_USER_DIRS_DEFAULTS || path.join(all, 'user-dirs.defaults'),
    dirs: env.XDG_USER_DIRS || path.join(bare, 'user-dirs.dirs')
  };
};

userdirs.conf = options => {
  const { paths } = userdirs({ ...options, load: false });
  return userdirs.load(paths.conf, options);
};

userdirs.defaults = options => {
  const { home } = createConfig(options);
  const { paths } = userdirs({ ...options, load: false });
  const resolve = filepath => path.join(home, filepath);
  return userdirs.load(paths.defaults, options, resolve);
};

userdirs.dirs = options => {
  const { home } = createConfig(options);
  const { paths } = userdirs({ ...options, load: false });
  const resolve = filepath => path.join(home, filepath);
  return userdirs.load(paths.dirs, options, resolve);
};

userdirs.load = (filepath, options = {}, resolve = fp => fp) => {
  const format = options.format !== false && !filepath.endsWith('.conf');
  const data = {};

  if (fs.existsSync(filepath)) {
    const contents = fs.readFileSync(filepath, 'utf8');

    for (const line of contents.split(/[\r\n]+/)) {
      if (line.trim() !== '' && !line.startsWith('#')) {
        const [key, value] = line.split(/\s*=\s*/);
        data[format !== false ? formatKey(key) : key] = resolve(formatValue(value));
      }
    }
  }

  return data;
};

/**
 * Convenience aliases
 */

userdirs.windows = userdirs.win32;
userdirs.macos = userdirs.darwin;

/**
 * Expose "userdirs"
 */

module.exports = userdirs;
