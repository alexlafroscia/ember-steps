import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import StateMachine from 'ember-wizard/-private/state-machine';

const { Component, computed, isEmpty, get, set } = Ember;
const { readOnly } = computed;
const layout = hbs`
  {{yield (hash
    step=(component 'step-manager/step'
      register-step=(action 'register-step-component')
      currentStep=currentStep
    )
    transition-to=(action 'transition-to-step')
    transition-to-next=(action 'transition-to-next-step')
    totalSteps=totalSteps
  )}}
`;

export default Component.extend({
  // Configure ember-hook
  hook: 'ember-wizard-step-manager',

  layout,

  init() {
    this._super(...arguments);

    // Set up the state machine
    const initialStep = get(this, 'initialStep');
    set(this, 'transitions', StateMachine.create({
      initialStep
    }));
  },

  /**
   * @property {Ember.Object} transitions state machine for transitions
   * @private
   */
  transitions: null,

  /**
   * @property {string} the step to start on
   * @public
   */
  initialStep: null,

  /**
   * @property {string} currentStep the current active step
   * @private
   */
  currentStep: readOnly('transitions.currentStep'),

  /**
   * @property {number} totalSteps the total number of steps
   * @public
   */
  totalSteps: readOnly('transitions.length'),

  actions: {

    /**
     * Register a step with the wizard
     *
     * Adds a set to the internal registry of steps by name.  If no name is
     * provided, a name will be assigned by index.
     *
     * @method registerStep
     * @param {string} name the name of the step being registered
     * @private
     */
    'register-step-component'(stepComponent) {
      let name = get(stepComponent, 'name');
      if (!name) {
        const stepCount = get(this, 'totalSteps');
        name = `index-${stepCount}`;
        set(stepComponent, 'name', name);
      }

      get(this, 'transitions').addStep(name);
    },

    /**
     * Transition to a named step
     *
     * @method transition-to-step
     * @param {string} name
     * @public
     */
    'transition-to-step'(name) {
      if (isEmpty(name)) {
        throw new Error('You must provide a step to transition to');
      }

      get(this, 'transitions').activate(name);

      if (this['on-transition']) {
        this['on-transition'](...arguments);
      }
    },

    /**
     * Transition to the "next" step
     *
     * When called, this action will advance from the current step to the next
     * one, as defined by the order of their insertion into the DOM (AKA, the
     * order in the template).
     *
     * The last step will transition back to the first one.
     *
     * @method transition-to-next-step
     * @public
     */
    'transition-to-next-step'() {
      get(this, 'transitions').next();

      if (this['on-transition']) {
        this['on-transition'](...arguments);
      }
    }
  }
});
