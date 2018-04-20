import EmberObject, { set } from '@ember/object';
import MutableArray from '@ember/array/mutable';
import { isPresent } from '@ember/utils';
import { A } from '@ember/array';
import { readOnly } from '@ember-decorators/object/computed';
import { assert } from '@ember/debug';

import { StepName } from 'ember-steps/components/step-manager/step';

/**
 * Keeps track of the order of the steps in the step manager, as well as
 * the current step.
 *
 * @class StateMachine
 * @private
 * @hide
 */
export default abstract class StateMachine extends EmberObject {
  protected stepTransitions: MutableArray<StepName> = A();

  currentStep: StepName;

  @readOnly('stepTransitions.length') length: number;

  @readOnly('stepTransitions.firstObject') firstStep: StepName;

  constructor(initialStep: StepName) {
    super();

    if (initialStep) {
      set(this, 'currentStep', initialStep);
    }
  }

  addStep(this: StateMachine, name: StepName) {
    this.stepTransitions.pushObject(name);

    if (!this.currentStep) {
      set(this, 'currentStep', name);
    }
  }

  removeStep(this: StateMachine, name: StepName) {
    const index = this.stepTransitions.indexOf(name);
    this.stepTransitions.removeAt(index);
  }

  abstract pickNext(currentStep?: StepName): StepName;

  abstract pickPrevious(currentStep?: StepName): StepName;

  activate(name: StepName) {
    assert('No step name was provided', isPresent(name));
    assert(
      `"${name}" does not match an existing step`,
      this.stepTransitions.includes(name)
    );

    set(this, 'currentStep', name);
  }
}
