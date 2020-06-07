import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isPresent, isNone } from '@ember/utils';
import { schedule } from '@ember/runloop';
import { assert } from '@ember/debug';
import { action } from '@ember/object';

import CircularStateMachine from '../-private/state-machine/circular';
import LinearStateMachine from '../-private/state-machine/linear';

import StepNode from '../-private/step-node';

/**
 * ```hbs
 * <StepManager as |w|>
 *   <w.Step @name="first">
 *     <h1>First Step</h1>
 *   </w.Step>
 *   <w.Step @name="second">
 *     <h1>Second Step</h1>
 *   </w.Step>
 * </StepManager>
 * ```
 *
 * @class StepManagerComponent
 * @yield {Hash} w Wizard Properties
 * @yield {StepComponent} w.Step The component to create steps
 * @yield {boolean} w.hasNextStep Whether or not the current step has a "next" step
 * @yield {boolean} w.hasPreviousStep Whether or not the current step has a "previous" step
 * @yield {string} w.currentStep Reflects the name of the active step
 * @yield {Array<StepNode>} w.steps The steps registered to the step manager
 * @yield {Action} w.transition-to Transition to a step by name
 * @yield {Action} w.transition-to-next Transition to the "next" step
 * @yield {Action} w.transition-to-previous Transition to the "previous" step
 */
export default class StepManagerComponent extends Component {
  /** @type {BaseStateMachine} state machine for transitions */
  @tracked transitions;

  constructor(...args) {
    super(...args);

    const { initialStep, currentStep } = this.args;

    this._watchCurrentStep = isPresent(currentStep);
    const startingStep = isNone(initialStep) ? currentStep : initialStep;

    const StateMachine = this.linear
      ? LinearStateMachine
      : CircularStateMachine;

    this.transitions = new StateMachine(startingStep);

    schedule('afterRender', this, function () {
      this._initialRegistrationComplete = true;
    });
  }

  /**
   * Whether to use a "Circular" or "Linear" state machine
   * @type {boolean}
   * @private
   */
  get linear() {
    return isPresent(this.args.linear) ? this.args.linear : true;
  }

  /**
   * Whether or not the current step has a "next" step
   * @type {boolean}
   */
  get hasNextStep() {
    return !isNone(this.transitions.pickNext());
  }

  /**
   * Whether or not the current step has a "previous" step
   * @type {boolean}
   */
  get hasPreviousStep() {
    return !isNone(this.transitions.pickPrevious());
  }

  /**
   * Reflects the name of the active step
   * @type {string}
   */
  get currentStep() {
    const newStep =
      typeof this.args.currentStep !== 'undefined'
        ? this.args.currentStep
        : this.transitions.firstStepName;
    const { currentStep } = this.transitions;

    if (
      this._watchCurrentStep &&
      this._initialRegistrationComplete &&
      newStep !== currentStep
    ) {
      schedule('actions', this, function () {
        this.transitionTo(newStep);
      });
    }

    return this.transitions.currentStep;
  }

  @action
  registerStepComponent(stepComponent) {
    stepComponent.transitions = this.transitions;

    schedule('actions', () => {
      this.transitions.addStep(stepComponent);
    });
  }

  @action
  removeStepComponent(stepComponent) {
    schedule('actions', () => {
      this.transitions.removeStep(stepComponent);
    });
  }

  @action
  updateStepNode(stepComponent, field, value) {
    const name = stepComponent.name;

    this.transitions.updateStepNode(name, field, value);
  }

  @action
  transitionTo(to) {
    const destination = to instanceof StepNode ? to.name : to;

    if (to !== this.transitions.currentStep) {
      this.transitions.activate(destination);

      if (this.args.onTransition) {
        this.args.onTransition(destination);
      }
    }
  }

  @action
  transitionToNext() {
    const to = this.transitions.pickNext();

    assert('There is no next step', !isNone(to));

    this.transitionTo(to);
  }

  @action
  transitionToPrevious() {
    const to = this.transitions.pickPrevious();

    assert('There is no previous step', !isNone(to));

    this.transitionTo(to);
  }
}
