import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('docs', function () {
    this.route('features', function () {
      this.route('validating-steps');
      this.route('state-manager');
      this.route('inactive');
    });

    this.route('cookbook', function () {
      this.route('dynamic-definition');
      this.route('tabs', function () {
        this.route('query-param');
      });
      this.route('wizard', function () {
        this.route('progress-indicator');
      });
    });

    this.route('api', function () {
      this.route('item', { path: '/*path' });
    });
  });

  this.route('fastboot-test');

  this.route('not-found', { path: '/*path' });
});
