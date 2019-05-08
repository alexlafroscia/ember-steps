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
  pickNext(currentStep = this.currentStep) {
    const currentIndex = this.stepTransitions
      .map(node => node.name)
      .indexOf(currentStep);
    const nextValue = this.stepTransitions.objectAt(currentIndex + 1);

    if (nextValue) {
      return nextValue.name;
    }

    const firstObject = this.stepTransitions.objectAt(0);

    if (firstObject) {
      return firstObject.name;
    }

    return undefined;
  }

  pickPrevious(currentStep = this.currentStep) {
    const currentIndex = this.stepTransitions
      .map(node => node.name)
      .indexOf(currentStep);
    const previousValue = this.stepTransitions.objectAt(currentIndex - 1);

    if (previousValue) {
      return previousValue.name;
    }

    const lastIndex = get(this, 'length') - 1;
    const lastObject = this.stepTransitions.objectAt(lastIndex);

    if (lastObject) {
      return lastObject.name;
    }

    return undefined;
  }
}
