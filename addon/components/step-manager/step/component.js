import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const { Component, computed, get, run } = Ember;
const { scheduleOnce } = run;
const layout = hbs`
  {{#if isActive}}
    {{yield}}
  {{else if hasInactiveState}}
    {{yield to='inverse'}}
  {{/if}}
`;

export default Component.extend({
  // Configure ember-hook
  hook: 'ember-wizard-step',
  hookQualifiers: computed('name', function() {
    const name = get(this, 'name');
    const properties = {};

    if (name) {
      properties.name = name;
    }

    return properties;
  }),

  layout,

  init() {
    this._super(...arguments);

    this.registerStepTimer = scheduleOnce('afterRender', this, 'register-step', this);
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
   * @public
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
