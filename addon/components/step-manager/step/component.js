import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const { Component, computed, get } = Ember;
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

  layout,

  init() {
    this._super(...arguments);

    this['register-step'](this);
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
  isActive: false,

  /**
   * @property {boolean} isVisible
   * @public
   */
  isVisible: computed('isActive', function() {
    return get(this, 'isActive');
  })
});
