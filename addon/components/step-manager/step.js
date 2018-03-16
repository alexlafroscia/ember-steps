import Component from '@ember/component';
import { get, computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import hbs from 'htmlbars-inline-precompile';
import { StepNameError } from 'ember-steps/-private/errors';

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

    const name = get(this, 'name');
    if (isBlank(name)) {
      throw new StepNameError('Name must be provided');
    }
    if (typeof name !== 'string') {
      throw new StepNameError('Name must be an immutable string');
    }

    this['register-step'](this);
  },

  /**
   * Used internally to track the "active" state of the last time the attributes
   * were updated.
   *
   * @property {boolean} _wasActive
   * @private
   */
  _wasActive: false,

  didReceiveAttrs() {
    this._super(...arguments);

    const isActive = get(this, 'isActive');
    const wasActive = this._wasActive;

    if (isActive && !wasActive && this['will-enter']) {
      this['will-enter']();
    }

    if (!isActive && wasActive && this['will-exit']) {
      this['will-exit']();
    }

    this._wasActive = isActive;
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
