import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { initialize as initializeEmberHook, hook } from 'ember-hook';
import { click, findAll, render } from '@ember/test-helpers';
import { A } from '@ember/array';

module('step-manager', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(initializeEmberHook);

  module('`currentStep` attribute', function() {
    test('setting the initial visible step', async function(assert) {
      await render(hbs`
        {{#step-manager currentStep='second' as |w|}}
          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom(hook('first')).doesNotExist();
      assert.dom(hook('second')).exists();
    });

    test('changes steps when the property changes', async function(assert) {
      this.set('step', 'first');
      await render(hbs`
        {{#step-manager currentStep=step as |w|}}
          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom(hook('first')).exists();
      assert.dom(hook('second')).doesNotExist();

      this.set('step', 'second');

      assert.dom(hook('first')).doesNotExist();
      assert.dom(hook('second')).exists();

      // Important for binding current step to a query param
      this.set('step', undefined);

      assert.dom(hook('first')).exists();
      assert.dom(hook('second')).doesNotExist();
    });

    module('updating the target object from the component', function() {
      test("mutates the target object's property when a mutable value is provided", async function(assert) {
        this.set('step', 'first');
        await render(hbs`
          {{#step-manager currentStep=(mut step) as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}

            <button {{action w.transition-to 'second'}}>
              Next
            </button>
          {{/step-manager}}
        `);

        await click('button');

        assert.equal(this.get('step'), 'second');
      });

      test("mutates the target object's property when a regular value is provided", async function(assert) {
        this.set('step', 'first');
        await render(hbs`
          {{#step-manager currentStep=step as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}

            <button {{action w.transition-to 'second'}}>
              Next
            </button>
          {{/step-manager}}
        `);

        await click('button');

        assert.equal(this.get('step'), 'second');
      });

      test('does not update the target object with an unbound value', async function(assert) {
        this.set('step', 'first');
        await render(hbs`
          {{#step-manager currentStep=(unbound step) as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}

            <button {{action w.transition-to 'second'}}>
              Next
            </button>
          {{/step-manager}}
        `);

        await click('button');

        assert.equal(this.get('step'), 'first');
      });
    });
  });

  module('`initialStep` attribute', function() {
    test('it can set the initial visible step', async function(assert) {
      await render(hbs`
        {{#step-manager initialStep='second' as |w|}}
          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom(hook('first')).doesNotExist();
      assert.dom(hook('second')).exists();
    });

    test('it does not update the value as the step changes', async function(assert) {
      this.set('initialStep', 'second');
      await render(hbs`
        {{#step-manager initialStep=initialStep as |w|}}
          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}

          <button {{action w.transition-to 'first'}}>
            To First
          </button>
        {{/step-manager}}
      `);

      await click('button');

      assert.dom(hook('first')).exists();
      assert.equal(this.get('initialStep'), 'second');
    });
  });

  test('renders the first step in the DOM if no `currentStep` is present', async function(assert) {
    await render(hbs`
      {{#step-manager as |w|}}
        {{#w.step name='first'}}
          <div data-test={{hook 'first'}}></div>
        {{/w.step}}

        {{#w.step name='second'}}
          <div data-test={{hook 'second'}}></div>
        {{/w.step}}
      {{/step-manager}}
    `);

    assert.dom(hook('first')).exists();
    assert.dom(hook('second')).doesNotExist();
  });

  test('renders tagless components', async function(assert) {
    await render(hbs`
      <div id="steps">
        {{#step-manager as |w|}}
          {{w.step}}
        {{/step-manager}}
      </div>
    `);

    assert.equal(findAll('#steps *').length, 0);
  });

  module('`yield`-ed data', function() {
    test('exposes the name of the current step', async function(assert) {
      await render(hbs`
        {{#step-manager as |w|}}
          <div data-test={{hook 'steps'}}>
            {{w.currentStep}}

            {{w.step name='foo'}}
          </div>
        {{/step-manager}}
      `);

      assert.dom(hook('steps')).hasText('foo');
    });

    module('exposing an array of steps', function() {
      test('can render the array after the steps are defined', async function(assert) {
        await render(hbs`
          {{#step-manager as |w|}}
            <div data-test={{hook 'active-step'}}>
              {{#w.step name='foo'}}
                Foo
              {{/w.step}}

              {{#w.step name='bar'}}
                Bar
              {{/w.step}}
            </div>

            {{#each w.steps as |step|}}
              <a {{action w.transition-to step}} data-test={{hook 'step-trigger' step=step}}>
                {{step}}
              </a>
            {{/each}}
          {{/step-manager}}
        `);

        assert.dom(hook('step-trigger')).exists({ count: 2 });
        assert.dom(hook('step-trigger', { step: 'foo' })).hasText('foo');
        assert.dom(hook('step-trigger', { step: 'bar' })).hasText('bar');

        assert.dom(hook('active-step')).hasText('Foo');

        await click(hook('step-trigger', { step: 'bar' }));

        assert.dom(hook('active-step')).hasText('Bar');
      });

      test('can render the array before the steps are defined', async function(assert) {
        await render(hbs`
          {{#step-manager as |w|}}
            {{#each w.steps as |step|}}
              <a {{action w.transition-to step}} data-test={{hook 'step-trigger' step=step}}>
                {{step}}
              </a>
            {{/each}}

            <div data-test={{hook 'active-step'}}>
              {{#w.step name='foo'}}
                Foo
              {{/w.step}}

              {{#w.step name='bar'}}
                Bar
              {{/w.step}}
            </div>
          {{/step-manager}}
        `);

        assert.dom(hook('step-trigger')).exists({ count: 2 });
        assert.dom(hook('step-trigger', { step: 'foo' })).hasText('foo');
        assert.dom(hook('step-trigger', { step: 'bar' })).hasText('bar');

        assert.dom(hook('active-step')).hasText('Foo');

        await click(hook('step-trigger', { step: 'bar' }));

        assert.dom(hook('active-step')).hasText('Bar');
      });
    });
  });

  module('transitions to named steps', function() {
    test('can transition to another step', async function(assert) {
      await render(hbs`
        {{#step-manager currentStep='first' as |w|}}
          <button {{action w.transition-to 'second'}}>
            Transition to Next
          </button>

          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom(hook('first')).exists();
      assert.dom(hook('second')).doesNotExist();

      await click('button');

      assert.dom(hook('first')).doesNotExist();
      assert.dom(hook('second')).exists();
    });

    skip('errors when transitioning to an invalid step', function(assert) {
      assert.throws(async () => {
        await render(hbs`
          {{#step-manager currentStep='first' as |w|}}
            <button {{action w.transition-to 'second'}}>
              Transition to Next
            </button>

            {{w.step name='first'}}
          {{/step-manager}}
        `);

        await click('button');
      }, Error);
    });
  });

  module('exposing whether there is a next step', function() {
    test('linear step managers', async function(assert) {
      await render(hbs`
        {{#step-manager as |w|}}
          <button {{action w.transition-to-next}} disabled={{not w.hasNextStep}}>
            Next!
          </button>

          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('button').doesNotHaveAttribute('disabled');

      await click('button');

      assert.dom('button').hasAttribute('disabled');
    });

    test('circular step manager', async function(assert) {
      await render(hbs`
        {{#step-manager linear=false as |w|}}
          <button {{action w.transition-to-next}} disabled={{not w.hasNextStep}}>
            Next!
          </button>

          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('button').doesNotHaveAttribute('disabled');

      await click('button');

      assert.dom('button').doesNotHaveAttribute('disabled');
    });
  });

  module('exposing whether there is a next previous', function() {
    test('linear step managers', async function(assert) {
      await render(hbs`
        {{#step-manager as |w|}}
          <button {{action w.transition-to-previous}} disabled={{not w.hasPreviousStep}}>
            Next!
          </button>

          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('button').hasAttribute('disabled');
    });

    test('circular step manager', async function(assert) {
      await render(hbs`
        {{#step-manager linear=false as |w|}}
          <button {{action w.transition-to-next}} disabled={{not w.hasPreviousStep}}>
            Next!
          </button>

          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('button').doesNotHaveAttribute('disabled');
    });
  });

  module('transition to anonymous steps', function() {
    module('with the circular state manager', function() {
      test('can transition to the next step', async function(assert) {
        await render(hbs`
          {{#step-manager linear=false as |w|}}
            <button {{action w.transition-to-next}}>
              Next!
            </button>

            {{#w.step name='first'}}
              <div data-test={{hook 'first'}}></div>
            {{/w.step}}

            {{#w.step name='second'}}
              <div data-test={{hook 'second'}}></div>
            {{/w.step}}

            {{#w.step name='third'}}
              <div data-test={{hook 'third'}}></div>
            {{/w.step}}
          {{/step-manager}}
        `);

        assert.dom(hook('first')).exists();
        assert.dom(hook('second')).doesNotExist();
        assert.dom(hook('third')).doesNotExist();

        await click('button');

        assert.dom(hook('first')).doesNotExist();
        assert.dom(hook('second')).exists();
        assert.dom(hook('third')).doesNotExist();

        await click('button');

        assert.dom(hook('first')).doesNotExist();
        assert.dom(hook('second')).doesNotExist();
        assert.dom(hook('third')).exists();

        await click('button');

        assert.dom(hook('first')).exists();
        assert.dom(hook('second')).doesNotExist();
        assert.dom(hook('third')).doesNotExist();
      });

      test('can transition to the previous step', async function(assert) {
        await render(hbs`
          {{#step-manager linear=false as |w|}}
            <button id='previous' {{action w.transition-to-previous}}>
              Previous!
            </button>
            <button id='next' {{action w.transition-to-next}}>
              Next!
            </button>

            {{#w.step name='first'}}
              <div data-test={{hook 'first'}}></div>
            {{/w.step}}

            {{#w.step name='second'}}
              <div data-test={{hook 'second'}}></div>
            {{/w.step}}

            {{#w.step name='third'}}
              <div data-test={{hook 'third'}}></div>
            {{/w.step}}
          {{/step-manager}}
        `);

        assert.dom(hook('first')).exists();
        assert.dom(hook('second')).doesNotExist();
        assert.dom(hook('third')).doesNotExist();

        await click('#next');

        assert.dom(hook('first')).doesNotExist();
        assert.dom(hook('second')).exists();
        assert.dom(hook('third')).doesNotExist();

        await click('#next');

        assert.dom(hook('first')).doesNotExist();
        assert.dom(hook('second')).doesNotExist();
        assert.dom(hook('third')).exists();

        await click('#previous');

        assert.dom(hook('first')).doesNotExist();
        assert.dom(hook('second')).exists();
        assert.dom(hook('third')).doesNotExist();
      });
    });
  });

  module('assigning step indices', function() {
    test('works outside of a loop', async function(assert) {
      await render(hbs`
        {{#step-manager as |w|}}
          {{#w.step}}
            <div data-test={{hook 'step' index=0}}></div>
          {{/w.step}}
          {{#w.step}}
            <div data-test={{hook 'step' index=1}}></div>
          {{/w.step}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      assert.dom(hook('step', { index: 0 })).exists();
      assert.dom(hook('step', { index: 1 })).doesNotExist();

      await click('button');

      assert.dom(hook('step', { index: 0 })).doesNotExist();
      assert.dom(hook('step', { index: 1 })).exists();
    });
  });

  module('dynamically creating steps', function(hooks) {
    hooks.beforeEach(function() {
      this.set('data', A([{ name: 'foo' }, { name: 'bar' }]));
    });

    test('allows dynamically creating steps', async function(assert) {
      await render(hbs`
        {{#step-manager currentStep=(unbound data.firstObject.name) as |w|}}
          <div data-test={{hook 'steps'}}>
            {{#each data as |item|}}
              {{#w.step name=(unbound item.name)}}
                <div data-test={{hook 'step' name=item.name}}>
                  {{item.name}}
                </div>
              {{/w.step}}
            {{/each}}
          </div>

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      assert.dom(hook('step', { name: 'foo' })).exists();
      assert.dom(hook('step', { name: 'bar' })).doesNotExist();
      assert.dom(hook('steps')).hasText('foo');

      await click('button');

      assert.dom(hook('step', { name: 'foo' })).doesNotExist();
      assert.dom(hook('step', { name: 'bar' })).exists();
      assert.dom(hook('steps')).hasText('bar');
    });

    test('allows for adding more steps after the initial render', async function(assert) {
      await render(hbs`
        {{#step-manager linear=false currentStep=(unbound data.firstObject.name) as |w|}}
          <div data-test={{hook 'steps'}}>
            {{#each data as |item|}}
              {{#w.step name=(unbound item.name)}}
                <div data-test={{hook 'step' name=item.name}}>
                  {{item.name}}
                </div>
              {{/w.step}}
            {{/each}}
          </div>

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      await click('button');

      this.set('data', A([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]));

      assert.dom(hook('step', { name: 'foo' })).doesNotExist();
      assert.dom(hook('step', { name: 'bar' })).exists();
      assert.dom(hook('step', { name: 'baz' })).doesNotExist();

      // Check that the previous "last step" now points to the new one
      await click('button');

      assert.dom(hook('step', { name: 'foo' })).doesNotExist();
      assert.dom(hook('step', { name: 'bar' })).doesNotExist();
      assert.dom(hook('step', { name: 'baz' })).exists();
      assert.dom(hook('steps')).hasText('baz');

      // Check that the new step now points to the first one
      await click('button');

      assert.dom(hook('step', { name: 'foo' })).exists();
      assert.dom(hook('step', { name: 'bar' })).doesNotExist();
      assert.dom(hook('step', { name: 'baz' })).doesNotExist();
      assert.dom(hook('steps')).hasText('foo');
    });
  });
});
