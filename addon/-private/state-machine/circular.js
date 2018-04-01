import BaseStateMachine from './-base';
import { set, get } from '@ember/object';

/**
 * Keeps track of the order of the steps in the step manager, as well as
 * the current step.
 *
 * @class CircularStateMachine
 * @extends BaseStateMachine
 * @private
 * @hide
 */
export default BaseStateMachine.extend({
  _addStepToTransitions(name) {
    // Set the new step to transition to the first one
    const firstStep = get(this, 'firstStep');
    set(this, `stepTransitions.${name}`, firstStep);
  }
});
