import Component from '@ember/component';
import { get, set } from '@ember/object';
import { isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import { computed } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';

// @ts-ignore: Ignore import of compiled template
import layout from '../../templates/components/step-manager/step';

function failOnNameChange() {
  assert('The `name` property should never change');
}

@tagName('')
export default class StepComponent extends Component {
  layout = layout;

  name;
  context;
  onActivate;
  onDeactivate;

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
    this.addObserver('onActivate', this, this.updateOnActivate);
    this.addObserver('onDeactivate', this, this.updateOnDeactivate);

    this['register-step'](this);
  }

  willDestroyElement() {
    this.removeObserver('name', this, failOnNameChange);
    this.removeObserver('context', this, this.updateContext);
    this.removeObserver('onActivate', this, this.updateOnActivate);
    this.removeObserver('onDeactivate', this, this.updateOnDeactivate);
    this['remove-step'](this);
  }

  updateContext() {
    const context = get(this, 'context');

    this['update-step-node'](this, 'context', context);
  }

  updateOnActivate() {
    const onActivate = get(this, 'onActivate');

    this['update-step-node'](this, 'onActivate', onActivate);
  }

  updateOnDeactivate() {
    const onDeactivate = get(this, 'onDeactivate');

    this['update-step-node'](this, 'onDeactivate', onDeactivate);
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
