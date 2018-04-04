import Ember from 'ember';
import EmberObject, { set, get } from '@ember/object';
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
  /**
   * @property {A} stepTransitions
   * @private
   */
  stepTransitions: Ember.MutableArray<string> = A();

  /**
   * @property {string} firstStep
   * @private
   */
  firstStep: string;

  /**
   * @property {string} lastStep
   * @private
   */
  lastStep: string;

  /**
   * @property {string} currentStep
   * @public
   */
  currentStep: string;

  constructor(initialStep: string) {
    super();

    if (initialStep) {
      set(this, 'currentStep', initialStep);
    }
  }

  addStep(this: StateMachine, name: string) {
    if (this.stepTransitions.includes(name)) {
      return;
    }

    // Set the first step, if it hasn't been yet
    if (!get(this, 'firstStep')) {
      set(this, 'firstStep', name);
    }

    this.stepTransitions.pushObject(name);

    // Set the current step, if it hasn't been yet
    if (!get(this, 'currentStep')) {
      set(this, 'currentStep', name);
    }

    // Set the last step to this new one
    set(this, 'lastStep', name);
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

  /**
   * @property {number} length
   * @public
   */
  @readOnly('stepTransitions.length') length: number;
}
