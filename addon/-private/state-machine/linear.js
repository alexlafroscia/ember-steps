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
    // Set the last step to transition to the new one, event if the last step
    // is this one
    const lastStep = get(this, 'lastStep');
    set(this, `stepTransitions.${lastStep}`, name);

    // Set the new step to transition to the first one
    set(this, `stepTransitions.${name}`, null);
  }
});
