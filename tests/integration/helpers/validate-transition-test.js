import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import td from 'testdouble';

module('Integration | Helper | validate-transition', function(hooks) {
  setupRenderingTest(hooks);

  test('invokes the transition action if the validator passes', async function(assert) {
    const transition = td.function();
    this.set('transition', transition);
    this.set('validator', resolve => {
      resolve();
    });

    await render(hbs`
      <button onClick={{validate-transition transition with=validator}}>
        Validate
      </button>
    `);
    await click('button');

    assert.verify(transition());
  });

  test('does not invoke the transition action if the validator does not resolve', async function(assert) {
    const transition = td.function();
    this.set('transition', transition);
    this.set('validator', td.function());

    await render(hbs`
      <button onClick={{validate-transition transition with=validator}}>
        Validate
      </button>
    `);
    await click('button');

    assert.verify(transition(), { times: 0 });
  });

  test('allows you to pass additional arguments to the validator function', async function(assert) {
    const validator = td.function();
    this.set('transition', td.function());
    this.set('validator', validator);

    await render(hbs`
      <button onClick={{validate-transition transition with=(action validator 'foo' 1)}}>
        Validate
      </button>
    `);
    await click('button');

    assert.verify(
      validator(
        td.matchers.isA(String),
        td.matchers.isA(Number),
        td.matchers.isA(Function)
      )
    );
  });
});
