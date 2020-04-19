import Component from '@ember/component';
import { computed } from '@ember/object';

// BEGIN-SNIPPET dynamic-definition-basic-example.js
export default Component.extend({
  data: computed(function () {
    return [
      'This is the first step',
      'This is the second step',
      'This is the third step',
    ];
  }),
});
// END-SNIPPET
