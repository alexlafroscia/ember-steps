import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@ember/test-helpers';

module('step-manger/step', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.register = function () {};
    this.remove = function () {};
  });

  module('the step name', function () {
    test('throws an error when changed', async function (assert) {
      this.set('name', 'foo');

      await render(hbs`
        <StepManager::Step @name={{this.name}} @register-step={{this.register}} @remove-step={{this.remove}}/>
      `);

      assert.expectAssertion(() => {
        this.set('name', 'bar');
      }, 'The `name` property should never change');
    });

    module('valid types', function () {
      test('`string` is supported', async function (assert) {
        this.set('name', 'foo');

        await render(hbs`
          <StepManager::Step @name={{this.name}} @register-step={{this.register}} @remove-step={{this.remove}}/>
        `);

        assert.ok(true);
      });

      test('`number` is supported', async function (assert) {
        assert.expect(0);

        this.set('name', 1);

        await render(hbs`
          <StepManager::Step @name={{this.name}} @register-step={{this.register}} @remove-step={{this.remove}}/>
        `);
      });

      test('`Symbol` is supported', async function (assert) {
        assert.expect(0);

        this.set('name', Symbol());

        await render(hbs`
          <StepManager::Step @name={{this.name}} @register-step={{this.register}} @remove-step={{this.remove}}/>
        `);
      });
    });
  });

  module('rendering', function () {
    test('renders block content when visible', async function (assert) {
      await render(hbs`
        <StepManager::Step @name='foo' @currentStep='foo' @register-step={{this.register}} @remove-step={{this.remove}}>
          <div data-test-step>
            Foo
          </div>
        </StepManager::Step>
      `);

      assert.dom('[data-test-step]').hasText('Foo');
    });

    module('when inactive', function () {
      test('is hidden when no alternate state is provided', async function (assert) {
        await render(hbs`
          <StepManager::Step @name='foo' @register-step={{this.register}} @remove-step={{this.remove}}>
            <div data-test-step>
              Active Content
            </div>
          </StepManager::Step>
        `);

        assert.dom('[data-test-step]').doesNotExist();
      });

      test('renders the inverse block if provided', async function (assert) {
        await render(hbs`
          <div data-test-step>
            <StepManager::Step @name='foo' @register-step={{this.register}} @remove-step={{this.remove}}>
              <:default>
                Active Content
              </:default>
              <:else>
                Inactive Content
              </:else>
            </StepManager::Step>
          </div>
        `);

        assert.dom('[data-test-step]').hasText('Inactive Content');
      });
    });
  });

  module('programmatically controlling visibility', function () {
    test('is visible when active', async function (assert) {
      await render(hbs`
        <StepManager::Step @name='foo' @currentStep='foo' @register-step={{this.register}} @remove-step={{this.remove}}>
          <div data-test-step> </div>
        </StepManager::Step>
      `);

      assert.dom('[data-test-step]').exists();
    });

    test('is invisible when not active', async function (assert) {
      await render(hbs`
        <StepManager::Step @name='foo' @currentStep='bar' @register-step={{this.register}} @remove-step={{this.remove}}>
          <div data-test-step> </div>
        </StepManager::Step>
      `);

      assert.dom('[data-test-step]').doesNotExist();
    });
  });

  module('yielding whether the step has a next step', function () {
    test('when it has a next step', async function (assert) {
      await render(hbs`
        <StepManager as |W| >
          <W.Step as |step| >
            <p>{{step.hasNext}}</p>
          </W.Step>
          <W.Step />
        </StepManager>
      `);

      assert.dom('p').hasText('true');
    });

    test('when it does not have a next step', async function (assert) {
      await render(hbs`
        <StepManager as |W| >
          <W.Step as |step| >
            <p>{{step.hasNext}}</p>
          </W.Step>
        </StepManager>
      `);

      assert.dom('p').hasText('false');
    });
  });

  module('yielding whether the step has a previous step', function () {
    test('when it has a previous step', async function (assert) {
      await render(hbs`
        <StepManager @currentStep="bar" as |W| >
          <W.Step @name="foo" />
          <W.Step @name="bar" as |step| >
            <p>{{step.hasPrevious}}</p>
          </W.Step>
        </StepManager>
      `);

      assert.dom('p').hasText('true');
    });

    test('when it does not have a previous step', async function (assert) {
      await render(hbs`
        <StepManager as |W| >
          <W.Step as |step| >
            <p>{{step.hasPrevious}}</p>
          </W.Step>
        </StepManager>
      `);

      assert.dom('p').hasText('false');
    });
  });
});
