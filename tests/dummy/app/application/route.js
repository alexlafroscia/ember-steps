import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';

export default class ApplicationRoute extends Route {
  title(tokens) {
    if (isEmpty(tokens)) {
      return 'ember-steps';
    }

    return `ember-steps – ${tokens.join(' ')}`;
  }
}
