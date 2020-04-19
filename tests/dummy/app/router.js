import EmberRouter from '@ember/routing/router';
import { get } from '@ember/object';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import config from './config/environment';

export default class Router extends EmberRouter {
  @service('metrics') metrics;

  location = config.locationType;
  rootURL = config.rootURL;

  didTransition() {
    super.didTransition(...arguments);

    if (window.ga) {
      run.scheduleOnce('afterRender', this, this._trackPage);
    }
  }

  _trackPage() {
    const page = this.get('url');
    const title = this.getWithDefault('currentRouteName', 'unknown');

    get(this, 'metrics').trackPage({ page, title });
  }
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

  this.route('not-found', { path: '/*path' });
});
