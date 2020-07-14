'use strict';

require('mocha');
const assert = require('assert').strict;
const xdg = require('..');

describe('xdg-user-dirs', () => {
  it('should', () => {
    console.log(xdg());
  });
});
