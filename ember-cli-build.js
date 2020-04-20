'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  const app = new EmberAddon(defaults, {
    autoImport: {
      webpack: {
        node: {
          global: true,
        },
      },
    },

    snippetSearchPaths: ['tests/dummy/app'],

    'ember-composable-helpers': {
      only: ['pipe'],
    },
  });

  return app.toTree();
};
