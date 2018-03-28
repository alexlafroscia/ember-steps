import Component from '@ember/component';
import { set, get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import hbs from 'htmlbars-inline-precompile';
import StateMachine from 'ember-steps/-private/state-machine';
import { MissingPropertyError } from 'ember-steps/-private/errors';

const layout = hbs`
  {{yield (hash
    step=(component 'step-manager/step'
      register-step=(action 'register-step-component')
      currentStep=transitions.currentStep
    )
    transition-to=(action 'transition-to')
    transition-to-next=(action 'transition-to-next')
    transition-to-previous=(action 'transition-to-previous')
    currentStep=transitions.currentStep
    steps=(if _hasRendered transitions.stepArray)
  )}}
`;

/**
 * A component for creating a set of "steps", where only one is visible at a time
 *
 * ```hbs
 * {{#step-manager as |w|}}
 *   {{#w.step}}
 *     The first step
 *   {{/w.step}}
 *
 *   {{#w.step}}
 *     The second step
 *   {{/w.step}}
 *
 *   <button {{action w.transition-to-next}}>
 *     Next Step
 *   </button>
 * {{/step-manager}}
 * ```
 *
 * @class StepManager
 * @yield {hash} w
 * @yield {Component} w.step Renders a step
 * @yield {Action} w.transition-to
 * @yield {Action} w.transition-to-next Render the next step
 * @yield {Action} w.transition-to-previous Render the previous step
 * @yield {string} w.currentStep The name of the current step
 * @yield {Array<String>} w.steps All of the step names that are currently defined, in order
 * @public
 */
export default Component.extend({
  layout,
  tagName: '',

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
   * Whether the initial render cycle has completed
   *
   * Used to prevent a double-render-cycle when yielding an array of steps
   *
   * @property {boolean} _hasRendered
   * @private
   */
  _hasRendered: false,

  /**
   * Used internally to track the previous step
   *
   * @property {string} _lastStep
   * @private
   */
  _lastStep: undefined,

  /**
   * Used internally to transition to a specific named step
   *
   * @method doTransition
   * @param {string} to the name of the step to transition to
   * @param {string} from the name of the step being transitioned
   * @private
   */
  doTransition(to) {
    // Update the `currentStep` if it's mutable
    if (!isEmpty(get(this, 'currentStep'))) {
      set(this, 'currentStep', to);
    }

    // Activate the next step
    get(this, 'transitions').activate(to);
  },

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

  didInsertElement() {
    this._super(...arguments);

    set(this, '_hasRendered', true);
  },

  actions: {
    /**
     * Register a step with the manager
     *
     * Adds a set to the internal registry of steps by name.  If no name is
     * provided, a name will be assigned by index.
     *
     * @action register-step-component
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
     * @action transition-to
     * @param {string} to the name of the step to transition to
     * @param {*} value the value to pass to the transition actions
     * @public
     */
    'transition-to'(to) {
      this.doTransition(to);
    },

    /**
     * Transition to the "next" step
     *
     * When called, this action will advance from the current step to the next
     * one, as defined by the order of their insertion into the DOM (AKA, the
     * order in the template).
     *
     * @action transition-to-next
     * @public
     */
    'transition-to-next'() {
      const to = get(this, 'transitions').pickNext();

      this.doTransition(to);
    },

    /**
     * Transition to the "previous" step
     *
     * When called, this action will go back to the previous step according to
     * the step which was visited before entering the currentStep
     *
     * @action transition-to-previous
     * @public
     */
    'transition-to-previous'() {
      const to = get(this, 'transitions').pickPrevious();

      this.doTransition(to);
    }
  }
});
