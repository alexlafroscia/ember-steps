import { get } from '@ember/object';
import { isPresent } from '@ember/utils';

import { StepName } from './types';
import StateMachine from './state-machine/-base';

export default class StepNode {
  name: StepName;
  context: any;

  constructor(private sm: StateMachine, name: StepName, context: any) {
    this.name = name;
    this.context = context;
  }

  get hasNext(): boolean {
    return isPresent(this.sm.pickNext(this.name));
  }

  get hasPrevious(): boolean {
    return isPresent(this.sm.pickPrevious(this.name));
  }

  get isActive(): boolean {
    return get(this.sm, 'currentStep') === this.name;
  }
}
