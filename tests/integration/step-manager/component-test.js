import Ember from 'ember';
import { expect } from 'chai';
import { setupComponentTest } from 'ember-mocha';
import { beforeEach, describe, it } from 'mocha';
import td from 'testdouble';
import hbs from 'htmlbars-inline-precompile';
import {
  initialize as initializeEmberHook,
  $hook
} from 'ember-hook';

const { matchers: { anything: matchAnything, contains: matchContains } } = td;
const { A } = Ember;

describe('Integration: StepManagerComponent', function() {
  setupComponentTest('step-manager', {
    integration: true
  });

  beforeEach(initializeEmberHook);

  describe('`currentStep` attribute', function() {
    describe('getting the initial step', function() {
      it('can use a primitive value', function() {
        this.render(hbs`
          {{#step-manager currentStep='second' as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}
          {{/step-manager}}
        `);

        expect($hook('step', { name: 'first' })).not.to.be.visible;
        expect($hook('step', { name: 'second' })).to.be.visible;
      });

      it('can use a value from the `mut` helper', function() {
        this.set('currentStep', 'second');
        this.render(hbs`
          {{#step-manager currentStep=(mut currentStep) as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}
          {{/step-manager}}
        `);

        expect($hook('step', { name: 'first' })).not.to.be.visible;
        expect($hook('step', { name: 'second' })).to.be.visible;
      });
    });

    describe('changing the visible step from the target object', function() {
      it('changes steps when the property changes', function() {
        this.set('step', 'first');
        this.render(hbs`
          {{#step-manager currentStep=step as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}
          {{/step-manager}}
        `);

        expect($hook('step', { name: 'first' })).to.be.visible;
        expect($hook('step', { name: 'second' })).not.to.be.visible;

        this.set('step', 'second');

        expect($hook('step', { name: 'first' })).not.to.be.visible;
        expect($hook('step', { name: 'second' })).to.be.visible;

        // Important for binding current step to a query param
        this.set('step', undefined);

        expect($hook('step', { name: 'first' })).to.be.visible;
        expect($hook('step', { name: 'second' })).not.to.be.visible;
      });

      it('changes steps when the property changes (with the mut helper)', function() {
        this.set('step', 'first');
        this.render(hbs`
          {{#step-manager currentStep=(mut step) as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}
          {{/step-manager}}
        `);

        expect($hook('step', { name: 'first' })).to.be.visible;
        expect($hook('step', { name: 'second' })).not.to.be.visible;

        this.set('step', 'second');

        expect($hook('step', { name: 'first' })).not.to.be.visible;
        expect($hook('step', { name: 'second' })).to.be.visible;
      });

      it.skip('throws an error when an invalid step is provided', function() {
        this.set('step', 'first');
        this.render(hbs`
          {{#step-manager currentStep=step as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}
          {{/step-manager}}
        `);

        expect($hook('step', { name: 'first' })).to.be.visible;
        expect($hook('step', { name: 'second' })).not.to.be.visible;

        expect(() => {
          this.set('step', 'foobar');
        }).to.throw(Error);
      });
    });

    describe('updating the target object from the component', function() {
      it('mutates the target object\'s property when a mutable value is provided', function() {
        this.set('step', 'first');
        this.render(hbs`
          {{#step-manager currentStep=(mut step) as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}

            <button {{action w.transition-to 'second'}}>
              Next
            </button>
          {{/step-manager}}
        `);

        this.$('button').click();

        expect(this.get('step')).to.equal('second');
      });

      it('mutates the target object\'s property when a regular value is provided', function() {
        this.set('step', 'first');
        this.render(hbs`
          {{#step-manager currentStep=step as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}

            <button {{action w.transition-to 'second'}}>
              Next
            </button>
          {{/step-manager}}
        `);

        this.$('button').click();

        expect(this.get('step')).to.equal('second');
      });

      it('does not update the target object with an unbound value', function() {
        this.set('step', 'first');
        this.render(hbs`
          {{#step-manager currentStep=(unbound step) as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}

            <button {{action w.transition-to 'second'}}>
              Next
            </button>
          {{/step-manager}}
        `);

        this.$('button').click();

        expect(this.get('step')).to.equal('first');
      });
    });
  });

  it('renders the first step in the DOM if no `currentStep` is present', function() {
    this.render(hbs`
      {{#step-manager as |w|}}
        {{w.step name='first'}}
        {{w.step name='second'}}
      {{/step-manager}}
    `);

    expect($hook('step', { name: 'first' })).to.be.visible;
    expect($hook('step', { name: 'second' })).not.to.be.visible;
  });

  describe('`yield`-ed data', function() {
    it('exposes the name of the current step', function() {
      this.render(hbs`
        {{#step-manager as |w|}}
          {{w.currentStep}}

          {{w.step name='foo'}}
        {{/step-manager}}
      `);

      expect($hook('step-manager')).to.contain('foo');
    });
  });

  describe('transitions to named steps', function() {
    it('can transition to another step', function() {
      this.render(hbs`
        {{#step-manager currentStep='first' as |w|}}
          <button {{action w.transition-to 'second'}}>
            Transition to Next
          </button>

          {{w.step name='first'}}
          {{w.step name='second'}}
        {{/step-manager}}
      `);

      expect($hook('step', { name: 'first' })).to.be.visible;
      expect($hook('step', { name: 'second' })).not.to.be.visible;

      this.$('button').click();

      expect($hook('step', { name: 'first' })).not.to.be.visible;
      expect($hook('step', { name: 'second' })).to.be.visible;
    });

    it.skip('errors when transitioning to an invalid step', function() {
      expect(() => {
        this.render(hbs`
          {{#step-manager currentStep='first' as |w|}}
            <button {{action w.transition-to 'second'}}>
              Transition to Next
            </button>

            {{w.step name='first'}}
          {{/step-manager}}
        `);

        this.$('button').click();
      }).to.throw(Error);
    });
  });

  describe('transition to anonymous steps', function() {
    it('can transition to the next step', function() {
      this.render(hbs`
        {{#step-manager as |w|}}
          <button {{action w.transition-to-next}}>
            Next!
          </button>

          {{w.step id='first'}}
          {{w.step id='second'}}
          {{w.step id='third'}}
        {{/step-manager}}
      `);

      expect(this.$('#first')).to.be.visible;
      expect(this.$('#second')).not.to.be.visible;
      expect(this.$('#third')).not.to.be.visible;

      this.$('button').click();

      expect(this.$('#first')).not.to.be.visible;
      expect(this.$('#second')).to.be.visible;
      expect(this.$('#third')).not.to.be.visible;

      this.$('button').click();

      expect(this.$('#first')).not.to.be.visible;
      expect(this.$('#second')).not.to.be.visible;
      expect(this.$('#third')).to.be.visible;

      this.$('button').click();

      expect(this.$('#first')).to.be.visible;
      expect(this.$('#second')).not.to.be.visible;
      expect(this.$('#third')).not.to.be.visible;
    });
  });

  describe('providing a `did-transition` action', function() {
    it('is fired during a named transition', function() {
      const onTransitionAction = td.function();
      this.on('transition', onTransitionAction);

      this.render(hbs`
        {{#step-manager currentStep='first' did-transition=(action 'transition') as |w|}}
          <button {{action w.transition-to 'second' 'some value'}}>
            Transition to Next
          </button>

          {{w.step name='first'}}
          {{w.step name='second'}}
        {{/step-manager}}
      `);

      this.$('button').click();

      expect(onTransitionAction).to.be.called;
    });

    it('is fired during a sequential transition', function() {
      const onTransitionAction = td.function();
      this.on('transition', onTransitionAction);

      this.render(hbs`
        {{#step-manager did-transition=(action 'transition') as |w|}}
          <button {{action w.transition-to-next 'some value'}}>
            Transition to Next
          </button>

          {{w.step}}
          {{w.step}}
        {{/step-manager}}
      `);

      this.$('button').click();

      expect(onTransitionAction).to.be.called;
    });

    describe('the arguments', function() {
      it('passes the destination and source step', function() {
        const action = td.function('did-transition action');
        this.on('action', action);

        this.render(hbs`
          {{#step-manager did-transition=(action 'action') as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}

            <button {{action w.transition-to-next}}>
              Next
            </button>
          {{/step-manager}}
        `);
        this.$('button').click();

        expect(action).to.be.calledWith(
          matchContains({
            from: 'first',
            to: 'second'
          })
        );
      });

      it('passes the value when given one', function() {
        const action = td.function('did-transition action');
        this.on('action', action);

        this.render(hbs`
          {{#step-manager did-transition=(action 'action') as |w|}}
            {{w.step}}
            {{w.step}}

            <button {{action w.transition-to-next 'foo'}}>
              Next
            </button>
          {{/step-manager}}
        `);
        this.$('button').click();

        expect(action).to.be.calledWith(
          matchContains({
            value: 'foo'
          })
        );
      });
    });
  });

  describe('providing a `will-transition` action', function() {
    it('is not fired before entering the initial route', function() {
      const beforeAction = td.function('before action');
      this.on('beforeAction', beforeAction);

      this.render(hbs`
        {{#step-manager will-transition=(action 'beforeAction') as |w|}}
          {{w.step name='first'}}
        {{/step-manager}}
      `);

      expect(beforeAction).not.to.be.called;
    });

    it('is fired before a named transition', function() {
      const beforeAction = td.function('before action');
      this.on('beforeAction', beforeAction);

      this.render(hbs`
        {{#step-manager will-transition=(action 'beforeAction') as |w|}}
          {{w.step name='initial'}}
          {{w.step name='next'}}

          <button {{action w.transition-to 'next'}}>
            Next
          </button>
        {{/step-manager}}
      `);
      this.$('button').click();

      expect(beforeAction).to.be.called;
    });

    it('is fired before a sequential transition', function() {
      const beforeAction = td.function('before action');
      this.on('beforeAction', beforeAction);

      this.render(hbs`
        {{#step-manager will-transition=(action 'beforeAction') as |w|}}
          {{w.step}}
          {{w.step}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);
      this.$('button').click();

      expect(beforeAction).to.be.called;
    });

    describe('the arguments', function() {
      it('passes the destination and source step', function() {
        const beforeAction = td.function('before action');
        this.on('beforeAction', beforeAction);

        this.render(hbs`
          {{#step-manager will-transition=(action 'beforeAction') as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}

            <button {{action w.transition-to-next}}>
              Next
            </button>
          {{/step-manager}}
        `);
        this.$('button').click();

        expect(beforeAction).to.be.calledWith(
          matchContains({
            from: 'first',
            to: 'second'
          })
        );
      });

      it('passes the value when given one', function() {
        const beforeAction = td.function('before action');
        this.on('beforeAction', beforeAction);

        this.render(hbs`
          {{#step-manager will-transition=(action 'beforeAction') as |w|}}
            {{w.step}}
            {{w.step}}

            <button {{action w.transition-to-next 'foo'}}>
              Next
            </button>
          {{/step-manager}}
        `);
        this.$('button').click();

        expect(beforeAction).to.be.calledWith(
          matchContains({
            value: 'foo'
          })
        );
      });
    });

    it('prevents the transition if it returns `false`', function() {
      const beforeAction = td.function('before action');
      td.when(beforeAction(matchAnything())).thenReturn(false);
      this.on('beforeAction', beforeAction);

      this.render(hbs`
        {{#step-manager will-transition=(action 'beforeAction') as |w|}}
          {{w.step name='first'}}
          {{w.step name='second'}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      this.$('button').click();

      expect($hook('step', { name: 'first' })).to.be.visible;
      expect($hook('step', { name: 'second' })).not.to.be.visible;
    });
  });

  describe('assigning step indices', function() {
    it('works outside of a loop', function() {
      this.render(hbs`
        {{#step-manager as |w|}}
          {{w.step}}
          {{w.step}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      expect($hook('step', { index: 0 })).to.be.visible;
      expect($hook('step', { index: 1 })).not.to.be.visible;

      this.$('button').click();

      expect($hook('step', { index: 0 })).not.to.be.visible;
      expect($hook('step', { index: 1 })).to.be.visible;
    });
  });

  describe('showing alternate step states', function() {
    it('property is added by the HTMLBars transform', function() {
      this.render(hbs`
        {{#step-manager as |w|}}
          {{#w.step}}
            Active
          {{else}}
            Inactive
          {{/w.step}}

          {{#w.step}}
            Active
          {{else}}
            Inactive
          {{/w.step}}
        {{/step-manager}}
      `);

      expect($hook('step', { index: 0 }).text().trim()).to.equal('Active');
      expect($hook('step', { index: 1 }).text().trim()).to.equal('Inactive');
    });
  });

  describe('dynamically creating steps', function() {
    beforeEach(function() {
      this.set('data', A([
        { name: 'foo' },
        { name: 'bar' }
      ]));
    });

    it('allows dynamically creating steps', function() {
      this.render(hbs`
        {{#step-manager currentStep=(unbound data.firstObject.name) as |w|}}
          {{#each data as |item|}}
            {{#w.step name=(unbound item.name)}}
              {{item.name}}
            {{/w.step}}
          {{/each}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      expect($hook('step', { name: 'foo' })).to.be.visible;
      expect($hook('step', { name: 'bar' })).not.to.be.visible;
      expect(this.$()).to.contain('foo');

      this.$('button').click();

      expect($hook('step', { name: 'foo' })).not.to.be.visible;
      expect($hook('step', { name: 'bar' })).to.be.visible;
      expect(this.$()).to.contain('bar');
    });

    it('allows for adding more steps after the initial render', function() {
      this.render(hbs`
        {{#step-manager currentStep=(unbound data.firstObject.name) as |w|}}
          {{#each data as |item|}}
            {{#w.step name=(unbound item.name)}}
              {{item.name}}
            {{/w.step}}
          {{/each}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      this.$('button').click();

      this.set('data', A([
        { name: 'foo' },
        { name: 'bar' },
        { name: 'baz' }
      ]));

      expect($hook('step', { name: 'foo' })).not.to.be.visible;
      expect($hook('step', { name: 'bar' })).to.be.visible;
      expect($hook('step', { name: 'baz' })).not.to.be.visible;

      // Check that the previous "last step" now points to the new one
      this.$('button').click();

      expect($hook('step', { name: 'foo' })).not.to.be.visible;
      expect($hook('step', { name: 'bar' })).not.to.be.visible;
      expect($hook('step', { name: 'baz' })).to.be.visible;
      expect(this.$()).to.contain('baz');

      // Check that the new step now points to the first one
      this.$('button').click();

      expect($hook('step', { name: 'foo' })).to.be.visible;
      expect($hook('step', { name: 'bar' })).not.to.be.visible;
      expect($hook('step', { name: 'baz' })).not.to.be.visible;
      expect(this.$()).to.contain('foo');
    });
  });
});
