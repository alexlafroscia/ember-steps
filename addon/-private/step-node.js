import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';

export default class StepNode {
  /** @private */
  @tracked sm;

  /** @private */
  @tracked component;

  constructor(sm, component) {
    this.sm = sm;
    this.component = component;
  }

  /** @type {string} */
  get name() {
    return this.component.name;
  }

  /** @type {any} */
  get context() {
    return this.component.args.context;
  }

  /** @type {boolean} */
  get hasNext() {
    return isPresent(this.sm.pickNext(this.name));
  }

  /** @type {boolean} */
  get hasPrevious() {
    return isPresent(this.sm.pickPrevious(this.name));
  }

  /** @type {boolean} */
  get isActive() {
    return this.sm.currentStep === this.name;
  }
}
