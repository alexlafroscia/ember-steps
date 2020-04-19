import Controller from '@ember/controller';

// BEGIN-SNIPPET cookbook-tabs-with-query-params-controller.js
export default Controller.extend({
  queryParams: ['tab'],
  tab: 'first',
});
// END-SNIPPET
