import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const { Component, computed, isEmpty, get, set } = Ember;
const { oneWay } = computed;
const layout = hbs`
  {{yield (hash
    step=(component 'step-manager/step'
      currentStep=currentStep
      register-step=(action 'register-step-component')
    )
    transition-to=(action 'transition-to-step')
  )}}
`;

export default Component.extend({
  // Configure ember-hook
  hook: 'ember-wizard-step-manager',

  // Attach the layout
  layout,

  /**
   * @property {string} the step to start on
   * @public
   */
  initialStep: null,

  /**
   * @property {string} currentStep the current active step
   * @private
   */
  currentStep: oneWay('initialStep'),

  actions: {
    /**
     * Register a step with the wizard
     *
     * Called by a step component to get it's index number assignment
     *
     * @method registerStep
     * @param {string} name the name of the step being registered
     * @returns number
     * @private
     */
    'register-step-component'(name) {
      const currentStep = get(this, 'currentStep');

      if (isEmpty(currentStep)) {
        set(this, 'currentStep', name);
      }
    },

    'transition-to-step'(name, option) {
      if (isEmpty(name)) {
        throw new Error('You must provide a step to transition to');
      }

      set(this, 'currentStep', name);
      if (this['on-transition']) {
        this['on-transition'](...arguments);
      }
    }
  }
});
