import TaglessComponent from './-tagless';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/step-manager';
import { get, set } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { schedule } from '@ember/runloop';
import { assert } from '@ember/debug';
import { action, computed } from '@ember-decorators/object';

import StateMachine from '../-private/state-machine/-base';
import CircularStateMachine from '../-private/state-machine/circular';
import LinearStateMachine from '../-private/state-machine/linear';

import { StepName } from '../-private/types';
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
 * @yield {StepName} w.currentStep The name of the current step
 * @yield {Array<String>} w.steps All of the step names that are currently defined, in order
 * @public
 * @hide
 */
export default class StepManagerComponent extends TaglessComponent {
  layout = layout;

  /* Optionally can be provided to override the initial step to render */
  initialStep: StepName;

  /**
   * The `currentStep` property can be used for providing, or binding to, the
   * name of the current step.
   *
   * If provided, the initial step will come from the value of this property,
   * and the value will be updated whenever the step changes
   */
  currentStep: StepName;

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
    super(...arguments);

    const initialStep = get(this, 'initialStep') || get(this, 'currentStep');

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

  didUpdateAttrs() {
    const newStep = this.currentStep;

    if (typeof newStep === 'undefined') {
      const firstStep = get(this.transitions, 'firstStep');
      this.transitions.activate(firstStep);
    } else {
      this.transitions.activate(newStep);
    }
  }

  @action
  registerStepComponent(stepComponent: StepComponent) {
    const name = get(stepComponent, 'name');
    const transitions = this.transitions;

    stepComponent.transitions = transitions;

    schedule('actions', () => {
      transitions.addStep(name);
    });
  }

  @action
  removeStepComponent(stepComponent: StepComponent) {
    const name = get(stepComponent, 'name');

    schedule('actions', () => {
      this.transitions.removeStep(name);
    });
  }

  @action
  transitionTo(to: StepName) {
    // If `currentStep` is present, it's probably something the user wants
    // two-way-bound with the new value
    if (!isEmpty(this.currentStep)) {
      set(this, 'currentStep', to);
    }

    this.transitions.activate(to);
  }

  @action
  transitionToNext() {
    const to = this.transitions.pickNext();

    assert('There is no next step', !!to);

    this.transitionTo(to);
  }

  @action
  transitionToPrevious() {
    const to = this.transitions.pickPrevious();

    assert('There is no previous step', !!to);

    this.transitionTo(to);
  }
}
