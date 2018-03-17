/* eslint-disable prefer-template */

'use strict';

const debug = require('debug');

module.exports = function(name) {
  return debug('ember-steps:' + name);
};
