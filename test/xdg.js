'use strict';

const os = require('node:os');
const assert = require('node:assert/strict');
const xdg = require('..');

const { username } = os.userInfo();

describe('xdg', () => {
  it('should throw an error for unsupported platforms', () => {
    assert.throws(() => xdg({ platform: 'unsupported' }), /Platform "unsupported" is not supported/);
  });

  it('should return paths for linux platforms', () => {
    const paths = xdg({ platform: 'linux' });

    assert.ok(paths.cache.endsWith('/.cache'));
    assert.ok(paths.config.endsWith('/.config'));

    if (username) {
      assert.equal(paths.cache, `/Users/${username}/.cache`);
      assert.equal(paths.logs, `/Users/${username}/.cache/logs`);
      assert.equal(paths.config, `/Users/${username}/.config`);
      assert.equal(paths.state, `/Users/${username}/.local/state`);
      assert.equal(paths.data, `/Users/${username}/.local/share`);
    }
  });

  it('should return paths for linux platforms', () => {
    const paths = xdg({ platform: 'darwin' });

    delete paths.create;
    delete paths.runtime;

    if (username) {
      assert.deepStrictEqual(paths, {
        cache: `/Users/${username}/Library/Caches`,
        state: `/Users/${username}/Library/Application Support`,
        config: `/Users/${username}/Library/Application Support`,
        config_dirs: [`/Users/${username}/Library/Application Support`, '/etc/xdg'],
        data: `/Users/${username}/Library/Application Support`,
        data_dirs: [
          `/Users/${username}/Library/Application Support`,
          '/usr/local/share/',
          '/usr/share/'
        ],
        logs: `/Users/${username}/Library/Caches/logs`
      });
    }

    assert.ok(paths.cache.endsWith('/Library/Caches'));
    assert.ok(paths.config.endsWith('/Library/Application Support'));
  });

  it('should return paths for windows platforms', () => {
    const paths = xdg({ platform: 'win32' });

    delete paths.create;
    delete paths.runtime;

    if (username) {
      assert.deepStrictEqual(paths, {
        cache: `/Users/${username}/AppData/Local/Cache`,
        state: `/Users/${username}/AppData/Local/xdg`,
        config: `/Users/${username}/AppData/Roaming/Config`,
        config_dirs: [`/Users/${username}/AppData/Roaming/Config`],
        data: `/Users/${username}/AppData/Local/Data`,
        data_dirs: [`/Users/${username}/AppData/Local/Data`],
        logs: `/Users/${username}/AppData/Local/Cache/logs`
      });
    }

    assert.ok(paths.cache.endsWith('/AppData/Local/Cache'));
    assert.ok(paths.config.endsWith('/AppData/Roaming/Config'));
  });
});
