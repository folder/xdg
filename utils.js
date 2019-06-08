'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const readdir = require('@folder/readdir');

const files = (paths, prop, options = {}) => {
  const fn = async (filepath, opts) => {
    let { home } = paths[prop];
    return readdir(path.join(home, filepath), { ...options, ...opts });
  };
  fn.sync = (filepath, opts) => {
    let { home } = paths[prop];
    return readdir.sync(path.join(home, filepath), { ...options, ...opts });
  };
  return fn;
};

const find = (paths, prop, options) => {
  return (filepath, opts) => {
    let opt = { ...options, ...opts };
    let obj = paths[prop];
    let dirs = [].concat(obj.dirs || obj.home);
    let results = {};

    if (opt.reverse === true) {
      dirs.reverse();
    }

    for (let dir of dirs) {
      let fp = path.join(dir, filepath);
      if (fs.existsSync(fp)) {
        results[dir] = fp;
      }
    }
    return results;
  };
};

const first = (paths, prop, options) => {
  return (filepath, opts) => {
    let opt = { ...options, ...opts };
    let obj = paths[prop];
    let dirs = [].concat(obj.dirs || obj.home);

    if (opt.reverse === true) {
      dirs.reverse();
    }

    for (let dir of dirs) {
      let filepath = path.join(dir, filepath);

      if (fs.existsSync(filepath)) {
        return filepath;
      }
    }
  };
};

const resolve = prop => (paths, ...args) => {
  return path.resolve(paths[prop].home, ...args);
};

const read = (paths, prop, options = {}) => {
  let lookup = first(paths, prop, options);
  let fn = async(...args) => {
    let readFile = util.promisify(fs.readFile);
    let stat = util.promisify(fs.stat);
    let file = { path: lookup(...args), contents: null };
    if (!file.path) return file;
    file.stat = await stat(file.path);
    if (file.stat.isFile()) {
      return readFile(file.path, 'utf8')
        .then(contents => {
          file.contents = contents;
          return file;
        });
    }
    return file;
  };
  fn.sync = (...args) => {
    let file = { path: lookup(...args), contents: null };
    if (!file.path) return file;
    file.stat = fs.statSync(file.path);
    if (file.stat.isFile()) {
      file.contents = fs.readFileSync(file.path, 'utf8');
    }
    return file;
  };
  return fn;
};

const load = (paths, prop, options = {}) => {
  let reader = read(paths, prop, options);
  let loaders = options.loaders || {};
  let loadFile = file => {
    if (file.contents !== null) {
      file.extname = path.extname(file.path);
      if (file.extname) file.extname = file.extname.slice(1);
      if (options.load) {
        return options.load(file);
      }
      if (loaders[file.extname]) {
        return loaders[file.extname](file);
      }
    }
    return null;
  };

  let fn = async (...args) => loadFile(await reader(...args));
  fn.sync = (...args) => loadFile(reader.sync(...args));
  return fn;
};

module.exports = { files, find, first, resolve, read, load };
