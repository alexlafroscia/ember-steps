import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../templates/components/step-manager';
import { get, getProperties, set } from '@ember/object';
import { isPresent, isNone } from '@ember/utils';
import { schedule } from '@ember/runloop';
import { assert } from '@ember/debug';
import { action, computed } from '@ember/object';
import { tagName } from '@ember-decorators/component';

import BaseStateMachine from '../-private/state-machine/-base';
import CircularStateMachine from '../-private/state-machine/circular';
import LinearStateMachine from '../-private/state-machine/linear';

import { StepName } from '../-private/types';
import StepNode, {
  PublicProperty as PublicStepNodeProperty
} from '../-private/step-node';
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
@tagName('')
export default class StepManagerComponent extends Component {
  layout = layout;

  /* Optionally can be provided to override the initial step to render */
  initialStep: StepName | undefined;

  /**
   * The `currentStep` property can be used for providing, or binding to, the
   * name of the current step.
   *
   * If provided, the initial step will come from the value of this property,
   * and the value will be updated whenever the step changes
   */
  currentStep: StepName | undefined;

  /**
   * @property {boolean} boolean
   * @public
   */
  linear!: boolean;

  /**
   * @property {boolean} boolean
   * @private
   */
  _watchCurrentStep!: boolean;

  /**
   * @property {BaseStateMachine} transitions state machine for transitions
   * @private
   */
  transitions!: BaseStateMachine;

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
  registerStepComponent(stepComponent: StepComponent) {
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
  removeStepComponent(stepComponent: StepComponent) {
    const name = get(stepComponent, 'name');

    schedule('actions', () => {
      this.transitions.removeStep(name);
    });
  }

  @action
  updateStepNode(
    stepComponent: StepComponent,
    field: PublicStepNodeProperty,
    value: any
  ) {
    const name = get(stepComponent, 'name');

    this.transitions.updateStepNode(name, field, value);
  }

  @action
  transitionTo(to: StepName | StepNode) {
    const destination = to instanceof StepNode ? to.name : to;
    const transitions = get(this, 'transitions');
    let currentStepNode = get(transitions, 'currentStepNode');

    if (currentStepNode && currentStepNode.onDeactivate) {
      currentStepNode.onDeactivate();
    }

    // If `currentStep` is present, it's probably something the user wants
    // two-way-bound with the new value
    if (!isNone(this.currentStep)) {
      set(this, 'currentStep', destination);
    }

    this.transitions.activate(destination);

    currentStepNode = get(transitions, 'currentStepNode');

    if (currentStepNode && currentStepNode.onActivate) {
      currentStepNode.onActivate();
    }
  }

  @action
  transitionToNext() {
    const to = this.transitions.pickNext();

    assert('There is no next step', !isNone(to));

    this.transitionTo(to!);
  }

  @action
  transitionToPrevious() {
    const to = this.transitions.pickPrevious();

    assert('There is no previous step', !isNone(to));

    this.transitionTo(to!);
  }
}
