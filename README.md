# @folder/xdg [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=W8YFZ425KND68) [![NPM version](https://img.shields.io/npm/v/@folder/xdg.svg?style=flat)](https://www.npmjs.com/package/@folder/xdg) [![NPM monthly downloads](https://img.shields.io/npm/dm/@folder/xdg.svg?style=flat)](https://npmjs.org/package/@folder/xdg) [![NPM total downloads](https://img.shields.io/npm/dt/@folder/xdg.svg?style=flat)](https://npmjs.org/package/@folder/xdg)

> Get cross-platform XDG Base Directories or their equivalents. Works with Linux, Windows, or MacOS. No dependencies.

Please consider following this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), and consider starring the project to show your :heart: and support.

## Install

Install with [npm](https://www.npmjs.com/) (requires [Node.js](https://nodejs.org/en/) >=8):

```sh
$ npm install --save @folder/xdg
```

## Usage

Add the following line of code to your [Node.js](https://nodejs.org/) application:

```js
const xdg = require('@folder/xdg');
```

The main export is a function that may be called with an options object:

```js
const dirs = xdg(/* options */);
console.log(dirs);

/* This output is on MacOS, see examples for Linux and Windows below */
console.log(dirs.config); // => '/Users/jonschlinkert/Library/Preferences'
console.log(dirs.cache); // => '/Users/jonschlinkert/Library/Caches'
console.log(dirs.data); // => '/Users/jonschlinkert/Library/Application Support'
```

See [example output](#examples) by platform.

## Options

<details>
<summary><strong>Click to see all available options</strong></summary>
<br>
The following options are available for customizing behavior and/or testing behavior.

| Option | Type | Description | Default Value |
| --- | --- | --- | --- |
| `cachedir`   | `string`   | Override the default `cachedir` | Platform specific, see [below](#examples) |
| `configdir`  | `string`   | Override the default `configdir` |  |
| `datadir`    | `string`   | Override the default `datadir` |  |
| `env`        | `object`   | The `env` object to use for getting paths. | `process.env` |
| `expanded`   | `boolean`  | Expand paths into an object. See the [Expanded Paths](#expanded-paths) example for more details. | undefined |
| `homedir`    | `string`   | The user's home directory. | `os.homedir()` |
| `platform`   | `string`   | The platform to use: `darwin`, `linux`, `win32` | `process.platform` |
| `resolve`    | `function` | Custom function for resolving paths to each directory. The default function attempts to respect casing in the user's existing directories. | undefined |
| `runtimedir` | `string`   | Override the default `runtimedir` |  |
| `subdir`     | `string`   | A sub-directory to join to the path, typically the name of your application. This path is joined differently on each platform. See [examples](#examples). | `xdg` |
| `tempdir`    | `string`   | The temp directory to use. | `os.tmpdir()` |

See [examples](#xamples) below.

</details>

## Examples

<details>
<summary><strong>Click to see example for platform-specific paths</strong></summary>
<br>
Get paths for a specific platform.
<br>

```js
console.log(xdg.darwin());
console.log(xdg.linux());
console.log(xdg.win32());
// or, if you want "expanded" paths (see the "expanded paths" example)
console.log(xdg({ expanded: true, platform: 'darwin' }));
console.log(xdg({ expanded: true, platform: 'linux' }));
console.log(xdg({ expanded: true, platform: 'win32' }));
```

</details>

<details>
<summary><strong>Click to see example with no options</strong></summary>
<br>
The following examples show what the paths look like when no options are passed.
<br>

```js
console.log(xdg());
```

### MacOS (darwin)

```js
{
  cache: '/Users/jonschlinkert/Library/Caches/xdg',
  config: '/Users/jonschlinkert/Library/Preferences/xdg',
  configdirs: [ '/Users/jonschlinkert/Library/Preferences/xdg', '/etc/xdg' ],
  data: '/Users/jonschlinkert/Library/Application Support/xdg',
  datadirs: [
    '/Users/jonschlinkert/Library/Application Support/xdg',
    '/usr/local/share/',
    '/usr/share/'
  ],
  runtime: '/var/folders/vd/53h736bj0_sg9gk04c89k0pr0000gq/T/xdg'
}
```

### Linux

```js
{
  cache: '/Users/jonschlinkert/.cache/xdg',
  config: '/Users/jonschlinkert/.config/xdg',
  configdirs: [ '/Users/jonschlinkert/.config/xdg', '/etc/xdg' ],
  data: '/Users/jonschlinkert/.local/share/xdg',
  datadirs: [
    '/Users/jonschlinkert/.local/share/xdg',
    '/usr/local/share/',
    '/usr/share/'
  ],
  runtime: '/var/folders/vd/53h736bj0_sg9gk04c89k0pr0000gq/T/xdg'
}
```

### Windows (win32)

```js
{
  cache: '/Users/jonschlinkert/AppData/Local/xdg/Cache',
  config: '/Users/jonschlinkert/AppData/Roaming/xdg/Config',
  configdirs: [ '/Users/jonschlinkert/AppData/Roaming/xdg/Config' ],
  data: '/Users/jonschlinkert/AppData/Local/xdg/Data',
  datadirs: [ '/Users/jonschlinkert/AppData/Local/xdg/Data' ],
  runtime: '/var/folders/vd/53h736bj0_sg9gk04c89k0pr0000gq/T/xdg'
}
```

</details>

<details>
<summary><strong>Click to see "expanded" paths example</strong></summary>
<br>
Running the following example returns an object with "expanded" paths, where `config` and `configdirs` are converted to `config.home` and `config.dirs`, etc. Additionally, `cwd`, `home` and `temp` paths are added for convenience.
<br>

```js
console.log(xdg({ expanded: true, subdir: 'FooBar' }));
```

**Extra directories**

Note that the `expanded` object includes four additional path properties for convenience:

* `cwd` - set via `options.cwd` or `process.cwd()`
* `home` - set via `options.homedir` or `os.homedir()`
* `temp` - set via `options.tempdir` or `os.tmpdir()`
* `cache.logs` - set at `path.join(cachedir, 'logs')`

### MacOS (darwin)

```js
{
  cwd: '/Users/jonschlinkert/dev/@folder/xdg',
  home: '/Users/jonschlinkert',
  temp: '/var/folders/vd/53h736bj0_sg9gk04c89k0pr0000gq/T',
  cache: { 
    home: '/Users/jonschlinkert/Library/Caches/FooBar',
    logs: '/Users/jonschlinkert/Library/Caches/FooBar/Logs' 
  },
  config: {
    home: '/Users/jonschlinkert/Library/Preferences/FooBar',
    dirs: [ '/Users/jonschlinkert/Library/Preferences/FooBar', '/etc/FooBar' ]
  },
  data: {
    home: '/Users/jonschlinkert/Library/Application Support/FooBar',
    dirs: [
      '/Users/jonschlinkert/Library/Application Support/FooBar',
      '/usr/local/share/',
      '/usr/share/'
    ]
  },
  runtime: { home: '/var/folders/vd/53h736bj0_sg9gk04c89k0pr0000gq/T/FooBar' }
}
```

### Linux

```js
{
  cwd: '/Users/jonschlinkert/dev/@folder/xdg',
  home: '/Users/jonschlinkert',
  temp: '/var/folders/vd/53h736bj0_sg9gk04c89k0pr0000gq/T',
  cache: { 
    home: '/Users/jonschlinkert/.cache/FooBar',
    logs: '/Users/jonschlinkert/.cache/FooBar/Logs'
  },
  config: {
    home: '/Users/jonschlinkert/.config/FooBar',
    dirs: [ '/Users/jonschlinkert/.config/FooBar', '/etc/FooBar' ]
  },
  data: {
    home: '/Users/jonschlinkert/.local/share/FooBar',
    dirs: [
      '/Users/jonschlinkert/.local/share/FooBar',
      '/usr/local/share/',
      '/usr/share/'
    ]
  },
  runtime: { home: '/var/folders/vd/53h736bj0_sg9gk04c89k0pr0000gq/T/FooBar' }
}
```

### Windows (win32)

```js
{
  cwd: '/Users/jonschlinkert/dev/@folder/xdg',
  home: '/Users/jonschlinkert',
  temp: '/var/folders/vd/53h736bj0_sg9gk04c89k0pr0000gq/T',
  cache: { 
    home: '/Users/jonschlinkert/AppData/Local/FooBar/Cache',
    logs: '/Users/jonschlinkert/AppData/Local/FooBar/Cache/Logs'
  },
  config: {
    home: '/Users/jonschlinkert/AppData/Roaming/FooBar/Config',
    dirs: [ '/Users/jonschlinkert/AppData/Roaming/FooBar/Config' ]
  },
  data: {
    home: '/Users/jonschlinkert/AppData/Local/FooBar/Data',
    dirs: [ '/Users/jonschlinkert/AppData/Local/FooBar/Data' ]
  },
  runtime: { home: '/var/folders/vd/53h736bj0_sg9gk04c89k0pr0000gq/T/FooBar' }
}
```

</details>

# API

Aside from the main export, `xdg()`, several platform-specific methods are exposed to simplify getting paths for specific platforms. Note that you can accomplish the same thing by passing the platform on the options to the main export, e.g. `{ platform: 'linux' }`.

The main export, and each method, returns an object with the following properties (see the [XDG Base Directories](#xdg-base-directory) docs below for more details on how each property is set):

* `cache`
* `config`
* `configdirs`
* `data`
* `datadirs`
* `runtime`

## Main Export

### [xdg](index.js#L18)

Get the XDG Base Directory paths for Linux, or equivalent paths for Windows or MaxOS.

**Params**

* `options` **{Object}**
* `returns` **{Object}**: Returns an object of paths for the current platform.

### [.darwin](index.js#L43)

Get XDG equivalent paths for MacOS. Used by the main export when `process.platform` is `darwin`. Aliased as `xdg.macos()`.

**Params**

* `options` **{Object}**
* `returns` **{Object}**: Returns an object of paths.

**Example**

```js
const dirs = xdg.darwin();
// or
const dirs = xdg.macos();
```

### [.linux](index.js#L83)

Get XDG equivalent paths for Linux. Used by the main export when `process.platform` is `linux`.

* `returns` **{Object}**: Returns an object of paths.
* `returns` **{Object}**: Returns an object of paths.

**Example**

```js
const dirs = xdg.linux();
```

### [.win32](index.js#L124)

Get XDG equivalent paths for MacOS. Used by the main export when `process.platform` is `win32`. Aliased as `xdg.windows()`.

**Params**

* `options` **{Object}**
* `returns` **{Object}**: Returns an object of paths.

**Example**

```js
const dirs = xdg.win32();
// or
const dirs = xdg.windows();
```

### [.userdirs()](lib/userdirs.js#L17)

Get the XDG User Directories for Linux, or equivalents for Windows or MaxOS.

**Params**

* `options` **{Object}**
* `returns` **{Object}**: Returns an object of directory paths.

### [.userdirs.expand()](lib/userdirs.js#L39)

Returns an object to with paths to `user-dirs.*` files, as well as functions to
load each file.

**Params**

* `options` **{Object}**
* `paths` **{Object}**: Optionally pass the paths from the `userdirs()` function to avoid creating them again.
* `returns` **{Object}**: Returns an object with a `paths` object, and `config`, `defaults`, `dirs`, and `create` functions for actually loading the user-dir files.

### [.userdirs.conf()](lib/userdirs.js#L77)

Loads and parses the contents of `user-dirs.conf`, if one exists in user home.

**Params**

* `options` **{Object}**
* `returns` **{Object}**: Returns configur

**Example**

```js
const config = userdirs.conf();
console.log(config);
//=> { enabled: true, filename_encoding: 'UTF-8' }
```

### [.userdirs.defaults()](lib/userdirs.js#L106)

Loads and parses the contents of `user-dirs.defaults`, if one exists in user home.

// Example results:
// {
//   XDG_DESKTOP_DIR: '/Users/jonschlinkert/Desktop',
//   XDG_DOWNLOAD_DIR: '/Users/jonschlinkert/Downloads',
//   XDG_TEMPLATES_DIR: '/Users/jonschlinkert/Templates',
//   XDG_PUBLICSHARE_DIR: '/Users/jonschlinkert/Public',
//   XDG_DOCUMENTS_DIR: '/Users/jonschlinkert/Documents',
//   XDG_MUSIC_DIR: '/Users/jonschlinkert/Music',
//   XDG_PICTURES_DIR: '/Users/jonschlinkert/Pictures',
//   XDG_VIDEOS_DIR: '/Users/jonschlinkert/Videos'
// }

**Params**

* `options` **{Object}**
* `returns` **{Object}**: Returns an object of paths.

**Example**

```js
const defaults = userdirs.defaults();
console.log(defaults);
```

### [.userdirs.dirs()](lib/userdirs.js#L133)

Loads and parses the contents of `user-dirs.dirs`, if one exists in user home.

**Params**

* `options` **{Object}**
* `returns` **{Object}**: Returns an object of paths.

**Example**

```js
const dirs = userdirs.dirs();
console.log(dirs);
// Example results:
// {
//   XDG_MUSIC_DIR: '/Users/jonschlinkert/Documents/Music',
//   XDG_PICTURES_DIR: '/Users/jonschlinkert/Documents/Pictures',
//   XDG_TEMPLATES_DIR: '/Users/jonschlinkert/Documents/Templates',
//   XDG_VIDEOS_DIR: '/Users/jonschlinkert/Documents/Videos'
// }
```

### [.userdirs.create()](lib/userdirs.js#L166)

Get the actual XDG User Directories to use for MacOS. Gets the `user-dirs.conf`, `user-dirs.defaults`, and the `user-dirs.dirs` files and, if not disabled in `user-dirs.conf`, merges the values in defaults and dirs to create the paths to use.

**Params**

* `options` **{Object}**
* `returns` **{Object}**: Returns an object of paths.

**Example**

```js
const dirs = userdirs.create();
console.log(dirs);
// Example results:
// {
//   XDG_DESKTOP_DIR: '/Users/jonschlinkert/Desktop',
//   XDG_DOWNLOAD_DIR: '/Users/jonschlinkert/Downloads',
//   XDG_TEMPLATES_DIR: '/Users/jonschlinkert/Documents/Templates',
//   XDG_PUBLICSHARE_DIR: '/Users/jonschlinkert/Public',
//   XDG_DOCUMENTS_DIR: '/Users/jonschlinkert/Documents',
//   XDG_MUSIC_DIR: '/Users/jonschlinkert/Documents/Music',
//   XDG_PICTURES_DIR: '/Users/jonschlinkert/Documents/Pictures',
//   XDG_VIDEOS_DIR: '/Users/jonschlinkert/Documents/Videos'
// }
```

### [.userdirs.darwin()](lib/userdirs.js#L182)

Get the XDG User Directories for MacOS. This method is used by the main function when `process.platform` is `darwin`. Exposed as a method so you can call it directly if necessary. Also aliased as `userdirs.macos()`.

**Params**

* `options` **{Object}**
* `returns` **{Object}**: Returns an object of paths.

**Example**

```js
const { dirs, conf, defaults } = userdirs.darwin(); // or userdirs.macos();
```

### [.userdirs.linux()](lib/userdirs.js#L210)

Gets the XDG User Directories for Linux. Used by the main export when `process.platform` is `linux`.

* `returns` **{Object}**: Returns an object of paths.
* `returns` **{Object}**: Returns an object of paths.

**Example**

```js
const { dirs, conf, defaults } = userdirs.linux();
```

### [.userdirs.win32()](lib/userdirs.js#L236)

Gets the XDG User Directories for MacOS. Used by the `userdirs()` function when `process.platform` is `win32`. Also aliased as `userdirs.windows()`.

**Params**

* `options` **{Object}**
* `returns` **{Object}**: Returns an object of paths.

**Example**

```js
const { dirs, conf, defaults } = userdirs.win32(); // or userdirs.windows();
```

## XDG Base Directories

This documentation is from the Arch Linux [XDG Base Directory](https://wiki.archlinux.org/index.php/XDG_Base_Directory) docs.

### User directories

* `XDG_CONFIG_HOME`

  - Where user-specific configurations should be written (analogous to `/etc`).
  - Should default to `$HOME/.config`.
* `XDG_CACHE_HOME`

  - Where user-specific non-essential (cached) data should be written (analogous to `/var/cache`).
  - Should default to `$HOME/.cache`.
* `XDG_DATA_HOME`

  - Where user-specific data files should be written (analogous to `/usr/share`).
  - Should default to `$HOME/.local/share`.
* `XDG_RUNTIME_DIR`

  - Used for non-essential, user-specific data files such as sockets, named pipes, etc.
  - Not required to have a default value; warnings should be issued if not set or equivalents provided.
  - Must be owned by the user with an access mode of `0700`.
  - Filesystem fully featured by standards of OS.
  - Must be on the local filesystem.
  - May be subject to periodic cleanup.
  - Modified every 6 hours or set sticky bit if persistence is desired.
  - Can only exist for the duration of the user's login.
  - Should not store large files as it may be mounted as a tmpfs.

### System directories

* `XDG_DATA_DIRS`

  - List of directories seperated by `:` (analogous to `PATH`).
  - Should default to `/usr/local/share:/usr/share`.
* `XDG_CONFIG_DIRS`

  - List of directories seperated by `:` (analogous to `PATH`).
  - Should default to `/etc/xdg`.

## About

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>

<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Related projects

You might also be interested in these projects:

* [expand-tilde](https://www.npmjs.com/package/expand-tilde): Bash-like tilde expansion for node.js. Expands a leading tilde in a file path to the… [more](https://github.com/jonschlinkert/expand-tilde) | [homepage](https://github.com/jonschlinkert/expand-tilde "Bash-like tilde expansion for node.js. Expands a leading tilde in a file path to the user home directory, or `~+` to the cwd.")
* [global-modules](https://www.npmjs.com/package/global-modules): The directory used by npm for globally installed npm modules. | [homepage](https://github.com/jonschlinkert/global-modules "The directory used by npm for globally installed npm modules.")
* [global-paths](https://www.npmjs.com/package/global-paths): Returns an array of unique "global" directories based on the user's platform and environment. The… [more](https://github.com/jonschlinkert/global-paths) | [homepage](https://github.com/jonschlinkert/global-paths "Returns an array of unique "global" directories based on the user's platform and environment. The resulting paths can be used for doing lookups for generators or other globally installed npm packages. Node.js / JavaScript.")
* [normalize-path](https://www.npmjs.com/package/normalize-path): Normalize slashes in a file path to be posix/unix-like forward slashes. Also condenses repeat slashes… [more](https://github.com/jonschlinkert/normalize-path) | [homepage](https://github.com/jonschlinkert/normalize-path "Normalize slashes in a file path to be posix/unix-like forward slashes. Also condenses repeat slashes to a single slash and removes and trailing slashes, unless disabled.")

### Author

**Jon Schlinkert**

* [GitHub Profile](https://github.com/jonschlinkert)
* [Twitter Profile](https://twitter.com/jonschlinkert)
* [LinkedIn Profile](https://linkedin.com/in/jonschlinkert)

### License

Copyright © 2020, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the MIT License.

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.8.0, on July 13, 2020._