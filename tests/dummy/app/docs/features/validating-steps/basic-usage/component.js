// BEGIN-SNIPPET validating-steps-basic-usage.js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

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
