import { get } from '@ember/object';
import { isPresent } from '@ember/utils';

import { StepName } from './types';
import StateMachine from './state-machine/-base';

export default class StepNode {
  name: StepName;

  constructor(private sm: StateMachine, name: StepName) {
    this.name = name;
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
