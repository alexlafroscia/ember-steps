import { get } from '@ember/object';
import { isPresent } from '@ember/utils';

import { computed } from '@ember-decorators/object';

export default class StepNode {
  constructor(sm, name, context, onActivate, onDeactivate) {
    this.sm = sm;
    this.name = name;
    this.context = context;
    this.onActivate = onActivate;
    this.onDeactivate = onDeactivate;
  }

  get hasNext() {
    return isPresent(this.sm.pickNext(this.name));
  }

  get hasPrevious() {
    return isPresent(this.sm.pickPrevious(this.name));
  }

  @computed('sm.currentStep')
  get isActive() {
    return get(this.sm, 'currentStep') === this.name;
  }
}
