// BEGIN-SNIPPET validating-steps-basic-usage.js
import Component from '@glimmer/component';
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
}
// END-SNIPPET
