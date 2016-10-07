'use strict';

var debug = require('./lib/utils/debug')('addon');
var EmberWizardPlugin = require('./lib/htmlbars-plugin');

module.exports = {
  name: 'ember-wizard',

  shouldIncludeChildAddon: function(addon) {
    return addon.name.indexOf('dummy') === -1;
  },

  setupPreprocessorRegistry: function(type, registry) {
    if (type !== 'parent') {
      return;
    }

    debug('registering HTMLBars plgin');
    registry.add('htmlbars-ast-plugin', {
      name: 'ember-wizard',
      plugin: EmberWizardPlugin,
      baseDir: function() {
        return __dirname;
      }
    });
  }
};
