import EmberObject, { set, get } from '@ember/object';
import { A } from '@ember/array';
import { computed } from '@ember-decorators/object';
import { readOnly } from '@ember-decorators/object/computed';
import { assert } from '@ember/debug';
import { isNone } from '@ember/utils';

import StepNode from '../step-node';

/**
 * Keeps track of the order of the steps in the step manager, as well as
 * the current step.
 *
 * @class BaseStateMachine
 * @private
 * @hide
 */
export default class BaseStateMachine extends EmberObject {
  stepTransitions = A();

  currentStep;

  @readOnly('stepTransitions.length') length;

  @readOnly('stepTransitions.firstObject') firstStep;

  @computed('currentStep')
  get currentStepNode() {
    const currentStep = get(this, 'currentStep');

    return this.stepTransitions.find(stepNode => stepNode.name === currentStep);
  }

  addStep(name, context, onActivate, onDeactivate) {
    const node = new StepNode(this, name, context, onActivate, onDeactivate);
    this.stepTransitions.pushObject(node);

    if (typeof this.currentStep === 'undefined') {
      set(this, 'currentStep', name);
    }
  }

  removeStep(name) {
    const node = this.stepTransitions.find(node => node.name === name);

    assert('Could not find a step of that name', !!node);

    const index = this.stepTransitions.indexOf(node);

    this.stepTransitions.removeAt(index);
  }

  updateStepNode(name, field, value) {
    const node = this.stepTransitions.find(node => node.name === name);

    assert(`"${name}" does not match an existing step`, !!node);

    set(node, field, value);
  }

  pickNext() {
    throw new Error('Must implement method');
  }

  pickPrevious() {
    throw new Error('Must implement method');
  }

  activate(step) {
    const name = step instanceof StepNode ? step.name : step;

    assert('No step name was provided', !isNone(step));
    assert(
      `"${name}" does not match an existing step`,
      this.stepTransitions.map(node => node.name).includes(name)
    );

    set(this, 'currentStep', name);
  }
}
