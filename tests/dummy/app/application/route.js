import Ember from 'ember';

const { Route, isEmpty } = Ember;

export default Route.extend({
  title(tokens) {
    if (isEmpty(tokens)) {
      return 'ember-wizard';
    }

    return `ember-wizard – ${tokens.join(' ')}`;
  }
});
