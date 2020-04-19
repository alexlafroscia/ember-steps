import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';

export default Route.extend({
  title(tokens) {
    if (isEmpty(tokens)) {
      return 'ember-steps';
    }

    return `ember-steps – ${tokens.join(' ')}`;
  },
});
