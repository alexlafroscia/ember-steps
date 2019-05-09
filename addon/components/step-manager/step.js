import Component from '@ember/component';
import { get, set } from '@ember/object';
import { isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import { computed } from '@ember/object';

// @ts-ignore: Ignore import of compiled template
import layout from '../../templates/components/step-manager/step';

function failOnNameChange() {
  assert('The `name` property should never change');
}

export default class StepComponent extends Component {
  layout = layout;

  tagName = '';

  name;
  context;

  currentStep;

  transitions;

  'register-step';
  'remove-step';

  init() {
    super.init();

    const nameAttribute = get(this, 'name');
    const name =
      typeof nameAttribute === 'undefined'
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

  updateContext() {
    const context = get(this, 'context');

    this['update-step-node'](this, 'context', context);
  }

  /**
   * Whether this state is currently the active one
   * @property {boolean} isActive
   * @private
   */
  @computed('currentStep', 'name')
  get isActive() {
    return this.currentStep === this.name;
  }

  @computed('transitions.length')
  get hasNext() {
    const name = this.name;

    return isPresent(this.transitions.pickNext(name));
  }

  @computed('transitions.length')
  get hasPrevious() {
    const name = this.name;

    return isPresent(this.transitions.pickPrevious(name));
  }
}
