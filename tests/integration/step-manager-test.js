import { run } from '@ember/runloop';
import { A } from '@ember/array';
import RSVP from 'rsvp';
import { expect } from 'chai';
import { setupComponentTest } from 'ember-mocha';
import { beforeEach, describe, it } from 'mocha';
import td from 'testdouble';
import hbs from 'htmlbars-inline-precompile';
import {
  initialize as initializeEmberHook,
  $hook
} from 'ember-hook';
import { click, findAll } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';

const { matchers: { anything: matchAnything, contains: matchContains } } = td;

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
            {{#w.step name='first'}}
              <div data-test={{hook 'first'}}></div>
            {{/w.step}}

            {{#w.step name='second'}}
              <div data-test={{hook 'second'}}></div>
            {{/w.step}}
          {{/step-manager}}
        `);

        expect($hook('first')).not.to.be.visible;
        expect($hook('second')).to.be.visible;
      });

      it('can use a value from the `mut` helper', function() {
        this.set('currentStep', 'second');
        this.render(hbs`
          {{#step-manager currentStep=(mut currentStep) as |w|}}
            {{#w.step name='first'}}
              <div data-test={{hook 'first'}}></div>
            {{/w.step}}

            {{#w.step name='second'}}
              <div data-test={{hook 'second'}}></div>
            {{/w.step}}
          {{/step-manager}}
        `);

        expect($hook('first')).not.to.be.visible;
        expect($hook('second')).to.be.visible;
      });
    });

    describe('changing the visible step from the target object', function() {
      it('changes steps when the property changes', function() {
        this.set('step', 'first');
        this.render(hbs`
          {{#step-manager currentStep=step as |w|}}
            {{#w.step name='first'}}
              <div data-test={{hook 'first'}}></div>
            {{/w.step}}

            {{#w.step name='second'}}
              <div data-test={{hook 'second'}}></div>
            {{/w.step}}
          {{/step-manager}}
        `);

        expect($hook('first')).to.be.visible;
        expect($hook('second')).not.to.be.visible;

        this.set('step', 'second');

        expect($hook('first')).not.to.be.visible;
        expect($hook('second')).to.be.visible;

        // Important for binding current step to a query param
        this.set('step', undefined);

        expect($hook('first')).to.be.visible;
        expect($hook('second')).not.to.be.visible;
      });

      it('changes steps when the property changes (with the mut helper)', function() {
        this.set('step', 'first');
        this.render(hbs`
          {{#step-manager currentStep=(mut step) as |w|}}
            {{#w.step name='first'}}
              <div data-test={{hook 'first'}}></div>
            {{/w.step}}

            {{#w.step name='second'}}
              <div data-test={{hook 'second'}}></div>
            {{/w.step}}
          {{/step-manager}}
        `);

        expect($hook('first')).to.be.visible;
        expect($hook('second')).not.to.be.visible;

        this.set('step', 'second');

        expect($hook('first')).not.to.be.visible;
        expect($hook('second')).to.be.visible;
      });

      it.skip('throws an error when an invalid step is provided', function() {
        this.set('step', 'first');
        this.render(hbs`
          {{#step-manager currentStep=step as |w|}}
            {{#w.step name='first'}}
              <div data-test={{hook 'first'}}></div>
            {{/w.step}}

            {{#w.step name='second'}}
              <div data-test={{hook 'second'}}></div>
            {{/w.step}}
          {{/step-manager}}
        `);

        expect($hook('first')).to.be.visible;
        expect($hook('second')).not.to.be.visible;

        expect(() => {
          this.set('step', 'foobar');
        }).to.throw(Error);
      });
    });

    describe('updating the target object from the component', function() {
      it("mutates the target object's property when a mutable value is provided", function() {
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

        click('button');

        expect(this.get('step')).to.equal('second');
      });

      it("mutates the target object's property when a regular value is provided", function() {
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

        click('button');

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

        click('button');

        expect(this.get('step')).to.equal('first');
      });
    });
  });

  it('renders the first step in the DOM if no `currentStep` is present', function() {
    this.render(hbs`
      {{#step-manager as |w|}}
        {{#w.step name='first'}}
          <div data-test={{hook 'first'}}></div>
        {{/w.step}}

        {{#w.step name='second'}}
          <div data-test={{hook 'second'}}></div>
        {{/w.step}}
      {{/step-manager}}
    `);

    expect($hook('first')).to.be.visible;
    expect($hook('second')).not.to.be.visible;
  });

  it('renders tagless components', function() {
    this.render(hbs`
      <div id="steps">
        {{#step-manager as |w|}}
          {{w.step}}
        {{/step-manager}}
      </div>
    `);

    expect(findAll('#steps *')).to.be.empty;
  });

  describe('`yield`-ed data', function() {
    it('exposes the name of the current step', function() {
      this.render(hbs`
        {{#step-manager as |w|}}
          <div data-test={{hook 'steps'}}>
            {{w.currentStep}}

            {{w.step name='foo'}}
          </div>
        {{/step-manager}}
      `);

      expect($hook('steps')).to.contain('foo');
    });

    describe('exposing an array of steps', function() {
      it('can render the array after the steps are defined', function() {
        this.render(hbs`
          {{#step-manager as |w|}}
            <div data-test={{hook 'active-step'}}>
              {{#w.step name='foo'}}
                Foo
              {{/w.step}}

              {{#w.step name='bar'}}
                Bar
              {{/w.step}}
            </div>

            <ul>
              {{#each w.steps as |step|}}
                <li onClick={{action w.transition-to step}} data-test={{hook 'step-trigger' step=step}}>
                  {{step}}
                </li>
              {{/each}}
            </ul>
          {{/step-manager}}
        `);

        expect(this.$('li')).to.have.length(2);
        expect($hook('step-trigger', { step: 'foo' })).to.contain('foo');
        expect($hook('step-trigger', { step: 'bar' })).to.contain('bar');

        expect($hook('active-step')).to.contain('Foo');

        $hook('step-trigger', { step: 'bar' }).click();

        expect($hook('active-step')).to.contain('Bar');
      });

      it('can render the array before the steps are defined', function() {
        this.render(hbs`
          {{#step-manager as |w|}}
            <ul>
              {{#each w.steps as |step|}}
                <li onClick={{action w.transition-to step}} data-test={{hook 'step-trigger' step=step}}>
                  {{step}}
                </li>
              {{/each}}
            </ul>

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

        expect(this.$('li')).to.have.length(2);
        expect($hook('step-trigger', { step: 'foo' })).to.contain('foo');
        expect($hook('step-trigger', { step: 'bar' })).to.contain('bar');

        expect($hook('active-step')).to.contain('Foo');

        $hook('step-trigger', { step: 'bar' }).click();

        expect($hook('active-step')).to.contain('Bar');
      });
    });
  });

  describe('transitions to named steps', function() {
    it('can transition to another step', function() {
      this.render(hbs`
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

      expect($hook('first')).to.be.visible;
      expect($hook('second')).not.to.be.visible;

      click('button');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).to.be.visible;
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

        click('button');
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

      expect($hook('first')).to.be.visible;
      expect($hook('second')).not.to.be.visible;
      expect($hook('third')).not.to.be.visible;

      click('button');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).to.be.visible;
      expect($hook('third')).not.to.be.visible;

      click('button');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).not.to.be.visible;
      expect($hook('third')).to.be.visible;

      click('button');

      expect($hook('first')).to.be.visible;
      expect($hook('second')).not.to.be.visible;
      expect($hook('third')).not.to.be.visible;
    });

    it('can transition to the previous step', function() {
      this.render(hbs`
        {{#step-manager as |w|}}
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

      expect($hook('first')).to.be.visible;
      expect($hook('second')).not.to.be.visible;
      expect($hook('third')).not.to.be.visible;

      click('#next');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).to.be.visible;
      expect($hook('third')).not.to.be.visible;

      click('#next');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).not.to.be.visible;
      expect($hook('third')).to.be.visible;

      click('#previous');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).to.be.visible;
      expect($hook('third')).not.to.be.visible;
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

      click('button');

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

      click('button');

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
        click('button');

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
        click('button');

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
      click('button');

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
      click('button');

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
        click('button');

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
        click('button');

        expect(beforeAction).to.be.calledWith(
          matchContains({
            value: 'foo'
          })
        );
      });

      it('passes the direction when using transition-to-next or transition-to-previous', function() {
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
        click('button');

        expect(beforeAction).to.be.calledWith(
          matchContains({
            direction: 'next'
          })
        );
      });
    });

    it('can wait for a promise to resolve', function(done) {
      let didTransition = false;
      const waitForMe = function() {
        return new RSVP.Promise(function(resolve) {
          run.later(null, resolve, 500);
        });
      };
      this.on('beforeAction', waitForMe);
      this.on('afterTransition', () => (didTransition = true));

      this.render(hbs`
        {{#step-manager will-transition=(action 'beforeAction') did-transition=(action 'afterTransition') as |w|}}
          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      click('button');

      expect(didTransition).to.equal(false);

      return wait()
        .then(() => {
          expect(didTransition).to.equal(true);
          expect($hook('first')).not.to.be.visible;
          expect($hook('second')).to.be.visible;
        })
        .then(done, done);
    });

    it('prevents the transition if the promise resolve to `false`', function(
      done
    ) {
      let didTransition = false;
      const waitForMe = function() {
        return new RSVP.Promise(function(resolve) {
          run.later(null, () => resolve(false), 500);
        });
      };
      this.on('beforeAction', waitForMe);
      this.on('afterTransition', () => (didTransition = true));

      this.render(hbs`
        {{#step-manager will-transition=(action 'beforeAction') did-transition=(action 'afterTransition') as |w|}}
          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      click('button');

      expect(didTransition).to.equal(false);

      return wait()
        .then(() => {
          expect(didTransition).to.equal(false);
          expect($hook('first')).to.be.visible;
          expect($hook('second')).not.to.be.visible;
        })
        .then(done, done);
    });

    it('prevents the transition if the promise reject', function(done) {
      let didTransition = false;
      const waitForMe = function() {
        return new RSVP.Promise(function(resolve, reject) {
          run.later(null, reject, 500);
        });
      };
      this.on('beforeAction', waitForMe);
      this.on('afterTransition', () => (didTransition = true));

      this.render(hbs`
        {{#step-manager will-transition=(action 'beforeAction') did-transition=(action 'afterTransition') as |w|}}
          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      click('button');

      expect(didTransition).to.equal(false);

      return wait()
        .then(() => {
          expect(didTransition).to.equal(false);
          expect($hook('first')).to.be.visible;
          expect($hook('second')).not.to.be.visible;
        })
        .then(done, done);
    });

    it('prevents the transition if it returns `false`', function() {
      const beforeAction = td.function('before action');
      td.when(beforeAction(matchAnything())).thenReturn(false);
      this.on('beforeAction', beforeAction);

      this.render(hbs`
        {{#step-manager will-transition=(action 'beforeAction') as |w|}}
          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      click('button');

      expect($hook('first')).to.be.visible;
      expect($hook('second')).not.to.be.visible;
    });

    it("doesn't update loading when destroyed", function(done) {
      let didTransition = false;
      this.on('beforeAction', function() {
        return new RSVP.Promise(function(resolve) {
          run.later(null, resolve, 500);
        });
      });
      this.on('afterTransition', () => (didTransition = true));

      this.render(hbs`
        {{#step-manager will-transition=(action 'beforeAction') did-transition=(action 'afterTransition') as |w|}}
          {{#w.step name='first'}}
            <div data-test={{hook 'first'}}></div>
          {{/w.step}}

          {{#w.step name='second'}}
            <div data-test={{hook 'second'}}></div>
          {{/w.step}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);

      click('button');

      expect(didTransition).to.equal(false);

      this.clearRender();

      return wait()
        .then(() => {
          expect(didTransition).to.equal(false);
          expect($hook('first')).not.to.be.visible;
          expect($hook('second')).not.to.be.visible;
        })
        .then(done, done);
    });
  });

  describe('assigning step indices', function() {
    it('works outside of a loop', function() {
      this.render(hbs`
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

      expect($hook('step', { index: 0 })).to.be.visible;
      expect($hook('step', { index: 1 })).not.to.be.visible;

      click('button');

      expect($hook('step', { index: 0 })).not.to.be.visible;
      expect($hook('step', { index: 1 })).to.be.visible;
    });
  });

  describe('showing alternate step states', function() {
    it('property is added by the HTMLBars transform', function() {
      this.render(hbs`
        {{#step-manager as |w|}}
          <div data-test={{hook 'step' index=0}}>
            {{#w.step}}
              Active
            {{else}}
              Inactive
            {{/w.step}}
          </div>

          <div data-test={{hook 'step' index=1}}>
            {{#w.step}}
              Active
            {{else}}
              Inactive
            {{/w.step}}
          </div>
        {{/step-manager}}
      `);

      expect(
        $hook('step', { index: 0 })
          .text()
          .trim()
      ).to.equal('Active');
      expect(
        $hook('step', { index: 1 })
          .text()
          .trim()
      ).to.equal('Inactive');
    });
  });

  describe('dynamically creating steps', function() {
    beforeEach(function() {
      this.set('data', A([{ name: 'foo' }, { name: 'bar' }]));
    });

    it('allows dynamically creating steps', function() {
      this.render(hbs`
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

      expect($hook('step', { name: 'foo' })).to.be.visible;
      expect($hook('step', { name: 'bar' })).not.to.be.visible;
      expect(
        $hook('steps')
          .text()
          .trim()
      ).to.equal('foo');

      click('button');

      expect($hook('step', { name: 'foo' })).not.to.be.visible;
      expect($hook('step', { name: 'bar' })).to.be.visible;
      expect(
        $hook('steps')
          .text()
          .trim()
      ).to.equal('bar');
    });

    it('allows for adding more steps after the initial render', function() {
      this.render(hbs`
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

      click('button');

      this.set('data', A([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]));

      expect($hook('step', { name: 'foo' })).not.to.be.visible;
      expect($hook('step', { name: 'bar' })).to.be.visible;
      expect($hook('step', { name: 'baz' })).not.to.be.visible;

      // Check that the previous "last step" now points to the new one
      click('button');

      expect($hook('step', { name: 'foo' })).not.to.be.visible;
      expect($hook('step', { name: 'bar' })).not.to.be.visible;
      expect($hook('step', { name: 'baz' })).to.be.visible;
      expect(
        $hook('steps')
          .text()
          .trim()
      ).to.equal('baz');

      // Check that the new step now points to the first one
      click('button');

      expect($hook('step', { name: 'foo' })).to.be.visible;
      expect($hook('step', { name: 'bar' })).not.to.be.visible;
      expect($hook('step', { name: 'baz' })).not.to.be.visible;
      expect(
        $hook('steps')
          .text()
          .trim()
      ).to.equal('foo');
    });
  });
});
