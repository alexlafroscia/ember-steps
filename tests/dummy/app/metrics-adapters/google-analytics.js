import GoogleAnalyticsAdapter from 'ember-metrics/metrics-adapters/google-analytics';
import canUseDOM from 'ember-metrics/utils/can-use-dom';

import { copy } from '@ember/object/internals';
import { get } from '@ember/object';
import { assert } from '@ember/debug';
import { isPresent } from '@ember/utils';

export default GoogleAnalyticsAdapter.extend({
  init() {
    const config = copy(get(this, 'config'));
    const { id, sendHitTask, trace, require } = config;
    let { debug } = config;

    assert(
      `[ember-metrics] You must pass a valid \`id\` to the ${this.toString()} adapter`,
      id
    );

    delete config.id;
    delete config.require;
    delete config.sendHitTask;

    if (debug) {
      delete config.debug;
    }
    if (trace) {
      delete config.trace;
    }

    const hasOptions = isPresent(Object.keys(config));

    if (canUseDOM) {
      /* eslint-disable */
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script',`https://www.google-analytics.com/analytics${debug ? '_debug' : ''}.js`,'ga');
      /* eslint-enable */

      if (trace === true) {
        window.ga_debug = { trace: true };
      }

      if (hasOptions) {
        window.ga('create', id, config);
      } else {
        window.ga('create', id, 'auto');
      }

      if (require) {
        require.forEach((plugin) => {
          window.ga('require', plugin);
        });
      }

      if (sendHitTask === false) {
        window.ga('set', 'sendHitTask', null);
      }
    }
  },
});
