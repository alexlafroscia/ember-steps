// BEGIN-SNIPPET validating-steps-did-transition.js
import Component from '@ember/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked password = '';

  @action
  checkPassword(resolve) {
    if (this.password === 'password') {
      resolve();
    }
  }

  @action
  reset() {
    this.password = '';
  }
}
// END-SNIPPET
