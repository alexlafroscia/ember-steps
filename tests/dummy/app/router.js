import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function () {
  docsRoute(this, function () {
    /* Your docs routes go here */
    this.route('features', function () {
      this.route('validating-steps');
      this.route('state-manager');
      this.route('inactive');
    });

    this.route('cookbook', function () {
      this.route('dynamic-definition');
      this.route('tabs');
      this.route('tabs-query-param');
      this.route('wizard');
      this.route('wizard-progress-indicator');
    });

    this.route('api', function () {
      this.route('item', { path: '/*path' });
    });
  });

  this.route('fastboot-test');

  this.route('not-found', { path: '/*path' });
});

export default Router;
