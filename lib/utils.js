'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

const split = str => str ? str.split(path.delimiter) : [];
const title = str => str ? str[0].toUpperCase() + str.slice(1) : '';

const homedir = (platform = process.platform) => {
  return os.homedir() || (platform === 'win32' ? os.tmpdir() : '/usr/local/share');
};

const dir = (key, options = {}) => {
  const prop = options.envPrefix ? `${options.envPrefix}_${key}_dir` : null;
  const name = `${key}dir`;

  if (prop) {
    return process.env[prop.toUpperCase()] || process.env[prop.toLowerCase()] || options[name];
  }

  return options[name];
};

const resolve = (parentdir, ...args) => {
  if (args.length && /^[A-Z]/.test(path.basename(parentdir))) {
    return path.join(parentdir, ...args.map(v => title(v)));
  }
  if (args.length) {
    return path.join(parentdir, ...args.map(v => v.toLowerCase()));
  }
  return path.join(parentdir, 'xdg');
};

const formatValue = input => {
  if (/^(['"]).*\1$/.test(input)) {
    return input.replace(/^(['"])(.*)\1$/, '$2');
  }
  if (/^(false|true)$/i.test(input)) {
    return input.toLowerCase() === 'true';
  }
  return input;
};

const unformatKey = input => {
  const match = /^(?:XDG_)?(.+)(?:_DIR)?$/i.exec(input);
  return match[1].toLowerCase();
};

const formatKey = input => {
  return `XDG_${unformatKey(input).toUpperCase()}_DIR`;
};

const load = (filepath, options = {}, resolve = fp => fp) => {
  const format = options.format !== false ? !filepath.endsWith('.conf') : false;
  const data = {};

  if (fs.existsSync(filepath)) {
    const contents = fs.readFileSync(filepath, 'utf8');

    for (const line of contents.split(/[\r\n]+/)) {
      if (line.trim() !== '' && !line.startsWith('#')) {
        let [key, value] = line.split(/\s*=\s*/);

        if (typeof options.onProperty === 'function') {
          const name = path.basename(filepath);
          ({ key, value } = options.onProperty(key, value, { name, path, format, resolve }));
        } else {
          key = format !== false ? formatKey(key) : key;
          value = resolve(formatValue(value));
        }

        data[key] = value;
      }
    }
  }

  return data;
};

module.exports = {
  dir,
  formatKey,
  formatValue,
  homedir,
  load,
  resolve,
  split,
  title,
  unformatKey
};
