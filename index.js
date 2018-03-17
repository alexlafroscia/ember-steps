/* eslint-env node */

'use strict';

const debug = require('./lib/utils/debug')('addon');
const EmberStepsPlugin = require('./lib/htmlbars-plugin');

module.exports = {
  name: 'ember-steps',

  shouldIncludeChildAddon(addon) {
    return addon.name.indexOf('dummy') === -1;
  },

  setupPreprocessorRegistry(type, registry) {
    if (type !== 'parent') {
      return;
    }

    debug('registering HTMLBars plgin');
    registry.add('htmlbars-ast-plugin', {
      name: 'ember-steps',
      plugin: EmberStepsPlugin,
      baseDir() {
        return __dirname;
      }
    });
  }
};
