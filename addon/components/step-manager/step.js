import Component from '@ember/component';
import { computed, get, observer } from '@ember/object';
import { isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import { macro as randomStringMacro } from '../../-private/generate-random-name';
import hbs from 'htmlbars-inline-precompile';

export default Component.extend({
  tagName: '',
  layout: hbs`
    {{#if isActive}}
      {{yield (hash
          hasNext=hasNext
          hasPrevious=hasPrevious
        )
      }}
    {{else if (hasBlock 'inverse')}}
      {{yield to='inverse'}}
    {{/if}}
  `,

  init() {
    this._super(...arguments);

    const name = get(this, 'name');
    assert('Step must have a name present', !!name);
    assert('Step must be a `string`', typeof name === 'string');

    this['register-step'](this);
  },

  _ensureNameDoesntChange: observer('name', function() {
    assert('The `name` property should never change');
  }),

  /**
   * Name used to transition to this step
   *
   * @property {string} name the name for this step
   * @public
   */
  name: randomStringMacro,

  transitions: null,

  /**
   * Whether this state is currently the active one
   * @property {boolean} isActive
   * @private
   */
  isActive: computed('currentStep', 'name', function() {
    return get(this, 'currentStep') === get(this, 'name');
  }),

  hasNext: computed('transitions.length', function() {
    const name = get(this, 'name');

    return isPresent(get(this, 'transitions').pickNext(name));
  }),

  hasPrevious: computed('transitions.length', function() {
    const name = get(this, 'name');

    return isPresent(get(this, 'transitions').pickPrevious(name));
  })
});
