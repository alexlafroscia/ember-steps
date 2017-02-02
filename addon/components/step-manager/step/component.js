import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { StepNameError } from 'ember-steps/-private/errors';

const { Component, computed, get, isBlank } = Ember;
const layout = hbs`
  {{#if isActive}}
    {{yield}}
  {{else if hasInactiveState}}
    {{yield to='inverse'}}
  {{/if}}
`;

export default Component.extend({
  layout,
  tagName: '',

  init() {
    this._super(...arguments);

    const { name } = this.attrs;
    if (isBlank(name)) {
      throw new StepNameError('Name must be provided');
    }
    if (typeof name !== 'string') {
      throw new StepNameError('Name must be an immutable string');
    }

    this['register-step'](this);
  },

  didReceiveAttrs({ newAttrs }) {
    this._super(...arguments);

    const currentStep = get(newAttrs, 'currentStep.value');

    if (get(this, 'name') === currentStep && this['will-enter']) {
      this['will-enter']();
    }
  },

  didUpdateAttrs({ newAttrs, oldAttrs }) {
    this._super(...arguments);

    const name = get(this, 'name');
    const oldCurrentStep = get(oldAttrs, 'currentStep.value');
    const newCurrentStep = get(newAttrs, 'currentStep.value');

    if (oldCurrentStep === name && newCurrentStep !== name && this['will-exit']) {
      this['will-exit']();
    }
  },

  /**
   * Name used to transition to this step
   *
   * @property {string} name the name for this step
   * @public
   */
  name: null,

  /**
   * Whether this state is currently the active one
   * @property {boolean} isActive
   * @private
   */
  isActive: computed('currentStep', 'name', function() {
    return get(this, 'currentStep') === get(this, 'name');
  }),

  /**
   * Whether or not an inactive state should be displayed instead of
   * hiding the step entirely when not visible
   *
   * @property {boolean} hasInactiveState
   * @private
   */
  hasInactiveState: false,

  /**
   * @property {boolean} isVisible
   * @public
   */
  isVisible: computed('isActive', 'hasInactiveState', function() {
    return get(this, 'hasInactiveState') || get(this, 'isActive');
  })
});
