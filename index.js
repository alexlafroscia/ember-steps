/* eslint-env node */

'use strict';

module.exports = {
  name: 'ember-steps',

  shouldIncludeChildAddon(addon) {
    return addon.name.indexOf('dummy') === -1;
  }
};
