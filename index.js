'use strict';

const os = require('os');
const path = require('path');
const split = str => str ? str.split(path.delimiter) : [];
const title = str => str[0].toUpperCase() + str.slice(1);
const homedir = platform => {
  return os.homedir() || (platform === 'win32' ? os.tmpdir() : '/usr/local/share');
};

const xdg = (options = {}) => {
  const cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
  const platform = options.platform || process.platform;
  const folder = options.folder;
  const home = options.homedir || homedir(platform);
  const env = options.env || process.env;
  const fn = xdg[platform];

  if (typeof fn !== 'function') {
    throw new Error(`Platform "${platform}" is not supported`);
  }

  const paths = fn(home, env);
  const resolve = dir => folder ? xdg.resolve(dir, folder) : dir;

  return {
    cache: resolve(options.cacheDir || paths.cache),
    config: resolve(options.configDir || paths.config),
    configDirs: [options.configDir || paths.config, ...paths.configDirs].map(resolve),
    data: resolve(options.dataDir || paths.data),
    dataDirs: [options.dataDir || paths.data, ...paths.dataDirs].map(resolve),
    runtime: resolve(options.runtimeDir || paths.runtime),

    // cache: {
    //   home: resolve(options.cacheDir || paths.cache)
    // },
    // config: {
    //   home: resolve(options.configDir || paths.config),
    //   dirs: [options.configDir || paths.config, ...paths.configDirs].map(resolve)
    // },
    // data: {
    //   home: resolve(options.dataDir || paths.data),
    //   dirs: [options.dataDir || paths.data, ...paths.dataDirs].map(resolve)
    // },
    // runtime: {
    //   home: resolve(options.runtimeDir || paths.runtime)
    // },

    /**
     * Non-standard directories
     */

    cwd,
    home,
    temp: resolve(os.tmpdir()),
    logs: resolve(options.logsDir || paths.logs),
    state: resolve(options.stateDir || paths.state)
  };
};

xdg.darwin = (home = os.homedir(), env = process.env) => {
  return {
    cache: env.XDG_CACHE_HOME || path.join(home, 'Library', 'Caches'),
    config: env.XDG_CONFIG_HOME || path.join(home, 'Library', 'Preferences'),
    configDirs: split(env.XDG_CONFIG_DIRS || '/etc/xdg'),
    data: env.XDG_DATA_HOME || path.join(home, 'Library', 'Application Support'),
    dataDirs: split(env.XDG_DATA_DIRS || '/usr/local/share/:/usr/share/'),
    logs: '',
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
    runtime: env.XDG_RUNTIME_DIR || env.TMPDIR,
    logs: env.XDG_LOG_DIR || '/var/log',
    state: env.XDG_STATE_DIR || path.join(home, '.local', 'state')
  };
};

xdg.win32 = (home = os.homedir(), env = process.env) => {
  const { APPDATA, LOCALAPPDATA } = env;
  const local = path.join(home, 'AppData', 'Local');
  const roaming = path.join(home, 'AppData', 'Roaming');
  const temp = os.tmpdir();

  return {
    cache: env.XDG_CACHE_HOME || temp,
    config: env.XDG_CONFIG_HOME || APPDATA || roaming,
    configDirs: split(env.XDG_CONFIG_DIRS) || [],
    data: env.XDG_DATA_HOME || LOCALAPPDATA || local,
    dataDirs: split(env.XDG_DATA_DIRS) || [],
    runtime: env.XDG_RUNTIME_DIR || temp,
    logs: env.XDG_LOG_DIR || path.join(home, 'Documents'),
    state: env.XDG_STATE_DIR || path.join(home, '.local', 'state')
  };
};

/**
 * Respect casing in user's existing paths
 */

xdg.resolve = (parentDir, folder = '') => {
  if (folder && /^[A-Z]/.test(path.basename(parentDir))) {
    return path.join(parentDir, title(folder));
  }
  if (folder) {
    return path.join(parentDir, folder);
  }
  return parentDir;
};

/**
 * Expose "xdg"
 */

xdg.windows = xdg.win32;
xdg.macos = xdg.darwin;
module.exports = xdg;

console.log('=== DARWIN ===');
console.log(xdg())
console.log()
console.log('=== LINUX ===');
console.log(xdg({ platform: 'linux' }))
console.log()
console.log('=== WINDOWS ===');
console.log(xdg({ platform: 'win32' }));
