import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isNone, isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import { guidFor } from '@ember/object/internals';

/**
 * ```hbs
 * <w.Step @name="first">
 *   <h1>First Step</h1>
 * </w.Step>
 * ```
 *
 * @class StepComponent
 * @yield {Hash} step Step Properties
 * @yield {boolean} step.hasPrevious Whether this step has a "previous" step
 * @yield {boolean} step.hasNext Whether this step has a "next" step
 */
export default class StepComponent extends Component {
  /** Set directly by manager through JS **/
  @tracked transitions;

  constructor(...args) {
    super(...args);

    this.args['register-step'](this);
  }

  willDestroy(...args) {
    this.args['remove-step'](this);

    super.willDestroy(...args);
  }

  /**
   * @type {string|number|Symbol}
   * @private
   */
  get name() {
    const initialName = !isNone(this.args.name)
      ? this.args.name
      : guidFor(this);

    if (this._hasSetName) {
      assert(
        'The `name` property should never change',
        this._initialName === initialName
      );
    }

    this._hasSetName = true;
    this._initialName = initialName;

    return initialName;
  }

  /**
   * Whether this state is currently the active one
   * @property {boolean} isActive
   * @private
   */
  get isActive() {
    return this.args.currentStep === this.name;
  }

  get hasNext() {
    return isPresent(this.transitions.pickNext(this.name));
  }

  get hasPrevious() {
    return isPresent(this.transitions.pickPrevious(this.name));
  }
}
