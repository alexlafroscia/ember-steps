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
export default class CircularStateMachine extends BaseStateMachine {
  pickNext(currentStep = this.currentStep) {
    const currentIndex = this.nodeArray
      .map(node => node.name)
      .indexOf(currentStep);
    const nextValue = this.nodeArray[currentIndex + 1];

    if (nextValue) {
      return nextValue.name;
    }

    const firstObject = this.nodeArray[0];

    if (firstObject) {
      return firstObject.name;
    }

    return undefined;
  }

  pickPrevious(currentStep = this.currentStep) {
    const currentIndex = this.nodeArray
      .map(node => node.name)
      .indexOf(currentStep);
    const previousValue = this.nodeArray[currentIndex - 1];

    if (previousValue) {
      return previousValue.name;
    }

    const lastIndex = this.length - 1;
    const lastObject = this.nodeArray[lastIndex];

    if (lastObject) {
      return lastObject.name;
    }

    return undefined;
  }
}
