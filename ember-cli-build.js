'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  const app = new EmberAddon(defaults, {
    snippetSearchPaths: ['tests/dummy/app'],

    cssModules: {
      plugins: [require('postcss-nested')]
    }
  });

  return app.toTree();
};
