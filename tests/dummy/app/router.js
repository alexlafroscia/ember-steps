import EmberRouter from '@ember/routing/router';
import { get } from '@ember/object';
import { run } from '@ember/runloop';
import config from './config/environment';

const { service } = inject;

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
  metrics: service(),

  didTransition() {
    this._super(...arguments);
    this._trackPage();
  },

  _trackPage() {
    run.scheduleOnce('afterRender', this, () => {
      const page = this.get('url');
      const title = this.getWithDefault('currentRouteName', 'unknown');

      get(this, 'metrics').trackPage({ page, title });
    });
  }
});

Router.map(function() {
  this.route('named-steps');
  this.route('step-links');
  this.route('validator');
  this.route('wizard-example');
});

export default Router;
