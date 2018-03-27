import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@ember/test-helpers';
import td from 'testdouble';
import { initialize as initializeEmberHook, hook } from 'ember-hook';

module('Integration: StepManagerStepComponent', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(initializeEmberHook);

  hooks.beforeEach(function() {
    this.set('register', function() {});
  });

  module('registering with the rendering context', function() {
    test('registers itself with the step manager', async function(assert) {
      const registerAction = td.function();
      this.set('register', registerAction);

      await render(hbs`
        {{step-manager/step name='foo' register-step=(action register)}}
      `);

      assert.wasCalled(registerAction);
    });

    skip('throws an error when not provided a registration action', function(
      assert
    ) {
      assert.throws(async () => {
        await render(hbs`{{step-manager/step}}`);
      }, Error);
    });
  });

  module('the step name', function() {
    skip('must be provided', function(assert) {
      assert.throws(async () => {
        await render(hbs`
          {{step-manager/step register-step=(action register)}}
        `);
      }, /Name must be provided/);
    });

    test('throws an error when changed', async function(assert) {
      this.set('name', 'foo');

      await render(hbs`
        {{step-manager/step name=name register-step=(action register)}}
      `);

      assert.expectAssertion(() => {
        this.set('name', 'bar');
      }, 'The `name` property should never change');
    });
  });

  module('rendering', function() {
    test('renders block content when visible', async function(assert) {
      await render(hbs`
        {{#step-manager/step name='foo' isActive=true register-step=(action register)}}
          <div data-test={{hook 'step'}}>
            Foo
          </div>
        {{/step-manager/step}}
      `);

      assert.dom(hook('step')).hasText('Foo');
    });

    module('when inactive', function() {
      test('is hidden when no alternate state is provided', async function(
        assert
      ) {
        await render(hbs`
          {{#step-manager/step name='foo' register-step=(action register)}}
            <div data-test={{hook 'step'}}>
              Active Content
            </div>
          {{/step-manager/step}}
        `);

        assert.dom(hook('step')).doesNotExist();
      });

      test('renders the inverse block if provided', async function(assert) {
        await render(hbs`
          <div data-test={{hook 'step'}}>
            {{#step-manager/step name='foo' hasInactiveState=true register-step=(action register)}}
              Active Content
            {{else}}
              Inactive Content
            {{/step-manager/step}}
          </div>
        `);

        assert.dom(hook('step')).hasText('Inactive Content');
      });
    });
  });

  module('programmatically controlling visibility', function() {
    test('is visible when active', async function(assert) {
      await render(hbs`
        {{#step-manager/step name='foo' isActive=true register-step=(action register)}}
          <div data-test={{hook 'step'}}></div>
        {{/step-manager/step}}
      `);

      assert.dom(hook('step')).exists();
    });

    test('is invisible when not active', async function(assert) {
      await render(hbs`
        {{#step-manager/step name='foo' register-step=(action register)}}
          <div data-test={{hook 'step'}}></div>
        {{/step-manager/step}}
      `);

      assert.dom(hook('step')).doesNotExist();
    });
  });

  module('lifecycle hooks', function() {
    module('will-enter', function() {
      test('is called if the step is initially active', async function(assert) {
        const entranceAction = td.function();
        this.set('entrance', entranceAction);
        this.set('currentStep', 'foo');

        await render(hbs`
          {{step-manager/step
              name='foo'
              currentStep=currentStep
              will-enter=(action entrance)
              register-step=(action register)}}
        `);

        this.set('currentStep', 'foo');

        assert.wasCalled(entranceAction);
      });

      test('is called when the step becomes active', async function(assert) {
        const entranceAction = td.function();
        this.set('entrance', entranceAction);
        this.set('currentStep', 'bar');

        await render(hbs`
          {{step-manager/step
              name='foo'
              currentStep=currentStep
              will-enter=(action entrance)
              register-step=(action register)}}
        `);

        // Activate the step
        this.set('currentStep', 'foo');

        assert.wasCalled(entranceAction);
      });
    });

    module('will-exit', function() {
      test('is called when the step becomes inactive', async function(assert) {
        const exitAction = td.function();
        this.set('exit', exitAction);
        this.set('currentStep', 'foo');

        await render(hbs`
          {{step-manager/step
              name='foo'
              currentStep=currentStep
              will-exit=(action exit)
              register-step=(action register)}}
        `);

        // Deactivate the step
        this.set('currentStep', 'bar');

        assert.wasCalled(exitAction);
      });

      test('is not called when the current step changes to a value that is not the name of the step', async function(
        assert
      ) {
        const exitAction = td.function();
        this.set('exit', exitAction);
        this.set('currentStep', 'bar');

        await render(hbs`
          {{step-manager/step
              name='foo'
              currentStep=currentStep
              will-exit=(action exit)
              register-step=(action register)}}
        `);

        // Deactivate the step
        this.set('currentStep', 'baz');

        assert.wasNotCalled(exitAction);
      });
    });
  });
});
