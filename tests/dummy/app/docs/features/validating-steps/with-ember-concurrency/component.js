// BEGIN-SNIPPET validating-steps-ember-concurrency.js
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import asyncPasswordCheck from './async-password-check';

export default Component.extend({
  password: '',

  checkPassword: task(function* (performTransition) {
    const password = this.get('password');
    const result = yield asyncPasswordCheck(password);

    if (result) {
      performTransition();
    }
  }).restartable(),
});
// END-SNIPPET
