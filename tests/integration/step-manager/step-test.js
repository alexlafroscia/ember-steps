import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@ember/test-helpers';
import td from 'testdouble';
import { initialize as initializeEmberHook, hook } from 'ember-hook';

module('step-manger/step', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(initializeEmberHook);

  hooks.beforeEach(function() {
    this.set('register', function() {});
    this.set('remove', function() {});
  });

  module('registering with the rendering context', function() {
    test('registers itself with the step manager', async function(assert) {
      const registerAction = td.function();
      this.set('register', registerAction);

      await render(hbs`
        {{step-manager/step name='foo' register-step=(action register) remove-step=(action remove)}}
      `);

      assert.wasCalled(registerAction);
    });
  });

  module('the step name', function() {
    test('throws an error when changed', async function(assert) {
      this.set('name', 'foo');

      await render(hbs`
        {{step-manager/step name=name register-step=(action register) remove-step=(action remove)}}
      `);

      assert.expectAssertion(() => {
        this.set('name', 'bar');
      }, 'The `name` property should never change');
    });
  });

  module('rendering', function() {
    test('renders block content when visible', async function(assert) {
      await render(hbs`
        {{#step-manager/step name='foo' currentStep='foo' register-step=(action register) remove-step=(action remove)}}
          <div data-test={{hook 'step'}}>
            Foo
          </div>
        {{/step-manager/step}}
      `);

      assert.dom(hook('step')).hasText('Foo');
    });

    module('when inactive', function() {
      test('is hidden when no alternate state is provided', async function(assert) {
        await render(hbs`
          {{#step-manager/step name='foo' register-step=(action register) remove-step=(action remove)}}
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
            {{#step-manager/step name='foo' register-step=(action register) remove-step=(action remove)}}
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
        {{#step-manager/step name='foo' currentStep='foo' register-step=(action register) remove-step=(action remove)}}
          <div data-test={{hook 'step'}}></div>
        {{/step-manager/step}}
      `);

      assert.dom(hook('step')).exists();
    });

    test('is invisible when not active', async function(assert) {
      await render(hbs`
        {{#step-manager/step name='foo' currentStep='bar' register-step=(action register) remove-step=(action remove)}}
          <div data-test={{hook 'step'}}></div>
        {{/step-manager/step}}
      `);

      assert.dom(hook('step')).doesNotExist();
    });
  });

  module('yielding whether the step has a next step', function() {
    test('when it has a next step', async function(assert) {
      await render(hbs`
        {{#step-manager as |w|}}
          {{#w.step as |step|}}
            <p>{{step.hasNext}}</p>
          {{/w.step}}
          {{w.step}}
        {{/step-manager}}
      `);

      assert.dom('p').hasText('true');
    });

    test('when it does not have a next step', async function(assert) {
      await render(hbs`
        {{#step-manager as |w|}}
          {{#w.step as |step|}}
            <p>{{step.hasNext}}</p>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('p').hasText('false');
    });
  });

  module('yielding whether the step has a previous step', function() {
    test('when it has a previous step', async function(assert) {
      await render(hbs`
        {{#step-manager currentStep='bar' as |w|}}
          {{w.step name='foo'}}
          {{#w.step name='bar' as |step|}}
            <p>{{step.hasPrevious}}</p>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('p').hasText('true');
    });

    test('when it does not have a previous step', async function(assert) {
      await render(hbs`
        {{#step-manager as |w|}}
          {{#w.step as |step|}}
            <p>{{step.hasPrevious}}</p>
          {{/w.step}}
        {{/step-manager}}
      `);

      assert.dom('p').hasText('false');
    });
  });
});
