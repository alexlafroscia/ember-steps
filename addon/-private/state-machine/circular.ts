import BaseStateMachine from './-base';
import { get } from '@ember/object';

/**
 * Keeps track of the order of the steps in the step manager, as well as
 * the current step.
 *
 * @class CircularStateMachine
 * @extends BaseStateMachine
 * @private
 * @hide
 */
export default class CircularStateMachine extends BaseStateMachine {
  pickNext(currentStep = this.currentStep): string {
    const currentIndex = this.stepTransitions.indexOf(currentStep);
    const nextValue = this.stepTransitions.objectAt(currentIndex + 1);

    if (nextValue) {
      return nextValue;
    }

    return this.stepTransitions.objectAt(0);
  }

  pickPrevious(currentStep = this.currentStep): string {
    const currentIndex = this.stepTransitions.indexOf(currentStep);
    const previousValue = this.stepTransitions.objectAt(currentIndex - 1);

    if (previousValue) {
      return previousValue;
    }

    const lastIndex = get(this, 'length') - 1;
    return this.stepTransitions.objectAt(lastIndex);
  }
}
