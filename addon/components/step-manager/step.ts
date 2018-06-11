import Component from '@ember/component';
// @ts-ignore: Ignore import of compiled template
import layout from '../../templates/components/step-manager/step';
import { get, set } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import { computed } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';

import StateMachine from '../../-private/state-machine/-base';
import { StepName } from '../../-private/types';

function failOnNameChange() {
  assert('The `name` property should never change');
}

@tagName('')
export default class StepComponent extends Component {
  layout = layout;

  name!: StepName;
  context!: any;

  currentStep!: StepName;

  transitions!: StateMachine;

  'register-step'!: (stepComponent: StepComponent) => void;
  'remove-step'!: (stepComponent: StepComponent) => void;
  'update-context'!: (stepComponent: StepComponent, context: any) => void;

  constructor() {
    super(...arguments);

    const nameAttribute = get(this, 'name');
    const name = isEmpty(nameAttribute)
      ? Symbol('generated step name')
      : nameAttribute;

    assert('Step name cannot be a boolean', typeof name !== 'boolean');
    assert('Step name cannot be an object', typeof name !== 'object');

    if (name !== nameAttribute) {
      set(this, 'name', name);
    }
    this.addObserver('name', this, failOnNameChange);
    this.addObserver('context', this, this.updateContext);

    this['register-step'](this);
  }

  willDestroyElement() {
    this.removeObserver('name', this, failOnNameChange);
    this.removeObserver('context', this, this.updateContext);
    this['remove-step'](this);
  }

  private updateContext() {
    const context = get(this, 'context');

    this['update-context'](this, context);
  }

  /**
   * Whether this state is currently the active one
   * @property {boolean} isActive
   * @private
   */
  @computed('currentStep', 'name')
  get isActive(): boolean {
    return this.currentStep === this.name;
  }

  @computed('transitions.length')
  get hasNext(): boolean {
    const name = this.name;

    return isPresent(this.transitions.pickNext(name));
  }

  @computed('transitions.length')
  get hasPrevious(): boolean {
    const name = this.name;

    return isPresent(this.transitions.pickPrevious(name));
  }
}
