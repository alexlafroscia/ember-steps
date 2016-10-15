/* eslint-disable no-var */
/* eslint-disable prefer-template */

'use strict';

var debug = require('debug');

module.exports = function(name) {
  return debug('ember-steps:' + name);
};
