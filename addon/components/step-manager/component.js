import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import StateMachine from 'ember-steps/-private/state-machine';
import { MissingPropertyError } from 'ember-steps/-private/errors';

const { Component, get, set } = Ember;
const layout = hbs`
  {{yield (hash
    step=(component 'step-manager/step'
      register-step=(action 'register-step-component')
      currentStep=transitions.currentStep
    )
    transition-to=(action 'transition-to-step')
    transition-to-next=(action 'transition-to-next-step')
    currentStep=transitions.currentStep
  )}}
`;

export default Component.extend({
  layout,
  init() {
    this._super(...arguments);

    // Set up the state machine
    const initialStep = get(this, 'currentStep');
    if (!initialStep) {
      throw new MissingPropertyError('currentStep');
    }

    this._lastStep = initialStep;

    const stepCount = get(this, 'stepCount');
    if (!stepCount) {
      throw new MissingPropertyError('stepCount');
    }

    set(
      this,
      'transitions',
      StateMachine.create({
        initialStep
      })
    );
  },

  /**
   * @property {Ember.Object} transitions state machine for transitions
   * @private
   */
  transitions: null,

  /**
   * Used internally to track the previous step
   *
   * @property {string} _lastStep
   * @private
   */
  _lastStep: undefined,

  /**
   * The `currentStep` property can be used for providing, or binding to, the
   * name of the current step.
   *
   * If you only want to provide the initial step, but do not want the target
   * object's value to be bound to it, you can either:
   *
   * - Pass it a value directly, like `currentStep='name'`
   * - Use the Unbound helper, like `currentStep=(unbound nameOfStep)`
   *
   * If you want to bind the value in both directions, you can do so by:
   *
   * - Passing a template value directly, like `currentStep=nameOfStep
   * - Using the Mut helper, like `currentStep=(mut nameOfStep)`
   *
   * Providing a mutable value is useful for cases like binding the current
   * step name to a query param.
   *
   * @property {string} currentStep the current active step
   * @public
   */
  currentStep: null,

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

  didUpdateAttrs() {
    this._super(...arguments);

    const oldStep = this._lastStep;
    const newStep = this.get('currentStep');

    if (typeof newStep === 'undefined') {
      const firstStep = get(this, 'transitions.firstStep');
      get(this, 'transitions').activate(firstStep);
    }

    if (newStep && oldStep !== newStep) {
      get(this, 'transitions').activate(newStep);
    }

    this._lastStep = newStep;

    this._super(...arguments);
  },

  actions: {
    /**
     * Register a step with the manager
     *
     * Adds a set to the internal registry of steps by name.  If no name is
     * provided, a name will be assigned by index.
     *
     * @method registerStep
     * @param {string} name the name of the step being registered
     * @private
     */
    'register-step-component'(stepComponent) {
      const name = get(stepComponent, 'name');
      get(this, 'transitions').addStep(name);
    },

    /**
     * Transition to a named step
     *
     * If the `currentStep` property was provided as a mutable value, like:
     *
     * ```js
     * {{#step-manager currentStep=(mut step) as |w|}}
     *   ...
     * {{/step-manager}}
     * ```
     *
     * Then the external property will be updated to the new step name.
     *
     * @method transition-to-step
     * @param {string} to the name of the step to transition to
     * @param {*} value the value to pass to the transition actions
     * @public
     */
    'transition-to-step'(to, value) {
      const from = get(this, 'transitions.currentStep');

      if (this['will-transition'] && this['will-transition']({ value, from, to }) === false) {
        return;
      }

      // Update the `currentStep` if it's mutable
      if (this.attrs.currentStep && this.attrs.currentStep.update) {
        this.attrs.currentStep.update(to);
      }

      // Activate the next step
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
