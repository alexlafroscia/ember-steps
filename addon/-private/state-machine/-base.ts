import EmberObject, { set } from '@ember/object';
import MutableArray from '@ember/array/mutable';
import { isBlank, isPresent } from '@ember/utils';
import { A } from '@ember/array';
import { readOnly } from '@ember-decorators/object/computed';
import { assert } from '@ember/debug';

import { StepName } from '../types';
import StepNode from '../step-node';

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

  currentStep!: StepName;

  @readOnly('stepTransitions.length') length!: number;

  @readOnly('stepTransitions.firstObject') firstStep!: StepName;

  constructor(initialStepName?: StepName) {
    super();

    if (isPresent(initialStepName)) {
      set(this, 'currentStep', initialStepName!);
    }
  }

  addStep(name: StepName, context: any) {
    const node = new StepNode(this, name, context);
    this.stepTransitions.pushObject(node);

    if (isBlank(this.currentStep)) {
      set(this, 'currentStep', name);
    }
  }

  removeStep(name: StepName) {
    const node = this.stepTransitions.find(node => node.name === name);

    assert('Could not find a step of that name', !!node);

    const index = this.stepTransitions.indexOf(node!);

    this.stepTransitions.removeAt(index);
  }

  updateContext(name: StepName, context: any) {
    const node = this.stepTransitions.find(node => node.name === name);

    assert(`"${name}" does not match an existing step`, !!node);

    set(node!, 'context', context);
  }

  abstract pickNext(currentStep?: StepName): StepName | undefined;

  abstract pickPrevious(currentStep?: StepName): StepName | undefined;

  activate(step: StepNode | StepName) {
    const name = step instanceof StepNode ? step.name : step;

    assert('No step name was provided', isPresent(step));
    assert(
      `"${name}" does not match an existing step`,
      this.stepTransitions.map(node => node.name).includes(name)
    );

    set(this, 'currentStep', name);
  }
}
