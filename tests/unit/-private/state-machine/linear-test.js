import { module, test } from 'qunit';
import StateMachine from 'ember-steps/-private/state-machine/linear';

module('-private/state-machine/linear', function() {
  module('constructor', function() {
    test('uses the initial step, if provided', function(assert) {
      const m = StateMachine.create({ initialStep: 'foo' });

      assert.equal(m.get('initialStep'), 'foo');
    });

    test('transitions to the initial step if necessary', function(assert) {
      const transitionToStub = function(name) {
        m.currentStep = name;
      };

      const m = StateMachine.create();
      m.addStep('foo', null, null, null, transitionToStub);

      assert.equal(m.get('currentStep'), 'foo');
    });

    test('handling indexes as step names', function(assert) {
      const m = StateMachine.create({ currentStep: 0 });
      m.addStep(0);
      m.addStep(1);

      assert.equal(m.get('currentStep'), 0);
    });
  });

  module('#pickNext', function() {
    test('can get the next step without advancing', function(assert) {
      const transitionToStub = function(name) {
        m.currentStep = name;
      };

      const m = StateMachine.create();

      m.addStep('foo', null, null, null, transitionToStub);
      m.addStep('bar', null, null, null, transitionToStub);

      assert.equal(m.pickNext(), 'bar');
      assert.equal(m.get('currentStep'), 'foo');
    });

    test('the "next" step from the last step is empty', function(assert) {
      const m = StateMachine.create();
      m.addStep('foo');
      m.addStep('bar');

      m.activate('bar');

      assert.equal(m.pickNext(), null);
    });

    test('can get the next step from a specific step', function(assert) {
      const m = StateMachine.create();
      m.addStep('foo');
      m.addStep('bar');

      assert.equal(m.pickNext('bar'), null);
    });

    test('when the next step has a falsy name', function(assert) {
      const m = StateMachine.create({ currentStep: 1 });
      m.addStep(1);
      m.addStep(0);

      assert.equal(m.pickNext(), 0);
    });
  });

  module('#pickPrevious', function() {
    test('can get the previous step without advancing', function(assert) {
      const transitionToStub = function(name) {
        m.currentStep = name;
      };

      const m = StateMachine.create();
      m.addStep('foo', null, null, null, transitionToStub);
      m.addStep('bar', null, null, null, transitionToStub);
      m.addStep('baz', null, null, null, transitionToStub);

      m.activate('bar');

      assert.equal(m.pickPrevious(), 'foo');
      assert.equal(m.get('currentStep'), 'bar');
    });

    test('the "previous" step from the first step is empty', function(assert) {
      const m = StateMachine.create();
      m.addStep('foo');
      m.addStep('bar');

      assert.equal(m.pickPrevious(), null);
    });

    test('can get the previous step from a specific step', function(assert) {
      const m = StateMachine.create();
      m.addStep('foo');
      m.addStep('bar');

      assert.equal(m.pickPrevious('bar'), 'foo');
    });

    test('when the previous step has a falsy name', function(assert) {
      const m = StateMachine.create({ currentStep: 0 });
      m.addStep(0);
      m.addStep(1);

      m.activate(1);

      assert.equal(m.pickPrevious(), 0);
    });
  });

  module('#activate', function(hooks) {
    hooks.beforeEach(function() {
      this.m = StateMachine.create();
      this.m.addStep('foo');
      this.m.addStep('bar');
    });

    test('can go to a step by name', function(assert) {
      this.m.activate('bar');
      assert.equal(this.m.get('currentStep'), 'bar');
    });

    test('throws an error if the step name is not valid', function(assert) {
      assert.expectAssertion(() => {
        this.m.activate('foobar');
      }, /"foobar" does not match an existing step/);
    });

    test('throws an error if no step name is provided', function(assert) {
      assert.expectAssertion(() => {
        this.m.activate();
      }, /No step name was provided/);
    });
  });

  module('.length', function(hooks) {
    hooks.beforeEach(function() {
      this.m = StateMachine.create();
      this.m.addStep('foo');
      this.m.addStep('bar');
    });

    test('is set to the number of steps', function(assert) {
      assert.equal(this.m.get('length'), 2);
    });

    test('updates as more steps are added', function(assert) {
      this.m.addStep('baz');
      assert.equal(this.m.get('length'), 3);
    });
  });

  module('.currentStep', function() {
    test('exposes the name of the current step', function(assert) {
      const transitionToStub = function(name) {
        m.currentStep = name;
      };

      const m = StateMachine.create();

      m.addStep('foo', null, null, null, transitionToStub);
      assert.equal(m.get('currentStep'), 'foo');
    });
  });

  module('.stepTransitions', function() {
    test('exposes an array of step objects', function(assert) {
      const m = StateMachine.create();
      m.addStep('foo');
      m.addStep('bar');
      assert.deepEqual(m.get('stepTransitions').map(node => node.name), [
        'foo',
        'bar'
      ]);

      m.addStep('baz');

      assert.deepEqual(m.get('stepTransitions').map(node => node.name), [
        'foo',
        'bar',
        'baz'
      ]);
    });
  });
});
