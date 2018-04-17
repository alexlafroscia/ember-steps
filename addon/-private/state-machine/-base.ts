import Ember from 'ember';
import EmberObject, {
  set,
  get,
  setProperties,
  getProperties
} from '@ember/object';
import { isPresent } from '@ember/utils';
import { A } from '@ember/array';
import { readOnly } from '@ember-decorators/object/computed';
import { assert } from '@ember/debug';
import { scheduleOnce, bind } from '@ember/runloop';
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

  stepsToRemove: Ember.NativeArray<string> = A();

  stepsToAdd: Ember.NativeArray<string> = A();

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

    this.stepTransitions.pushObject(name);

    bind(
      this,
      scheduleOnce,
      'actions',
      this,
      this.updateFirstCurrentAndLastSteps
    )();
  }

  removeStep(this: StateMachine, name: string) {
    if (!this.stepTransitions.includes(name)) {
      return;
    }

    this.stepTransitions.removeObject(name);

    bind(
      this,
      scheduleOnce,
      'actions',
      this,
      this.updateFirstCurrentAndLastSteps
    )();
  }

  updateFirstCurrentAndLastSteps(this: StateMachine) {
    const len = get(this.stepTransitions, 'length');
    let nameIdx = this.stepTransitions.indexOf(this.currentStep);

    if (len === 0) {
      setProperties(this, {
        firstStep: null,
        currentStep: null,
        lastStep: null
      });

      this.stepTransitions.clear();
      return;
    }

    if (nameIdx === -1) {
      nameIdx = 0;
    }

    setProperties(this, {
      firstStep: this.stepTransitions.objectAt(0),
      currentStep: this.stepTransitions.objectAt(nameIdx),
      lastStep: this.stepTransitions.objectAt(len - 1)
    });
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
