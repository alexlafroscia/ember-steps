import TaglessComponent from '../-tagless';
import { computed, get, observer, set } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import generateRandomName from '../../-private/generate-random-name';
import hbs from 'htmlbars-inline-precompile';

import StateMachine from '../../-private/state-machine/-base';

function failOnNameChange() {
  assert('The `name` property should never change');
}

export default class StepComponent extends TaglessComponent {
  layout = hbs`
    {{#if isActive}}
      {{yield (hash
          hasNext=hasNext
          hasPrevious=hasPrevious
        )
      }}
    {{else if (hasBlock 'inverse')}}
      {{yield to='inverse'}}
    {{/if}}
  `;

  /**
   * Name used to transition to this step
   *
   * @property {string} name the name for this step
   * @public
   */
  name: string;

  transitions: StateMachine;

  constructor() {
    super();

    const nameAttribute = get(this, 'name');
    const name = isEmpty(nameAttribute) ? generateRandomName() : nameAttribute;

    assert('Step name must be a `string`', typeof name === 'string');

    if (name !== nameAttribute) {
      set(this, 'name', name);
    }
    this.addObserver('name', this, failOnNameChange);

    this['register-step'](this);
  }

  /**
   * Whether this state is currently the active one
   * @property {boolean} isActive
   * @private
   */
  isActive = computed('currentStep', 'name', function(): boolean {
    return this.currentStep === this.name;
  });

  hasNext = computed('transitions.length', function(): boolean {
    const name = this.name;

    return isPresent(this.transitions.pickNext(name));
  });

  hasPrevious = computed('transitions.length', function(): boolean {
    const name = this.name;

    return isPresent(this.transitions.pickPrevious(name));
  });
}
