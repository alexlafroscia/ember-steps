/* eslint-env node */

'use strict';

module.exports = {
  name: require('./package').name,

  shouldIncludeChildAddon(addon) {
    return addon.name.indexOf('dummy') === -1;
  }
};
