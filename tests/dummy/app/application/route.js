import Ember from 'ember';

const { Route, isEmpty } = Ember;

export default Route.extend({
  title(tokens) {
    if (isEmpty(tokens)) {
      return 'ember-steps';
    }

    return `ember-steps – ${tokens.join(' ')}`;
  }
});
