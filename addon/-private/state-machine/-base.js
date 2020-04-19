import { TrackedSet } from 'tracked-maps-and-sets';
import { tracked } from '@glimmer/tracking';
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
export default class BaseStateMachine {
  /** @type {TrackedSet<StepNode>} **/
  @tracked nodes = new TrackedSet();

  /** @type {string} **/
  @tracked currentStep;

  constructor(initialStep) {
    this.currentStep = initialStep;
  }

  get length() {
    return this.nodes.size;
  }

  get firstStepName() {
    const firstNode = this.nodeArray[0];

    return firstNode && firstNode.name;
  }

  get currentStepNode() {
    return this.nodeArray.find(
      (stepNode) => stepNode.name === this.currentStep
    );
  }

  get nodeArray() {
    return [...this.nodes];
  }

  addStep(stepComponent) {
    const node = new StepNode(this, stepComponent);
    this.nodes.add(node);

    if (typeof this.currentStep === 'undefined') {
      this.currentStep = stepComponent.name;
    }
  }

  removeStep(stepComponent) {
    const node = this.nodeArray.find(
      (step) => step.component === stepComponent
    );

    assert(`Could not find a step with name: ${node.name}`, node);

    this.nodes.delete(node);
  }

  updateStepNode(name, field, value) {
    const node = this.nodeArray.find((node) => node.name === name);

    assert(`"${name}" does not match an existing step`, node);

    node[field] = value;
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
      this.nodeArray.map((node) => node.name).includes(name)
    );

    this.currentStep = name;
  }
}
