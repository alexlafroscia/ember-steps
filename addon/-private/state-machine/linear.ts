import BaseStateMachine from './-base';

/**
 * Keeps track of the order of the steps in the step manager, as well as
 * the current step.
 *
 * @class CircularStateMachine
 * @extends BaseStateMachine
 * @private
 * @hide
 */
export default class LinearStateMachine extends BaseStateMachine {
  pickNext(currentStep = this.currentStep) {
    const currentIndex = this.stepTransitions.indexOf(currentStep);

    return this.stepTransitions[currentIndex + 1];
  }

  pickPrevious(currentStep = this.currentStep) {
    const currentIndex = this.stepTransitions.indexOf(currentStep);

    return this.stepTransitions[currentIndex - 1];
  }
}
