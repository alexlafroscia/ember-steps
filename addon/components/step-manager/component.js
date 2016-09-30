import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import WeakMap from 'ember-weakmap';

const { A, Component, isEmpty, get, run, set } = Ember;
const layout = hbs`
  {{yield (hash
    step=(component 'step-manager/step'
      register-step=(action 'register-step-component')
    )
    transition-to=(action 'transition-to-step')
    transition-to-next=(action 'transition-to-next-step')
  )}}
`;

export default Component.extend({
  // Configure ember-hook
  hook: 'ember-wizard-step-manager',

  layout,

  init() {
    this._super(...arguments);

    set(this, 'steps', {});
    set(this, 'transitions', new WeakMap());
    set(this, 'stepOrder', A());
  },

  /**
   * @property {string} the step to start on
   * @public
   */
  initialStep: null,

  /**
   * @property {string} currentStep the current active step
   * @private
   */
  currentStep: null,

  activateStep(stepComponent) {
    const currentStep = get(this, 'currentStep');

    run.schedule('render', function() {
      if (currentStep === stepComponent) {
        return;
      } else if (currentStep) {
        set(currentStep, 'isActive', false);
      }

      set(stepComponent, 'isActive', true);
    });

    set(this, 'currentStep', stepComponent);
  },

  /**
   * Get the `stepComponent` with a given name
   *
   * @method stepComponentFor
   * @param {string} name
   * @return {StepManager/Step}
   * @private
   */
  stepComponentFor(name) {
    return get(this, 'steps')[name];
  },

  /**
   * Get the "next" step from some given one
   * @method nextStepFor
   * @param {object} step
   * @return {object}
   * @private
   */
  nextStepFor(step) {
    return get(this, 'transitions').get(step);
  },

  didInsertElement() {
    const steps = get(this, 'stepOrder');
    const firstStep = get(steps, 'firstObject');

    steps.forEach((thisStep, index) => {
      let nextStep = steps.objectAt(index + 1);
      if (!nextStep) {
        nextStep = firstStep;
      }

      get(this, 'transitions').set(thisStep, nextStep);
    });
  },

  actions: {

    /**
     * Register a step with the wizard
     *
     * Called by a step component to get it's index number assignment
     *
     * @method registerStep
     * @param {string} name the name of the step being registered
     * @private
     */
    'register-step-component'(stepComponent) {
      const initialStepName = get(this, 'initialStep');
      const newStepName = get(stepComponent, 'name');
      const currentStep = get(this, 'currentStep');

      if (initialStepName && initialStepName === newStepName) {
        this.activateStep(stepComponent);
      } else if (!initialStepName && !currentStep) {
        this.activateStep(stepComponent);
      }

      get(this, 'steps')[newStepName] = stepComponent;
      get(this, 'stepOrder').pushObject(stepComponent);
    },

    /**
     * Transition to a named step
     *
     * @method transition-to-step
     * @param {string} name
     * @public
     */
    'transition-to-step'(name) {
      if (isEmpty(name)) {
        throw new Error('You must provide a step to transition to');
      }

      if (!get(this, 'steps')[name]) {
        throw new Error('Provided name is not valid');
      }

      const nextStep = this.stepComponentFor(name);
      this.activateStep(nextStep);

      if (this['on-transition']) {
        this['on-transition'](...arguments);
      }
    },

    /**
     * Transition to the "next" step
     *
     * When called, this action will advance from the current step to the next
     * one, as defined by the order of their insertion into the DOM (AKA, the
     * order in the template).
     *
     * The last step will transition back to the first one.
     *
     * @method transition-to-next-step
     * @public
     */
    'transition-to-next-step'() {
      const currentStep = get(this, 'currentStep');
      const nextStep = this.nextStepFor(currentStep);

      this.activateStep(nextStep);

      if (this['on-transition']) {
        this['on-transition'](...arguments);
      }
    }
  }
});
