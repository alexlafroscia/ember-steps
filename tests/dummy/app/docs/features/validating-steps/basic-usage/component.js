// BEGIN-SNIPPET validating-steps-basic-usage.js
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
  },
});
// END-SNIPPET
