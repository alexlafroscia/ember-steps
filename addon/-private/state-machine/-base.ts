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
  stepTransitions: Ember.MutableArray<any> = A();

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

  stepsToRemove: Ember.NativeArray<any> = A();

  stepsToAdd: Ember.NativeArray<any> = A();

  constructor(initialStep: string) {
    super();

    if (initialStep) {
      set(this, 'currentStep', initialStep);
    }
  }

  addStep(this: StateMachine, name: string) {
    if (this.stepsToAdd.includes(name)) {
      return;
    }

    this.stepsToAdd.push(name);
    return bind(
      this,
      scheduleOnce,
      'afterRender',
      this,
      this.flushAdditionQueue
    )();
  }

  removeStep(this: StateMachine, name: string) {
    if (this.stepsToRemove.includes(name)) {
      return;
    }

    this.stepsToRemove.push(name);
    return bind(this, scheduleOnce, 'render', this, this.flushRemoveQueue)();
  }

  flushAdditionQueue(this: StateMachine) {
    let { firstStep, currentStep, stepsToAdd, stepTransitions } = getProperties(
      this,
      'firstStep',
      'currentStep',
      'stepsToAdd',
      'stepTransitions'
    );
    let lastStep;

    A(stepsToAdd)
      // don't add steps that are already included
      .filter(name => !this.stepTransitions.includes(name))
      .forEach(name => {
        // Set the first step, if it hasn't been yet
        if (!firstStep) {
          firstStep = name;
        }

        this.stepTransitions.pushObject(name);

        // Set the current step, if it hasn't been yet
        if (!currentStep) {
          currentStep = name;
        }

        // Set the last step to this new one
        lastStep = name;
      });

    setProperties(this, {
      firstStep,
      currentStep,
      lastStep,
      stepsToAdd: A()
    });
  }

  flushRemoveQueue(this: StateMachine) {
    let {
      firstStep,
      currentStep,
      lastStep,
      stepsToRemove,
      stepsToAdd,
      stepTransitions
    } = getProperties(
      this,
      'firstStep',
      'currentStep',
      'lastStep',
      'stepsToRemove',
      'stepsToAdd',
      'stepTransitions'
    );

    //don't remove steps that are to be added
    stepsToRemove = A(
      stepsToRemove.filter(stepToRemove => !stepsToAdd.includes(stepToRemove))
    );

    if (get(stepsToRemove, 'length') === get(stepTransitions, 'length')) {
      setProperties(this, {
        firstStep: null,
        currentStep: null,
        lastStep: null,
        stepsToRemove: A(),
        stepTransitions: A()
      });

      return;
    }

    A(stepsToRemove).forEach(name => {
      this.stepTransitions.removeObject(name);

      if (get(this, 'firstStep') === name) {
        firstStep = this.stepTransitions.objectAt(0);
      }

      if (get(this, 'currentStep') === name) {
        const nameIdx = this.stepTransitions.indexOf(name);
        currentStep = this.stepTransitions.objectAt(nameIdx);
      }

      if (get(this, 'lastStep') === name) {
        const len = get(stepTransitions, 'length');
        lastStep = this.stepTransitions.objectAt(len - 1);
      }
    });

    setProperties(this, {
      firstStep,
      currentStep,
      lastStep,
      stepsToRemove: A()
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
