import Ember from 'ember';
import RSVP from 'rsvp';

const { Controller } = Ember;

export default Controller.extend({
  // BEGIN-SNIPPET validator
  validationFailed: false,

  actions: {
    validator(payload) {
      const { run } = Ember;
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
