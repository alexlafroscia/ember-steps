import BaseStateMachine from './-base';
import { set } from '@ember/object';

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
    set(this, `stepTransitions.${name}`, null);
  }
});
