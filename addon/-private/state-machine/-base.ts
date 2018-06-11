import EmberObject, { set } from '@ember/object';
import MutableArray from '@ember/array/mutable';
import { isPresent } from '@ember/utils';
import { A } from '@ember/array';
import { readOnly } from '@ember-decorators/object/computed';
import { assert } from '@ember/debug';

import { StepName } from '../types';

class StepNode {
  name: StepName;

  constructor(name: StepName) {
    this.name = name;
  }
}

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

  constructor(initialStep?: StepName) {
    super();

    if (initialStep) {
      set(this, 'currentStep', initialStep);
    }
  }

  addStep(name: StepName) {
    const node = new StepNode(name);
    this.stepTransitions.pushObject(node);

    if (!this.currentStep) {
      set(this, 'currentStep', name);
    }
  }

  removeStep(name: StepName) {
    const node = this.stepTransitions.find(node => node.name === name);

    assert('Could not find a step of that name', !!node);

    const index = this.stepTransitions.indexOf(node!);

    this.stepTransitions.removeAt(index);
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
