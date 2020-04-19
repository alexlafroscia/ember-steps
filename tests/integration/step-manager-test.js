import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { click, findAll, render, settled } from '@ember/test-helpers';
import { A } from '@ember/array';
import td from 'testdouble';

module('step-manager', function (hooks) {
  setupRenderingTest(hooks);

  module('`currentStep` attribute', function () {
    test('setting the initial visible step', async function (assert) {
      await render(hbs`
        <StepManager @currentStep='second' as |w|>
          <w.step @name='first'>
            <div data-test-first></div>
          </w.step>

          <w.step @name='second'>
            <div data-test-second></div>
          </w.step>
        </StepManager>
      `);

      assert.dom('[data-test-first]').doesNotExist();
      assert.dom('[data-test-second]').exists();
    });

    test('changes steps when the property changes', async function (assert) {
      this.set('step', 'first');
      await render(hbs`
        {{#step-manager currentStep=step as |w|}}
          {{#w.step name='first'}}
            <div data-test-first></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test-second></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('[data-test-first]').exists();
      assert.dom('[data-test-second]').doesNotExist();

      this.set('step', 'second');

      assert.dom('[data-test-first]').doesNotExist();
      assert.dom('[data-test-second]').exists();

      // Important for binding current step to a query param
      this.set('step', undefined);

      assert.dom('[data-test-first]').exists();
      assert.dom('[data-test-second]').doesNotExist();
    });

    test('does not mutate the `currentStep` property', async function (assert) {
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

      assert.equal(this.get('step'), 'first');
    });

    test('subscribing to step changes', async function (assert) {
      this.set('step', 'first');
      this.set('onTransition', td.function());

      await render(hbs`
        {{#step-manager currentStep=step onTransition=onTransition as |w|}}
          {{w.step name='first'}}
          {{w.step name='second'}}

          <button {{action w.transition-to 'second'}}>
            Next
          </button>
        {{/step-manager}}
      `);

      await click('button');

      assert.verify(
        this.onTransition('second'),
        'Called with the new step name'
      );
    });

    test('emulating a two-way binding to the current step', async function (assert) {
      this.set('step', 'first');

      await render(hbs`
        {{#step-manager currentStep=step onTransition=(action (mut step)) as |w|}}
          {{w.step name='first'}}
          {{w.step name='second'}}

          <button {{action w.transition-to 'second'}}>
            Next
          </button>
        {{/step-manager}}
      `);

      await click('button');

      assert.equal(
        this.get('step'),
        'second',
        'Step was updated to the new value'
      );
    });

    test('does not reset back to first step on any attribute change', async function (assert) {
      this.set('initialStep', 'second');
      this.set('randomAttribute', 'initial value');

      await render(hbs`
        {{#step-manager randomAttribute=randomAttribute initialStep=initialStep as |w|}}
          {{#w.step name='first'}}
            <div data-test-first></div>
          {{/w.step}}
          {{#w.step name='second'}}
            <div data-test-second></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('[data-test-second]').exists();
      assert.dom('[data-test-first]').doesNotExist();

      this.set('initialStep', 'second');
      this.set('randomAttribute', 'a new value');

      assert.dom('[data-test-second]').exists();
      assert.dom('[data-test-first]').doesNotExist();
    });
  });

  module('`initialStep` attribute', function () {
    test('it can set the initial visible step', async function (assert) {
      await render(hbs`
        {{#step-manager initialStep='second' as |w|}}
          {{#w.step name='first'}}
            <div data-test-first></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test-second></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('[data-test-first]').doesNotExist();
      assert.dom('[data-test-second]').exists();
    });

    test('it does not update the value as the step changes', async function (assert) {
      this.set('initialStep', 'second');
      await render(hbs`
        {{#step-manager initialStep=initialStep as |w|}}
          {{#w.step name='first'}}
            <div data-test-first></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test-second></div>
          {{/w.step}}

          <button {{action w.transition-to 'first'}}>
            To First
          </button>
        {{/step-manager}}
      `);

      await click('button');

      assert.dom('[data-test-first]').exists();
      assert.equal(this.get('initialStep'), 'second');
    });
  });

  test('renders the first step in the DOM if no `currentStep` is present', async function (assert) {
    await render(hbs`
      {{#step-manager as |w|}}
        {{#w.step name='first'}}
          <div data-test-first></div>
        {{/w.step}}

        {{#w.step name='second'}}
          <div data-test-second></div>
        {{/w.step}}
      {{/step-manager}}
    `);

    assert.dom('[data-test-first]').exists();
    assert.dom('[data-test-second]').doesNotExist();
  });

  test('renders tagless components', async function (assert) {
    await render(hbs`
      <div id="steps">
        {{#step-manager as |w|}}
          {{w.step}}
        {{/step-manager}}
      </div>
    `);

    assert.equal(findAll('#steps *').length, 0);
  });

  module('`yield`-ed data', function () {
    test('exposes the name of the current step', async function (assert) {
      await render(hbs`
        {{#step-manager as |w|}}
          <div data-test-steps>
            {{w.currentStep}}

            {{w.step name='foo'}}
          </div>
        {{/step-manager}}
      `);

      assert.dom('[data-test-steps]').hasText('foo');
    });

    module('exposing an array of steps', function () {
      test('it exposes whether the step has a next step', async function (assert) {
        await render(hbs`
          {{#step-manager as |w|}}
            {{w.step name='foo'}}
            {{w.step name='bar'}}

            {{#each w.steps as |step|}}
              <p data-test-step={{step.name}}>
                {{step.hasNext}}
              </p>
            {{/each}}
          {{/step-manager}}
        `);

        assert
          .dom('[data-test-step="foo"]')
          .hasText('true', 'The first step has a next step');
        assert
          .dom('[data-test-step="bar"]')
          .hasText('false', 'The second step does not have a next step');
      });

      test('it exposes whether the step has a previous step', async function (assert) {
        await render(hbs`
          {{#step-manager as |w|}}
            {{w.step name='foo'}}
            {{w.step name='bar'}}

            {{#each w.steps as |step|}}
              <p data-test-step={{step.name}}>
                {{step.hasPrevious}}
              </p>
            {{/each}}
          {{/step-manager}}
        `);

        assert
          .dom('[data-test-step="foo"]')
          .hasText('false', 'The first step does not have a previous step');
        assert
          .dom('[data-test-step="bar"]')
          .hasText('true', 'The second step has a previous step');
      });

      test('it exposes whether the step is active', async function (assert) {
        await render(hbs`
          {{#step-manager as |w|}}
            {{w.step name='foo'}}
            {{w.step name='bar'}}

            {{#each w.steps as |step|}}
              <button {{action w.transition-to step}} data-test-step={{step.name}}>
                {{step.isActive}}
              </button>
            {{/each}}
          {{/step-manager}}
        `);

        assert
          .dom('[data-test-step="foo"]')
          .hasText('true', 'The first step is active');
        assert
          .dom('[data-test-step="bar"]')
          .hasText('false', 'The second step is not active');

        await click('button[data-test-step="bar"]');

        assert
          .dom('[data-test-step="foo"]')
          .hasText('false', 'The first step has been deactivated');
        assert
          .dom('[data-test-step="bar"]')
          .hasText('true', 'The second step has been activated');
      });

      test('can transition to a step by passing the node', async function (assert) {
        await render(hbs`
          {{#step-manager as |w|}}
            {{#w.step name='foo'}}
              <p data-test-step="foo">Foo</p>
            {{/w.step}}
            {{#w.step name='bar'}}
              <p data-test-step="bar">Bar</p>
            {{/w.step}}

            {{#each w.steps as |step|}}
              <button {{action w.transition-to step}} data-test-transition-to={{step.name}}>
                {{step.name}}
              </button>
            {{/each}}
          {{/step-manager}}
        `);

        assert.dom('[data-test-step="foo"]').exists();
        assert.dom('[data-test-step="bar"]').doesNotExist();

        await click('button[data-test-transition-to="bar"]');

        assert.dom('[data-test-step="foo"]').doesNotExist();
        assert.dom('[data-test-step="bar"]').exists();
      });

      module('context', function () {
        test('it exposes step context', async function (assert) {
          await render(hbs`
            {{#step-manager as |w|}}
              {{w.step name='foo' context='bar'}}

              {{#each w.steps as |step|}}
                <p data-test-step={{step.name}}>
                  {{step.context}}
                </p>
              {{/each}}
            {{/step-manager}}
          `);

          assert.dom('[data-test-step="foo"]').hasText('bar');
        });

        test('changes to the context are bound', async function (assert) {
          this.set('context', { prop: 'foo' });

          await render(hbs`
            {{#step-manager as |w|}}
              {{w.step name='foo' context=context}}

              {{#each w.steps as |step|}}
                <p data-test-step={{step.name}}>
                  {{step.context.prop}}
                </p>
              {{/each}}
            {{/step-manager}}
          `);

          assert
            .dom('[data-test-step="foo"]')
            .hasText('foo', 'Displays the original context value');

          this.set('context.prop', 'bar');

          assert
            .dom('[data-test-step="foo"]')
            .hasText('bar', 'Displays the updated context value');
        });

        test('can handle the context object being replaced', async function (assert) {
          this.set('context', { prop: 'foo' });

          await render(hbs`
            {{#step-manager as |w|}}
              {{w.step name='foo' context=context}}

              {{#each w.steps as |step|}}
                <p data-test-step={{step.name}}>
                  {{step.context.prop}}
                </p>
              {{/each}}
            {{/step-manager}}
          `);

          assert
            .dom('[data-test-step="foo"]')
            .hasText('foo', 'Displays the original context value');

          this.set('context', { prop: 'bar' });

          assert
            .dom('[data-test-step="foo"]')
            .hasText('bar', 'Displays the updated context value');
        });
      });

      module('rendering position', function () {
        test('can render the array after the steps are defined', async function (assert) {
          await render(hbs`
            {{#step-manager as |w|}}
              <div data-test-active-step>
                {{#w.step name='foo'}}
                  Foo
                {{/w.step}}

                {{#w.step name='bar'}}
                  Bar
                {{/w.step}}
              </div>

              {{#each w.steps as |step|}}
                <a {{action w.transition-to step.name}} data-test-step-trigger={{step.name}}>
                  {{step.name}}
                </a>
              {{/each}}
            {{/step-manager}}
          `);

          assert.dom('[data-test-step-trigger]').exists({ count: 2 });
          assert.dom('[data-test-step-trigger="foo"]').hasText('foo');
          assert.dom('[data-test-step-trigger="bar"]').hasText('bar');

          assert.dom('[data-test-active-step]').hasText('Foo');

          await click('[data-test-step-trigger="bar"]');

          assert.dom('[data-test-active-step]').hasText('Bar');
        });

        test('can render the array before the steps are defined', async function (assert) {
          await render(hbs`
            {{#step-manager as |w|}}
              {{#each w.steps as |step|}}
                <a {{action w.transition-to step.name}} data-test-step-trigger={{step.name}}>
                  {{step.name}}
                </a>
              {{/each}}

              <div data-test-active-step>
                {{#w.step name='foo'}}
                  Foo
                {{/w.step}}

                {{#w.step name='bar'}}
                  Bar
                {{/w.step}}
              </div>
            {{/step-manager}}
          `);

          assert.dom('[data-test-step-trigger]').exists({ count: 2 });
          assert.dom('[data-test-step-trigger="foo"]').hasText('foo');
          assert.dom('[data-test-step-trigger="bar"]').hasText('bar');

          assert.dom('[data-test-active-step]').hasText('Foo');

          await click('[data-test-step-trigger="bar"]');

          assert.dom('[data-test-active-step]').hasText('Bar');
        });
      });
    });
  });

  module('transitions to named steps', function () {
    test('can transition to another step', async function (assert) {
      await render(hbs`
        {{#step-manager currentStep='first' as |w|}}
          <button {{action w.transition-to 'second'}}>
            Transition to Next
          </button>

          {{#w.step name='first'}}
            <div data-test-first></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test-second></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('[data-test-first]').exists();
      assert.dom('[data-test-second]').doesNotExist();

      await click('button');

      assert.dom('[data-test-first]').doesNotExist();
      assert.dom('[data-test-second]').exists();
    });
  });

  module('exposing whether there is a next step', function () {
    test('linear step manager', async function (assert) {
      await render(hbs`
        {{#step-manager as |w|}}
          <button {{action w.transition-to-next}} disabled={{not w.hasNextStep}}>
            Next!
          </button>

          {{#w.step name='first'}}
            <div data-test-first></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test-second></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('button').doesNotHaveAttribute('disabled');

      await click('button');

      assert.dom('button').hasAttribute('disabled');
    });

    test('circular step manager', async function (assert) {
      await render(hbs`
        {{#step-manager linear=false as |w|}}
          <button {{action w.transition-to-next}} disabled={{not w.hasNextStep}}>
            Next!
          </button>

          {{#w.step name='first'}}
            <div data-test-first></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test-second></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('button').doesNotHaveAttribute('disabled');

      await click('button');

      assert.dom('button').doesNotHaveAttribute('disabled');
    });
  });

  module('exposing whether there is a previous step', function () {
    test('linear step manager', async function (assert) {
      await render(hbs`
        {{#step-manager as |w|}}
          <button {{action w.transition-to-previous}} disabled={{not w.hasPreviousStep}}>
            Next!
          </button>

          {{#w.step name='first'}}
            <div data-test-first></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('button').hasAttribute('disabled');
    });

    test('circular step manager', async function (assert) {
      await render(hbs`
        {{#step-manager linear=false as |w|}}
          <button {{action w.transition-to-next}} disabled={{not w.hasPreviousStep}}>
            Next!
          </button>

          {{#w.step name='first'}}
            <div data-test-first></div>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('button').doesNotHaveAttribute('disabled');
    });
  });

  module('transition to anonymous steps', function () {
    module('with the circular state manager', function () {
      test('can transition to the next step', async function (assert) {
        await render(hbs`
          {{#step-manager linear=false as |w|}}
            <button {{action w.transition-to-next}}>
              Next!
            </button>

            {{#w.step name='first'}}
              <div data-test-first></div>
            {{/w.step}}

            {{#w.step name='second'}}
              <div data-test-second></div>
            {{/w.step}}

            {{#w.step name='third'}}
              <div data-test-third></div>
            {{/w.step}}
          {{/step-manager}}
        `);

        assert.dom('[data-test-first]').exists();
        assert.dom('[data-test-second]').doesNotExist();
        assert.dom('[data-test-third]').doesNotExist();

        await click('button');

        assert.dom('[data-test-first]').doesNotExist();
        assert.dom('[data-test-second]').exists();
        assert.dom('[data-test-third]').doesNotExist();

        await click('button');

        assert.dom('[data-test-first]').doesNotExist();
        assert.dom('[data-test-second]').doesNotExist();
        assert.dom('[data-test-third]').exists();

        await click('button');

        assert.dom('[data-test-first]').exists();
        assert.dom('[data-test-second]').doesNotExist();
        assert.dom('[data-test-third]').doesNotExist();
      });

      test('can transition to the previous step', async function (assert) {
        await render(hbs`
          {{#step-manager linear=false as |w|}}
            <button id='previous' {{action w.transition-to-previous}}>
              Previous!
            </button>
            <button id='next' {{action w.transition-to-next}}>
              Next!
            </button>

            {{#w.step name='first'}}
              <div data-test-first></div>
            {{/w.step}}

            {{#w.step name='second'}}
              <div data-test-second></div>
            {{/w.step}}

            {{#w.step name='third'}}
              <div data-test-third></div>
            {{/w.step}}
          {{/step-manager}}
        `);

        assert.dom('[data-test-first]').exists();
        assert.dom('[data-test-second]').doesNotExist();
        assert.dom('[data-test-third]').doesNotExist();

        await click('#next');

        assert.dom('[data-test-first]').doesNotExist();
        assert.dom('[data-test-second]').exists();
        assert.dom('[data-test-third]').doesNotExist();

        await click('#next');

        assert.dom('[data-test-first]').doesNotExist();
        assert.dom('[data-test-second]').doesNotExist();
        assert.dom('[data-test-third]').exists();

        await click('#previous');

        assert.dom('[data-test-first]').doesNotExist();
        assert.dom('[data-test-second]').exists();
        assert.dom('[data-test-third]').doesNotExist();
      });
    });
  });

  module('dynamically creating steps', function (hooks) {
    hooks.beforeEach(function () {
      this.set('data', A([{ name: 'foo' }, { name: 'bar' }]));
    });

    test('allows for defining steps from a data', async function (assert) {
      await render(hbs`
        {{#step-manager as |w|}}
          <div data-test-steps>
            {{#each data as |item|}}
              {{#w.step}}
                <div data-test-step={{item.name}}>
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

      assert.dom('[data-test-step="foo"]').exists();
      assert.dom('[data-test-step="bar"]').doesNotExist();
      assert.dom('[data-test-steps]').hasText('foo');

      await click('button');

      assert.dom('[data-test-step="foo"]').doesNotExist();
      assert.dom('[data-test-step="bar"]').exists();
      assert.dom('[data-test-steps]').hasText('bar');
    });

    test('allows for replacing the array with one that has additional steps', async function (assert) {
      await render(hbs`
        {{#step-manager linear=false as |w|}}
          <div data-test-steps>
            {{#each data as |item|}}
              {{#w.step name=item.name}}
                <div data-test-step={{item.name}}>
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

      assert.dom('[data-test-step="foo"]').exists('Initial step is visible');

      await click('button');

      assert
        .dom('[data-test-step="foo"]')
        .doesNotExist('Initial step is no longer visible');
      assert.dom('[data-test-step="bar"]').exists('Second step is visible');

      this.set('data', A([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]));

      assert
        .dom('[data-test-step="bar"]')
        .exists(
          'Second step is still visible after replacing the array backing the set of steps'
        );

      await click('button');

      assert.dom('[data-test-step="baz"]').exists('Advanced to the new step');

      await click('button');

      assert.dom('[data-test-step="foo"]').exists('Back to the first step');
    });

    test('allows for pushing new steps into the array creating the steps', async function (assert) {
      await render(hbs`
        {{#step-manager linear=false as |w|}}
          <div data-test-steps>
            {{#each data as |item|}}
              {{#w.step name=item.name}}
                <div data-test-step={{item.name}}>
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

      assert.dom('[data-test-step="foo"]').exists('Initial step is visible');

      await click('button');

      assert
        .dom('[data-test-step="foo"]')
        .doesNotExist('Initial step is no longer visible');
      assert.dom('[data-test-step="bar"]').exists('Second step is visible');

      this.get('data').pushObject({ name: 'baz' });
      await settled();

      assert
        .dom('[data-test-step="bar"]')
        .exists(
          'Second step is still visible after replacing the array backing the set of steps'
        );

      await click('button');

      assert.dom('[data-test-step="baz"]').exists('Advanced to the new step');

      await click('button');

      assert.dom('[data-test-step="foo"]').exists('Back to the first step');
    });
  });

  module('dynamically removing steps', function () {
    test('allows for replacing the array with one that has missing steps', async function (assert) {
      this.set('data', A([{ name: 'foo' }, { name: 'bar' }]));

      await render(hbs`
        {{#step-manager linear=true as |w|}}
          <div data-test-steps>
            {{#each data as |item|}}
              {{#w.step name=item.name}}
                <div data-test-step={{item.name}}>
                  {{item.name}}
                </div>
              {{/w.step}}
            {{/each}}
          </div>
        {{/step-manager}}
      `);

      assert
        .dom('[data-test-step="foo"]')
        .exists('The initial step is rendered');

      this.set('data', A([{ name: 'foo' }]));

      assert
        .dom('[data-test-step="foo"]')
        .exists('The initial step is still visible');
    });

    test('allows for removing a specific step without replacing the whole array', async function (assert) {
      const stepToRemove = { name: 'bar' };
      this.set('data', A([{ name: 'foo' }, stepToRemove]));

      await render(hbs`
        {{#step-manager linear=false as |w|}}
          <div data-test-steps>
            {{#each data as |item|}}
              {{#w.step name=item.name}}
                <div data-test-step={{item.name}}>
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

      assert
        .dom('[data-test-step="foo"]')
        .exists('The initial step is rendered');

      this.get('data').removeObject(stepToRemove);
      await settled();

      assert
        .dom('[data-test-step="foo"]')
        .exists('The current step is still visible');

      await click('button');

      assert
        .dom('[data-test-step="foo"]')
        .exists('Transitioned to the first step, which is the only step');
    });
  });

  module('edge cases', function () {
    test('it handles steps with falsy names', async function (assert) {
      await render(hbs`
        {{#step-manager initialStep='' as |w|}}
          {{#w.step name=''}}
            <div data-test-empty-string></div>
          {{/w.step}}

          {{#w.step name=0}}
            <div data-test-zero></div>
          {{/w.step}}

          <button {{action w.transition-to-previous}} data-test-previous>
            Previous step
          </button>

          <button {{action w.transition-to-next}} data-test-next>
            Next step
          </button>
        {{/step-manager}}
      `);

      assert
        .dom('[data-test-empty-string]')
        .exists('Can start on a step with a falsy name');

      await click('[data-test-next]');

      assert
        .dom('[data-test-zero]')
        .exists('Can transition to a next step with a falsy name');

      await click('[data-test-previous]');

      assert
        .dom('[data-test-empty-string]')
        .exists('Can transition to a previous step with a falsy name');
    });
  });
});
