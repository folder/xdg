/* eslint-disable no-invalid-this */

'use strict';

const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const userdirs = require('../lib/user-dirs');

const fixtures = path.join(__dirname, 'fixtures');
const { username } = os.userInfo();

describe('userdirs', () => {
  describe('.defaults()', () => {
    it('should return an object of default paths on darwin', () => {
      const paths = {
        conf: path.join(fixtures, 'darwin', 'Users/user'),
        etc: path.join(fixtures, 'darwin', 'etc')
      };

      const expected = {
        XDG_DESKTOP_DIR: `/Users/${username}/Desktop`,
        XDG_DOCUMENTS_DIR: `/Users/${username}/Documents`,
        XDG_DOWNLOAD_DIR: `/Users/${username}/Downloads`,
        XDG_MUSIC_DIR: `/Users/${username}/Music`,
        XDG_PICTURES_DIR: `/Users/${username}/Pictures`,
        XDG_PUBLICSHARE_DIR: `/Users/${username}/Public`,
        XDG_TEMPLATES_DIR: `/Users/${username}/Templates`,
        XDG_VIDEOS_DIR: `/Users/${username}/Videos`
      };

      const actual = userdirs.defaults({
        platform: 'darwin',
        homedir: paths.conf,
        etc: paths.etc
      });

      assert.deepStrictEqual(actual, expected);
    });

    it('should return an object of default paths on linux', () => {
      const paths = {
        conf: path.join(fixtures, 'linux', 'Users/user'),
        etc: path.join(fixtures, 'linux', 'etc')
      };

      const expected = {
        XDG_DESKTOP_DIR: `/Users/${username}/Desktop`,
        XDG_DOCUMENTS_DIR: `/Users/${username}/Documents`,
        XDG_DOWNLOAD_DIR: `/Users/${username}/Downloads`,
        XDG_MUSIC_DIR: `/Users/${username}/Music`,
        XDG_PICTURES_DIR: `/Users/${username}/Pictures`,
        XDG_PUBLICSHARE_DIR: `/Users/${username}/Public`,
        XDG_TEMPLATES_DIR: `/Users/${username}/Templates`,
        XDG_VIDEOS_DIR: `/Users/${username}/Videos`
      };

      const actual = userdirs.defaults({
        platform: 'linux',
        homedir: paths.conf,
        etc: paths.etc
      });

      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('.dirs()', () => {
    it('should return an object of paths from user-dirs.dirs on darwin', () => {
      const platform = 'darwin';

      const paths = {
        conf: path.join(fixtures, platform, 'Users/user'),
        etc: path.join(fixtures, platform, 'etc')
      };

      const expected = {
        XDG_DESKTOP_DIR: `/Users/${username}/Desktop`,
        XDG_DOCUMENTS_DIR: `/Users/${username}/Documents`,
        XDG_DOWNLOAD_DIR: `/Users/${username}/Downloads`,
        XDG_MUSIC_DIR: `/Users/${username}/Music`,
        XDG_PICTURES_DIR: `/Users/${username}/Pictures`,
        XDG_PUBLICSHARE_DIR: `/Users/${username}/Public`,
        XDG_TEMPLATES_DIR: `/Users/${username}/Templates`,
        XDG_VIDEOS_DIR: `/Users/${username}/Videos`
      };

      const actual = userdirs.dirs({
        platform,
        homedir: paths.conf,
        etc: paths.etc
      });

      assert.deepStrictEqual(actual, expected);
    });

    it('should return an object of paths from user-dirs.dirs on linux', () => {
      const platform = 'linux';

      const paths = {
        conf: path.join(fixtures, platform, 'Users/user'),
        etc: path.join(fixtures, platform, 'etc')
      };

      const expected = {
        XDG_DESKTOP_DIR: `/Users/${username}/Desktop`,
        XDG_DOCUMENTS_DIR: `/Users/${username}/Documents`,
        XDG_DOWNLOAD_DIR: `/Users/${username}/Downloads`,
        XDG_MUSIC_DIR: `/Users/${username}/Music`,
        XDG_PICTURES_DIR: `/Users/${username}/Pictures`,
        XDG_PUBLICSHARE_DIR: `/Users/${username}/Public`,
        XDG_TEMPLATES_DIR: `/Users/${username}/Templates`,
        XDG_VIDEOS_DIR: `/Users/${username}/Videos`
      };

      const actual = userdirs.dirs({
        platform,
        homedir: paths.conf,
        etc: paths.etc
      });

      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('.create()', () => {
    it('should return an object of paths for MacOS (darwin)', () => {
      const platform = 'darwin';

      const paths = {
        conf: path.join(fixtures, platform, 'Users/user'),
        etc: path.join(fixtures, platform, 'etc')
      };

      const expected = {
        XDG_DESKTOP_DIR: `/Users/${username}/Desktop`,
        XDG_DOCUMENTS_DIR: `/Users/${username}/Documents`,
        XDG_DOWNLOAD_DIR: `/Users/${username}/Downloads`,
        XDG_MUSIC_DIR: `/Users/${username}/Music`,
        XDG_PICTURES_DIR: `/Users/${username}/Pictures`,
        XDG_PUBLICSHARE_DIR: `/Users/${username}/Public`,
        XDG_TEMPLATES_DIR: `/Users/${username}/Templates`,
        XDG_VIDEOS_DIR: `/Users/${username}/Videos`
      };

      const actual = userdirs.create({
        platform,
        homedir: paths.conf,
        etc: paths.etc
      });

      assert.deepStrictEqual(actual, expected);
    });

    it('should return an object of paths for linux', () => {
      const platform = 'linux';

      const paths = {
        conf: path.join(fixtures, platform, 'Users/user'),
        etc: path.join(fixtures, platform, 'etc')
      };

      const expected = {
        XDG_DESKTOP_DIR: `/Users/${username}/Desktop`,
        XDG_DOCUMENTS_DIR: `/Users/${username}/Documents`,
        XDG_DOWNLOAD_DIR: `/Users/${username}/Downloads`,
        XDG_MUSIC_DIR: `/Users/${username}/Music`,
        XDG_PICTURES_DIR: `/Users/${username}/Pictures`,
        XDG_PUBLICSHARE_DIR: `/Users/${username}/Public`,
        XDG_TEMPLATES_DIR: `/Users/${username}/Templates`,
        XDG_VIDEOS_DIR: `/Users/${username}/Videos`
      };

      const actual = userdirs.create({
        platform,
        homedir: paths.conf,
        etc: paths.etc
      });

      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('.darwin()', () => {
    it('should return an object of paths for MacOS', () => {
      const expected = {
        conf: '/etc/xdg/user-dirs.conf',
        defaults: '/etc/xdg/user-dirs.defaults',
        dirs: `/Users/${username}/Library/Application Support/user-dirs.dirs`
      };

      const actual = userdirs.darwin();
      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('.linux()', () => {
    it('should return an object of paths for Linux', () => {
      const expected = {
        conf: '/etc/xdg/user-dirs.conf',
        defaults: '/etc/xdg/user-dirs.defaults',
        dirs: `/Users/${username}/.config/user-dirs.dirs`
      };
      const actual = userdirs.linux();
      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('.win32()', () => {
    it('should return an object of paths for Windows', () => {
      const expected = {
        conf: `/Users/${username}/user-dirs.conf`,
        defaults: `/Users/${username}/user-dirs.defaults`,
        dirs: `/Users/${username}/AppData/Roaming/user-dirs.dirs`
      };
      const actual = userdirs.win32();
      assert.deepStrictEqual(actual, expected);
    });
  });
});
