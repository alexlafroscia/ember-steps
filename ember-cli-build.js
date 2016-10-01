const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  const app = new EmberAddon(defaults, {
    snippetPaths: ['tests/dummy/snippets'],
    cssModules: {
      plugins: [
        require('postcss-nested')
      ]
    }
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  if (app.env === 'test') {
    app.import(app.bowerDirectory + '/chai-jquery/chai-jquery.js', { type: 'test' });
  }

  return app.toTree();
};
