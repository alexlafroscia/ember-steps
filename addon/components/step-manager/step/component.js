import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const { Component, computed, get, set } = Ember;
const layout = hbs`
  {{yield}}
`;

export default Component.extend({
  // Configure ember-hook
  hook: 'ember-wizard-step',
  hookQualifiers: computed('name', function() {
    const name = get(this, 'name');

    return { name };
  }),

  // Attach the layout
  layout,

  /**
   * Name used to transition to this step
   *
   * @property {string} name the name for this step
   * @public
   */
  name: null,

  /**
   * Step should only be visible when the `currentStep` matches the assigned index
   * for this step
   *
   * @property {boolean} isVisible
   * @public
   */
  isVisible: computed('currentStep', 'name', function() {
    return get(this, 'currentStep') === get(this, 'name');
  }),

  willInsertElement() {
    const name = get(this, 'name');
    this['register-step'](name);
  },

  actions: {
    'choose-option'() {
      this['selection-action'](...arguments);
    }
  }
});
