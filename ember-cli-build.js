'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
const { maybeEmbroider } = require('@embroider/test-setup');

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

  return maybeEmbroider(app);
};
