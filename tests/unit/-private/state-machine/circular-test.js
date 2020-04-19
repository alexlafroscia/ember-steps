import { module, test } from 'qunit';
import StateMachine from 'ember-steps/-private/state-machine/circular';

module('-private/state-machine/circular', function () {
  module('constructor', function () {
    test('uses the initial step, if provided', function (assert) {
      const m = new StateMachine('foo');

      assert.equal(m.currentStep, 'foo');
    });

    test('calculates the initial step if necessary', function (assert) {
      const m = new StateMachine();
      m.addStep({ name: 'foo' });

      assert.equal(m.currentStep, 'foo');
    });
  });

  module('#pickNext', function () {
    test('can get the next step without advancing', function (assert) {
      const m = new StateMachine();

      m.addStep({ name: 'foo' });
      m.addStep({ name: 'bar' });

      assert.equal(m.pickNext(), 'bar');
      assert.equal(m.currentStep, 'foo');
    });

    test('the "next" step from the last step is the first', function (assert) {
      const m = new StateMachine();
      m.addStep({ name: 'foo' });
      m.addStep({ name: 'bar' });

      m.activate('bar');

      assert.equal(m.pickNext(), 'foo');
    });

    test('when the next step has a falsy name', function (assert) {
      const m = new StateMachine(1);
      m.addStep({ name: 1 });
      m.addStep({ name: 0 });

      assert.equal(m.pickNext(), 0);
    });
  });

  module('#pickPrevious', function () {
    test('can get the previous step without advancing', function (assert) {
      const m = new StateMachine();
      m.addStep({ name: 'foo' });
      m.addStep({ name: 'bar' });
      m.addStep({ name: 'baz' });

      assert.equal(m.pickPrevious(), 'baz');
      assert.equal(m.currentStep, 'foo');
    });

    test('the "previous" step from the first step is the last', function (assert) {
      const m = new StateMachine();
      m.addStep({ name: 'foo' });
      m.addStep({ name: 'bar' });

      m.activate('bar');

      assert.equal(m.pickPrevious(), 'foo');
    });

    test('when the previous step has a falsy name', function (assert) {
      const m = new StateMachine(0);
      m.addStep({ name: 0 });
      m.addStep({ name: 1 });

      m.activate(1);

      assert.equal(m.pickPrevious(), 0);
    });
  });

  module('#activate', function (hooks) {
    hooks.beforeEach(function () {
      this.m = new StateMachine();
      this.m.addStep({ name: 'foo' });
      this.m.addStep({ name: 'bar' });
    });

    test('can go to a step by name', function (assert) {
      this.m.activate('bar');
      assert.equal(this.m.currentStep, 'bar');
    });

    test('throws an error if the step name is not valid', function (assert) {
      assert.expectAssertion(() => {
        this.m.activate('foobar');
      }, /"foobar" does not match an existing step/);
    });

    test('throws an error if no step name is provided', function (assert) {
      assert.expectAssertion(() => {
        this.m.activate();
      }, /No step name was provided/);
    });
  });

  module('.length', function (hooks) {
    hooks.beforeEach(function () {
      this.m = new StateMachine();
      this.m.addStep({ name: 'foo' });
      this.m.addStep({ name: 'bar' });
    });

    test('is set to the number of steps', function (assert) {
      assert.equal(this.m.length, 2);
    });

    test('updates as more steps are added', function (assert) {
      this.m.addStep({ name: 'baz' });
      assert.equal(this.m.length, 3);
    });
  });

  module('.currentStep', function () {
    test('exposes the name of the current step', function (assert) {
      const m = new StateMachine();
      m.addStep({ name: 'foo' });
      assert.equal(m.currentStep, 'foo');
    });
  });
});
