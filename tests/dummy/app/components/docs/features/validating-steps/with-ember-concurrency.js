// BEGIN-SNIPPET validating-steps-ember-concurrency.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import asyncPasswordCheck from './async-password-check';

export default class extends Component {
  @tracked password = '';

  @task({ restartable: true })
  checkPassword = function* (performTransition) {
    const password = this.password;
    const result = yield asyncPasswordCheck(password);

    if (result) {
      performTransition();
    }
  };
}
// END-SNIPPET
