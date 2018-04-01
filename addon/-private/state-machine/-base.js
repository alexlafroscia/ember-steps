import EmberObject, { set, get, computed } from '@ember/object';
import { assert } from '@ember/debug';

/**
 * Keeps track of the order of the steps in the step manager, as well as
 * the current step.
 *
 * @class StateMachine
 * @private
 * @hide
 */
export default EmberObject.extend({
  /**
   * @property {string} initialStep
   * @public
   */
  initialStep: null,

  /**
   * Map of step transitions
   * @property {object} stepTransitions
   * @private
   */
  stepTransitions: null,

  /**
   * @property {string} firstStep
   * @private
   */
  firstStep: null,

  /**
   * @property {string} lastStep
   * @private
   */
  lastStep: null,

  /**
   * @property {string} currentStep
   * @public
   */
  currentStep: null,

  init() {
    set(this, 'stepTransitions', EmberObject.create());

    const initialStep = get(this, 'initialStep');
    if (initialStep) {
      set(this, 'currentStep', initialStep);
    }
  },

  addStep(name) {
    // Set the first step, if it hasn't been yet
    if (!get(this, 'firstStep')) {
      set(this, 'firstStep', name);
    }

    // Set the last step to transition to the new one, event if the last step
    // is this one
    const lastStep = get(this, 'lastStep');
    if (lastStep) {
      set(this, `stepTransitions.${lastStep}`, name);
    }

    // Add to the transition map based on the super-class
    this._addStepToTransitions(name);

    // Set the current step, if it hasn't been yet
    if (!get(this, 'currentStep')) {
      set(this, 'currentStep', name);
    }

    // Set the last step to this new one
    set(this, 'lastStep', name);

    this.notifyPropertyChange('length');
  },

  _addStepToTransitions() {
    assert('must be implemented by parent class');
  },

  pickNext(currentStep = get(this, 'currentStep')) {
    const transitions = get(this, 'stepTransitions');

    return transitions[currentStep];
  },

  pickPrevious(currentStep = get(this, 'currentStep')) {
    let previous;
    const transitions = get(this, 'stepTransitions');

    for (const k in transitions) {
      if (transitions[k] === currentStep) {
        previous = k;
        break;
      }
    }

    return previous;
  },

  activate(name) {
    if (!name) {
      throw new Error('No step name provided');
    }

    if (!Object.keys(get(this, 'stepTransitions')).includes(name)) {
      throw new Error(`Step name "${name}" is invalid`);
    }

    set(this, 'currentStep', name);
    return name;
  },

  /**
   * Updated from `addStep` through the `notifyPropertyChange` because pushing new keys
   * to the underlying state object does not trigger a KVO update
   *
   * @property {number} length
   * @public
   */
  length: computed(function() {
    return Object.keys(get(this, 'stepTransitions')).length;
  }),

  /**
   * An array of the step names
   *
   * @property {Array<string>} stepArray
   * @public
   */
  stepArray: computed('length', function() {
    return Object.keys(get(this, 'stepTransitions'));
  })
});
