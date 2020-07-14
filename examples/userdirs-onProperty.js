'use strict';

require('./fixtures/env');
const path = require('path');
const { userdirs } = require('..');

const onProperty = (key, value, { name, resolve }) => {
  console.log(path.basename(name));
  return { key: key.toLowerCase(), value: resolve(value) };
};

const res = userdirs.expand({ onProperty });
console.log(res);
