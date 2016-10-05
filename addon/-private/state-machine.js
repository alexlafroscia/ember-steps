import Ember from 'ember';

const { A, Object: EmberObject, computed, get, set } = Ember;

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
   * List of steps, in the order they were inserted
   * @property {string[]} stepOrder
   * @private
   */
  stepOrder: null,

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
    set(this, 'stepOrder', A());

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

    // Set the last step, if it hasn't been yet
    if (!get(this, 'lastStep')) {
      set(this, 'lastStep', name);
    }

    get(this, 'stepOrder').pushObject(name);

    // Set the last step to transition to the new one, event if the last step
    // is this one
    const lastStep = get(this, 'lastStep');
    set(this, `stepTransitions.${lastStep}`, name);

    // Set the new step to transition to the first one
    const firstStep = get(this, 'firstStep');
    set(this, `stepTransitions.${name}`, firstStep);

    // Set the current step, if it hasn't been yet
    if (!get(this, 'currentStep')) {
      set(this, 'currentStep', name);
    }

    // Set the last step to this new one
    set(this, 'lastStep', name);

    this.notifyPropertyChange('length');
  },

  peek() {
    const transitions = get(this, 'stepTransitions');
    const currentStep = get(this, 'currentStep');
    return transitions[currentStep];
  },

  next() {
    const next = this.peek();
    return this.activate(next);
  },

  activate(name) {
    if (!name) {
      throw new Error('No step name provided');
    }

    if (!get(this, `stepTransitions.${name}`)) {
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
  })
});
