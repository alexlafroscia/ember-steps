import TaglessComponent from '../-tagless';
// @ts-ignore: Ignore import of compiled template
import layout from '../../templates/components/step-manager/step';
import { get, observer, set } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import { computed } from '@ember-decorators/object';
import generateRandomName from '../../-private/generate-random-name';

import StateMachine from '../../-private/state-machine/-base';

function failOnNameChange() {
  assert('The `name` property should never change');
}

export default class StepComponent extends TaglessComponent {
  layout = layout;

  /**
   * Name used to transition to this step
   *
   * @property {string} name the name for this step
   * @public
   */
  name: string;

  currentStep: string;

  transitions: StateMachine;

  constructor() {
    // @ts-ignore: Ember type definition is incorrect
    super(...arguments);

    const nameAttribute = get(this, 'name');
    const name = isEmpty(nameAttribute) ? generateRandomName() : nameAttribute;

    assert('Step name must be a `string`', typeof name === 'string');

    if (name !== nameAttribute) {
      set(this, 'name', name);
    }
    this.addObserver('name', this, failOnNameChange);

    this['register-step'](this);
  }

  willDestroyElement() {
    this.removeObserver('name', this, failOnNameChange);
    this['remove-step'](this);
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
