import { run } from '@ember/runloop';
import Controller from '@ember/controller';
import RSVP from 'rsvp';

export default Controller.extend({
  // BEGIN-SNIPPET validator
  validationFailed: false,

  actions: {
    validator(payload) {
      let promise;
      this.set('validationFailed', false);

      if (payload.from == 'b') {
        promise = new RSVP.Promise((resolve, reject) => {
          run.later(
            null,
            () => {
              this.set('validationFailed', true);
              reject();
            },
            1000
          );
        });
      } else {
        promise = new RSVP.Promise(resolve => {
          run.later(null, resolve, 1000);
        });
      }

      return promise;
    }
  }
  // END-SNIPPET
});
