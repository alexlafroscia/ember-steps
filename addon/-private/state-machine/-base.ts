import EmberObject, { set } from '@ember/object';
import MutableArray from '@ember/array/mutable';
import { isPresent } from '@ember/utils';
import { A } from '@ember/array';
import { readOnly } from '@ember-decorators/object/computed';
import { assert } from '@ember/debug';

/**
 * Keeps track of the order of the steps in the step manager, as well as
 * the current step.
 *
 * @class StateMachine
 * @private
 * @hide
 */
export default abstract class StateMachine extends EmberObject {
  protected stepTransitions: MutableArray<string> = A();

  currentStep: string;

  @readOnly('stepTransitions.length') length: number;

  @readOnly('stepTransitions.firstObject') firstStep: string;

  constructor(initialStep: string) {
    super();

    if (initialStep) {
      set(this, 'currentStep', initialStep);
    }
  }

  addStep(this: StateMachine, name: string) {
    this.stepTransitions.pushObject(name);

    if (!this.currentStep) {
      set(this, 'currentStep', name);
    }
  }

  removeStep(this: StateMachine, name: string) {
    const index = this.stepTransitions.indexOf(name);
    this.stepTransitions.removeAt(index);
  }

  abstract pickNext(currentStep?: string): string;

  abstract pickPrevious(currentStep?: string): string;

  activate(name: string) {
    assert('No step name was provided', isPresent(name));
    assert(
      `"${name}" does not match an existing step`,
      this.stepTransitions.includes(name)
    );

    set(this, 'currentStep', name);
  }
}
