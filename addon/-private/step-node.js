import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';

export default class StepNode {
  @tracked sm;
  @tracked component;

  constructor(sm, component) {
    this.sm = sm;
    this.component = component;
  }

  get name() {
    return this.component.name;
  }

  get context() {
    return this.component.args.context;
  }

  get hasNext() {
    return isPresent(this.sm.pickNext(this.name));
  }

  get hasPrevious() {
    return isPresent(this.sm.pickPrevious(this.name));
  }

  get isActive() {
    return this.sm.currentStep === this.name;
  }
}
