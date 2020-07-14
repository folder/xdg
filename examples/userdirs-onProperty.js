'use strict';

require('./fixtures/env');
const { userdirs } = require('..');

const onProperty = (key, value, { name, resolve }) => {
  console.log(name);
  return { key: key.toLowerCase(), value: resolve(value) };
};

const res = userdirs.expand({ onProperty });
console.log(res);
