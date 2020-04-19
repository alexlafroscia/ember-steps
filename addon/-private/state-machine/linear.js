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
    const currentIndex = this.nodeArray
      .map((node) => node.name)
      .indexOf(currentStep);
    const currentNode = this.nodeArray[currentIndex + 1];

    if (currentNode) {
      return currentNode.name;
    }

    return undefined;
  }

  pickPrevious(currentStep = this.currentStep) {
    const currentIndex = this.nodeArray
      .map((node) => node.name)
      .indexOf(currentStep);
    const currentNode = this.nodeArray[currentIndex - 1];

    if (currentNode) {
      return currentNode.name;
    }

    return undefined;
  }
}
