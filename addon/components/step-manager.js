import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/step-manager';
import { get, getProperties, set } from '@ember/object';
import { isPresent, isNone } from '@ember/utils';
import { schedule } from '@ember/runloop';
import { assert } from '@ember/debug';
import { action, computed } from '@ember/object';

import CircularStateMachine from '../-private/state-machine/circular';
import LinearStateMachine from '../-private/state-machine/linear';

import StepNode from '../-private/step-node';

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
export default class StepManagerComponent extends Component {
  layout = layout;

  tagName = '';

  /* Optionally can be provided to override the initial step to render */
  initialStep;

  /**
   * The `currentStep` property can be used for providing, or binding to, the
   * name of the current step.
   *
   * If provided, the initial step will come from the value of this property,
   * and the value will be updated whenever the step changes
   *
   * @property {string} currentStep
   * @public
   */
  currentStep;

  /**
   * Called when the state machine transitions, if provided
   *
   * Passed the new step identifier
   *
   * @property {function} onTransition;
   * @public
   */
  onTransition;

  /**
   * @property {boolean} boolean
   * @public
   */
  linear;

  /**
   * @property {boolean} boolean
   * @private
   */
  _watchCurrentStep;

  /**
   * @property {BaseStateMachine} transitions state machine for transitions
   * @private
   */
  transitions;

  init() {
    super.init();

    const { initialStep, currentStep } = getProperties(
      this,
      'initialStep',
      'currentStep'
    );

    this._watchCurrentStep = isPresent(currentStep);
    const startingStep = isNone(initialStep) ? currentStep : initialStep;

    if (!isPresent(this.linear)) {
      this.linear = true;
    }

    const StateMachine = this.linear
      ? LinearStateMachine
      : CircularStateMachine;

    set(
      this,
      'transitions',
      StateMachine.create({ currentStep: startingStep })
    );
  }

  @computed('transitions.{currentStep,length}')
  get hasNextStep() {
    return !isNone(this.transitions.pickNext());
  }

  @computed('transitions.{currentStep,length}')
  get hasPreviousStep() {
    return !isNone(this.transitions.pickPrevious());
  }

  didUpdateAttrs() {
    if (this._watchCurrentStep) {
      const newStep = this.currentStep;

      if (typeof newStep === 'undefined') {
        const firstStep = get(this.transitions, 'firstStep');
        this.transitionTo(firstStep);
      } else {
        this.transitionTo(newStep);
      }
    }
  }

  @action
  registerStepComponent(stepComponent) {
    const name = get(stepComponent, 'name');
    const context = get(stepComponent, 'context');
    const onActivate = get(stepComponent, 'onActivate');
    const onDeactivate = get(stepComponent, 'onDeactivate');
    const transitions = this.transitions;

    stepComponent.transitions = transitions;

    schedule('actions', () => {
      transitions.addStep(name, context, onActivate, onDeactivate);
    });
  }

  @action
  removeStepComponent(stepComponent) {
    const name = get(stepComponent, 'name');

    schedule('actions', () => {
      this.transitions.removeStep(name);
    });
  }

  @action
  updateStepNode(stepComponent, field, value) {
    const name = get(stepComponent, 'name');

    this.transitions.updateStepNode(name, field, value);
  }

  @action
  transitionTo(to) {
    const destination = to instanceof StepNode ? to.name : to;
    const transitions = get(this, 'transitions');
    const onTransition = get(this, 'onTransition');
    let currentStepNode = get(transitions, 'currentStepNode');

    if (currentStepNode && currentStepNode.onDeactivate) {
      currentStepNode.onDeactivate();
    }

    this.transitions.activate(destination);

    if (onTransition) {
      onTransition(destination);
    }

    currentStepNode = get(transitions, 'currentStepNode');

    if (currentStepNode && currentStepNode.onActivate) {
      currentStepNode.onActivate();
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
