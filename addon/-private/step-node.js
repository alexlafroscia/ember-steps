import { get } from '@ember/object';
import { isPresent } from '@ember/utils';
import { computed } from '@ember/object';

export default class StepNode {
  constructor(sm, name, context) {
    this.sm = sm;
    this.name = name;
    this.context = context;
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
