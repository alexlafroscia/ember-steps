// BEGIN-SNIPPET validating-steps-did-transition.js
import Component from '@ember/component';

export default Component.extend({
  password: '',

  actions: {
    checkPassword(resolve) {
      const password = this.get('password');

      if (password === 'password') {
        resolve();
      }
    },

    reset() {
      this.set('password', '');
    },
  },
});
// END-SNIPPET
