import { get } from '@ember/object';
import { isPresent } from '@ember/utils';

import { computed } from '@ember/object';

import { StepName, ActivationHook } from './types';
import StateMachine from './state-machine/-base';

export type PublicProperty = 'context' | 'onActivate' | 'onDeactivate';

export default class StepNode {
  name: StepName;
  context: any;
  onActivate: ActivationHook;
  onDeactivate: ActivationHook;

  constructor(
    private sm: StateMachine,
    name: StepName,
    context: any,
    onActivate: ActivationHook,
    onDeactivate: ActivationHook
  ) {
    this.name = name;
    this.context = context;
    this.onActivate = onActivate;
    this.onDeactivate = onDeactivate;
  }

  get hasNext(): boolean {
    return isPresent(this.sm.pickNext(this.name));
  }

  get hasPrevious(): boolean {
    return isPresent(this.sm.pickPrevious(this.name));
  }

  @computed('sm.currentStep')
  get isActive(): boolean {
    return get(this.sm, 'currentStep') === this.name;
  }
}
