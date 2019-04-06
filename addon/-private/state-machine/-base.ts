import EmberObject, { set, get } from '@ember/object';
import MutableArray from '@ember/array/mutable';
import { A } from '@ember/array';
import { computed } from '@ember-decorators/object';
import { readOnly } from '@ember-decorators/object/computed';
import { assert } from '@ember/debug';
import { isNone } from '@ember/utils';

import { StepName, ActivationHook } from '../types';
import StepNode, {
  PublicProperty as PublicStepNodeProperty
} from '../step-node';
import { StepManager } from '../../components/step-manager';

/**
 * Keeps track of the order of the steps in the step manager, as well as
 * the current step.
 *
 * @class BaseStateMachine
 * @private
 * @hide
 */
export default abstract class BaseStateMachine extends EmberObject {
  protected stepTransitions: MutableArray<StepNode> = A();

  /**
   * The step which the State Machine starts on.
   *
   * @type {StepName}
   * @memberof BaseStateMachine
   */
  initialStep!: StepName;

  /**
   * The currently active step for the StateMachine.
   *
   * @type {StepName}
   * @memberof BaseStateMachine
   */
  currentStep!: StepName;

  @readOnly('stepTransitions.length') length!: number;

  @readOnly('stepTransitions.firstObject') firstStep!: StepNode;

  @computed('currentStep')
  get currentStepNode(): StepNode | undefined {
    const currentStep = get(this, 'currentStep');

    return this.stepTransitions.find(stepNode => stepNode.name === currentStep);
  }

  addStep(
    name: StepName,
    context: any,
    onActivate: ActivationHook,
    onDeactivate: ActivationHook,
    transitionTo: StepManager.transitionTo
  ) {
    const node = new StepNode(this, name, context, onActivate, onDeactivate);
    this.stepTransitions.pushObject(node);

    // Handle setting the first step if none is provided
    // By using the StepManagers's `transitionTo()`, we ensure that the various hooks are triggered for setting the intiial step
    if (
      typeof this.currentStep === 'undefined' &&
      (!this.initialStep || name === this.initialStep) &&
      typeof transitionTo === 'function'
    ) {
      transitionTo(name);
    }
  }

  removeStep(name: StepName) {
    const node = this.stepTransitions.find(node => node.name === name);

    assert('Could not find a step of that name', !!node);

    const index = this.stepTransitions.indexOf(node!);

    this.stepTransitions.removeAt(index);
  }

  updateStepNode(name: StepName, field: PublicStepNodeProperty, value: any) {
    const node = this.stepTransitions.find(node => node.name === name);

    assert(`"${name}" does not match an existing step`, !!node);

    set(node!, field, value);
  }

  pickNext(_currentStep?: StepName): StepName | undefined {
    throw new Error('Must implement method');
  }

  pickPrevious(_currentStep?: StepName): StepName | undefined {
    throw new Error('Must implement method');
  }

  activate(step: StepNode | StepName) {
    const name = step instanceof StepNode ? step.name : step;

    assert('No step name was provided', !isNone(step));
    assert(
      `"${name}" does not match an existing step`,
      this.stepTransitions.map(node => node.name).includes(name)
    );

    const prevStepNode = this.currentStepNode;
    if (prevStepNode instanceof StepNode && prevStepNode.onDeactivate) {
      prevStepNode.onDeactivate();
    }

    set(this, 'currentStep', name);

    const { currentStepNode } = this;
    if (currentStepNode instanceof StepNode && currentStepNode.onActivate) {
      currentStepNode.onActivate();
    }
  }
}
