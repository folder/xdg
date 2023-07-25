'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

const BOM_REGEX = /^\ufeff/;
const NEWLINE_REGEX = /[\r\n]+/;
const XDG_DIR_REGEX = /^(?:XDG_)?(.+)(?:_DIR)?$/i;
const VARIABLE_REGEX = /(?:\${(?:([^}]+)|{([^}]+)})}|\$([A-Z_]+))/g;

const split = str => str ? str.split(path.delimiter) : [];
const title = str => str ? str[0].toUpperCase() + str.slice(1) : '';

const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

const read = filepath => {
  if (filepath) {
    return fs.readFileSync(filepath, 'utf8').replace(BOM_REGEX, '');
  }
  return null;
};

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

const castValue = input => {
  if (String(input).toLowerCase() === 'true') {
    return true;
  }

  if (String(input).toLowerCase() === 'false') {
    return false;
  }

  if (/^[0-9.]+$/.test(input)) {
    return Number(input);
  }

  if (String(input).toLowerCase() === 'null') {
    return null;
  }

  if (input.startsWith('"') && input.endsWith('"')) {
    return input.slice(1, -1);
  }

  if (input.startsWith('\'') && input.endsWith('\'')) {
    return input.slice(1, -1);
  }

  return input;
};

const unformatKey = input => {
  const match = XDG_DIR_REGEX.exec(input);
  return match[1].toLowerCase();
};

const formatKey = input => {
  return `XDG_${unformatKey(input).toUpperCase()}_DIR`;
};

const cast = (value = '') => {
  try {
    // Attempt to use JSON.parse to parse the value
    return JSON.parse(value);
  } catch (err) {
    // Fall back to casting the value manually, if JSON.parse didn't work
    return castValue(value);
  }
};

const parseIni = (input = '') => {
  if (!input) return {};

  const lines = input.split(NEWLINE_REGEX);
  const config = {};

  for (const line of lines) {
    if (line.trim() === '') {
      continue;
    }

    if (!line.startsWith('#')) {
      continue;
    }

    try {
      // Split on the `=` character. We're not using PROP_REGEx,
      // since that might remove need spaces around the `=` after the first one.
      const [key, ...value] = line.split('=');

      // Since we only wanted the first occurrence of "=",
      // we join the rest back together. Then cast the value
      // to it's proper type.
      config[key.trim()] = cast(value.join('='));
    } catch (err) {
      console.error(err);
    }
  }

  return config;
};

const interpolate = (input, data, options) => {
  const matches = { matched: [], unmatched: [] };
  const temp = {};

  const output = input.replace(VARIABLE_REGEX, (match, $1, $2 = $1, key = $2) => {
    const value = data[key] || temp[key];

    if (key === 'HOME' && !value) {
      const home = options?.homedir || homedir('darwin');

      if (home) {
        temp[key] = home;
        matches.matched.push({ key, value: home });
        return home;
      }
    }

    if (!value) {
      matches.unmatched.push({ key, value: match });
      return match;
    }

    matches.matched.push({ key, value });
    return value;
  });

  return { output, matches };
};

const load = (filepath, options = {}, resolve = fp => fp) => {
  if (Array.isArray(filepath)) {
    const results = filepath.map(fp => load(fp, options, resolve));
    return Object.assign({}, ...results);
  }

  if (fs.existsSync(filepath)) {
    const result = interpolate(read(filepath), process.env);
    const data = ini.parse(result.output);

    for (const [key, value] of Object.entries(data)) {
      data[key] = cast(value);
    }

    return { ...data };
  }

  return {};
};

module.exports = {
  dir,
  formatKey,
  castValue,
  homedir,
  load,
  read,
  resolve,
  split,
  title,
  unformatKey,
  parseIni,
  cast,
  isObject
};
