import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import StateMachine from 'ember-wizard/-private/state-machine';

const { Component, computed, get, set } = Ember;
const { readOnly } = computed;
const layout = hbs`
  {{yield (hash
    step=(component 'step-manager/step'
      register-step=(action 'register-step-component')
      currentStep=currentStep
    )
    transition-to=(action 'transition-to-step')
    transition-to-next=(action 'transition-to-next-step')
    currentStep=currentStep
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
   * @public
   */
  currentStep: readOnly('transitions.currentStep'),

  /**
   * If provided, this action will be called with a single POJO as the
   * argument, containing:
   *
   * - `value`-> The value passed to the transition action, or `undefined`
   * - `from` -> The name of the step being transitioned from
   * - `to`   -> The name of the step being transitioned to
   *
   * The action is called before the next step is activated.
   *
   * By returning `false` from this action, you can prevent the transition
   * from taking place.
   *
   * @property {Action} will-transition
   * @public
   */
  'will-transition': null,

  /**
   * If provided, this action will be called with a single POJO as the
   * argument, containing:
   *
   * - `value`-> The value passed to the transition action, or `undefined`
   * - `from` -> The name of the step being transitioned from
   * - `to`   -> The name of the step being transitioned to
   *
   * The action is called after the next step is activated.
   *
   * @property {Action} did-transition
   * @public
   */
  'did-transition': null,

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
     * @param {string} to the name of the step to transition to
     * @param {*} value the value to pass to the transition actions
     * @public
     */
    'transition-to-step'(to, value) {
      const from = get(this, 'currentStep');

      if (this['will-transition'] && this['will-transition']({ value, from, to }) === false) {
        return;
      }

      get(this, 'transitions').activate(to);

      if (this['did-transition']) {
        this['did-transition']({ value, from, to });
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
     * @param {*} value the value to pass to the transition actions
     * @public
     */
    'transition-to-next-step'(value) {
      const to = get(this, 'transitions').peek();

      this.send('transition-to-step', to, value);
    }
  }
});
