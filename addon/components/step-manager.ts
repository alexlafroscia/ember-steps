import TaglessComponent from './-tagless';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/step-manager';
import { get, set } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { schedule } from '@ember/runloop';
import { assert } from '@ember/debug';
import { computed } from '@ember-decorators/object';
import CircularStateMachine from 'ember-steps/-private/state-machine/circular';
import LinearStateMachine from 'ember-steps/-private/state-machine/linear';

import StateMachine from 'ember-steps/-private/state-machine/-base';
import StepComponent from './step-manager/step';

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
 * @class StepManagerComponent
 * @yield {hash} w
 * @yield {Component} w.step Renders a step
 * @yield {Action} w.transition-to
 * @yield {Action} w.transition-to-next Render the next step
 * @yield {Action} w.transition-to-previous Render the previous step
 * @yield {string} w.currentStep The name of the current step
 * @yield {Array<String>} w.steps All of the step names that are currently defined, in order
 * @public
 * @hide
 */
export default class StepManagerComponent extends TaglessComponent {
  layout = layout;

  /**
   * Optionally can be provided to override the initial step to render
   *
   * @property {string} initialStep the initial step
   * @public
   */
  initialStep: string;

  /**
   * The `currentStep` property can be used for providing, or binding to, the
   * name of the current step.
   *
   * If provided, the initial step will come from the value of this property,
   * and the value will be updated whenever the step changes
   *
   * @property {string} currentStep the current active step
   * @public
   */
  currentStep: string;

  /**
   * @property {boolean} boolean
   * @public
   */
  linear: boolean;

  /**
   * @property {StateMachine} transitions state machine for transitions
   * @private
   */
  transitions: StateMachine;

  constructor() {
    // @ts-ignore: Ember type definition is incorrect
    super(...arguments);

    const initialStep: string =
      get(this, 'initialStep') || get(this, 'currentStep');

    if (!isPresent(this.linear)) {
      this.linear = true;
    }

    const StateMachine = this.linear
      ? LinearStateMachine
      : CircularStateMachine;

    set(this, 'transitions', new StateMachine(initialStep));
  }

  @computed('transitions.{currentStep,length}')
  get hasNextStep() {
    return isPresent(this.transitions.pickNext());
  }

  @computed('transitions.{currentStep,length}')
  get hasPreviousStep() {
    return isPresent(this.transitions.pickPrevious());
  }

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
    if (!isEmpty(this.currentStep)) {
      set(this, 'currentStep', to);
    }

    // Activate the next step
    this.transitions.activate(to);
  }

  didUpdateAttrs() {
    this._super(...arguments);

    const newStep = this.currentStep;

    if (typeof newStep === 'undefined') {
      const firstStep: string = this.transitions.firstStep;
      this.transitions.activate(firstStep);
    } else {
      this.transitions.activate(newStep);
    }
  }

  actions = {
    /**
     * Register a step with the manager
     *
     * Adds a step to the internal registry of steps by name.
     *
     * @action register-step-component
     * @param {string} name the name of the step being registered
     * @private
     */
    registerStepComponent(
      this: StepManagerComponent,
      stepComponent: StepComponent
    ) {
      const name = get(stepComponent, 'name');
      const transitions = this.transitions;

      stepComponent.transitions = transitions;

      transitions.addStep(name);
    },

    removeStepComponent(
      this: StepManagerComponent,
      stepComponent: StepComponent
    ) {
      const name = get(stepComponent, 'name');

      this.transitions.removeStep(name);
    },

    /**
     * Transition to a named step
     *
     * @action transition-to
     * @param {string} to the name of the step to transition to
     * @param {*} value the value to pass to the transition actions
     * @public
     */
    'transition-to'(this: StepManagerComponent, to: string) {
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
    'transition-to-next'(this: StepManagerComponent) {
      const to = this.transitions.pickNext();

      assert('There is no next step', !!to);

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
    'transition-to-previous'(this: StepManagerComponent) {
      const to = this.transitions.pickPrevious();

      assert('There is no previous step', !!to);

      this.doTransition(to);
    }
  };
}
