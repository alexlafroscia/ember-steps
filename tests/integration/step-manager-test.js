import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { expect } from 'chai';
import td from 'testdouble';
import hbs from 'htmlbars-inline-precompile';
import { initialize as initializeEmberHook, $hook, hook } from 'ember-hook';
import { click, findAll, render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { A } from '@ember/array';
import RSVP from 'rsvp';

const { matchers: { anything: matchAnything, contains: matchContains } } = td;

describe('Integration: StepManagerComponent', function() {
  setupRenderingTest();

  beforeEach(initializeEmberHook);

  describe('`currentStep` attribute', function() {
    describe('getting the initial step', function() {
      it('can use a primitive value', async function() {
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

        expect($hook('first')).not.to.be.visible;
        expect($hook('second')).to.be.visible;
      });

      it('can use a value from the `mut` helper', async function() {
        this.set('currentStep', 'second');
        await render(hbs`
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
      it('changes steps when the property changes', async function() {
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

      it('changes steps when the property changes (with the mut helper)', async function() {
        this.set('step', 'first');
        await render(hbs`
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

      it.skip(
        'throws an error when an invalid step is provided',
        async function() {
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

          expect($hook('first')).to.be.visible;
          expect($hook('second')).not.to.be.visible;

          expect(() => {
            this.set('step', 'foobar');
          }).to.throw(Error);
        }
      );
    });

    describe('updating the target object from the component', function() {
      it("mutates the target object's property when a mutable value is provided", async function() {
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

        expect(this.get('step')).to.equal('second');
      });

      it("mutates the target object's property when a regular value is provided", async function() {
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

        expect(this.get('step')).to.equal('second');
      });

      it('does not update the target object with an unbound value', async function() {
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

        expect(this.get('step')).to.equal('first');
      });
    });
  });

  it('renders the first step in the DOM if no `currentStep` is present', async function() {
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

    expect($hook('first')).to.be.visible;
    expect($hook('second')).not.to.be.visible;
  });

  it('renders tagless components', async function() {
    await render(hbs`
      <div id="steps">
        {{#step-manager as |w|}}
          {{w.step}}
        {{/step-manager}}
      </div>
    `);

    expect(findAll('#steps *')).to.be.empty;
  });

  describe('`yield`-ed data', function() {
    it('exposes the name of the current step', async function() {
      await render(hbs`
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
      it('can render the array after the steps are defined', async function() {
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

        await click(hook('step-trigger', { step: 'bar' }));

        expect($hook('active-step')).to.contain('Bar');
      });

      it('can render the array before the steps are defined', async function() {
        await render(hbs`
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

        await click(hook('step-trigger', { step: 'bar' }));

        expect($hook('active-step')).to.contain('Bar');
      });
    });
  });

  describe('transitions to named steps', function() {
    it('can transition to another step', async function() {
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

      expect($hook('first')).to.be.visible;
      expect($hook('second')).not.to.be.visible;

      await click('button');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).to.be.visible;
    });

    it.skip('errors when transitioning to an invalid step', function() {
      expect(async () => {
        await render(hbs`
          {{#step-manager currentStep='first' as |w|}}
            <button {{action w.transition-to 'second'}}>
              Transition to Next
            </button>

            {{w.step name='first'}}
          {{/step-manager}}
        `);

        await click('button');
      }).to.throw(Error);
    });
  });

  describe('transition to anonymous steps', function() {
    it('can transition to the next step', async function() {
      await render(hbs`
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

      await click('button');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).to.be.visible;
      expect($hook('third')).not.to.be.visible;

      await click('button');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).not.to.be.visible;
      expect($hook('third')).to.be.visible;

      await click('button');

      expect($hook('first')).to.be.visible;
      expect($hook('second')).not.to.be.visible;
      expect($hook('third')).not.to.be.visible;
    });

    it('can transition to the previous step', async function() {
      await render(hbs`
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

      await click('#next');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).to.be.visible;
      expect($hook('third')).not.to.be.visible;

      await click('#next');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).not.to.be.visible;
      expect($hook('third')).to.be.visible;

      await click('#previous');

      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).to.be.visible;
      expect($hook('third')).not.to.be.visible;
    });
  });

  describe('providing a `did-transition` action', function() {
    it('is fired during a named transition', async function() {
      const onTransitionAction = td.function();
      this.set('transition', onTransitionAction);

      await render(hbs`
        {{#step-manager currentStep='first' did-transition=(action transition) as |w|}}
          <button {{action w.transition-to 'second' 'some value'}}>
            Transition to Next
          </button>

          {{w.step name='first'}}
          {{w.step name='second'}}
        {{/step-manager}}
      `);

      await click('button');

      expect(onTransitionAction).to.be.called;
    });

    it('is fired during a sequential transition', async function() {
      const onTransitionAction = td.function();
      this.set('transition', onTransitionAction);

      await render(hbs`
        {{#step-manager did-transition=(action transition) as |w|}}
          <button {{action w.transition-to-next 'some value'}}>
            Transition to Next
          </button>

          {{w.step}}
          {{w.step}}
        {{/step-manager}}
      `);

      await click('button');

      expect(onTransitionAction).to.be.called;
    });

    describe('the arguments', function() {
      it('passes the destination and source step', async function() {
        const action = td.function('did-transition action');
        this.set('action', action);

        await render(hbs`
          {{#step-manager did-transition=(action action) as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}

            <button {{action w.transition-to-next}}>
              Next
            </button>
          {{/step-manager}}
        `);
        await click('button');

        expect(action).to.be.calledWith(
          matchContains({
            from: 'first',
            to: 'second'
          })
        );
      });

      it('passes the value when given one', async function() {
        const action = td.function('did-transition action');
        this.set('action', action);

        await render(hbs`
          {{#step-manager did-transition=(action action) as |w|}}
            {{w.step}}
            {{w.step}}

            <button {{action w.transition-to-next 'foo'}}>
              Next
            </button>
          {{/step-manager}}
        `);
        await click('button');

        expect(action).to.be.calledWith(
          matchContains({
            value: 'foo'
          })
        );
      });
    });
  });

  describe('providing a `will-transition` action', function() {
    it('is not fired before entering the initial route', async function() {
      const beforeAction = td.function('before action');
      this.set('beforeAction', beforeAction);

      await render(hbs`
        {{#step-manager will-transition=(action beforeAction) as |w|}}
          {{w.step name='first'}}
        {{/step-manager}}
      `);

      expect(beforeAction).not.to.be.called;
    });

    it('is fired before a named transition', async function() {
      const beforeAction = td.function('before action');
      this.set('beforeAction', beforeAction);

      await render(hbs`
        {{#step-manager will-transition=(action beforeAction) as |w|}}
          {{w.step name='initial'}}
          {{w.step name='next'}}

          <button {{action w.transition-to 'next'}}>
            Next
          </button>
        {{/step-manager}}
      `);
      await click('button');

      expect(beforeAction).to.be.called;
    });

    it('is fired before a sequential transition', async function() {
      const beforeAction = td.function('before action');
      this.set('beforeAction', beforeAction);

      await render(hbs`
        {{#step-manager will-transition=(action beforeAction) as |w|}}
          {{w.step}}
          {{w.step}}

          <button {{action w.transition-to-next}}>
            Next
          </button>
        {{/step-manager}}
      `);
      await click('button');

      expect(beforeAction).to.be.called;
    });

    describe('the arguments', function() {
      it('passes the destination and source step', async function() {
        const beforeAction = td.function('before action');
        this.set('beforeAction', beforeAction);

        await render(hbs`
          {{#step-manager will-transition=(action beforeAction) as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}

            <button {{action w.transition-to-next}}>
              Next
            </button>
          {{/step-manager}}
        `);
        await click('button');

        expect(beforeAction).to.be.calledWith(
          matchContains({
            from: 'first',
            to: 'second'
          })
        );
      });

      it('passes the value when given one', async function() {
        const beforeAction = td.function('before action');
        this.set('beforeAction', beforeAction);

        await render(hbs`
          {{#step-manager will-transition=(action beforeAction) as |w|}}
            {{w.step}}
            {{w.step}}

            <button {{action w.transition-to-next 'foo'}}>
              Next
            </button>
          {{/step-manager}}
        `);
        await click('button');

        expect(beforeAction).to.be.calledWith(
          matchContains({
            value: 'foo'
          })
        );
      });

      it('passes the direction when using transition-to-next or transition-to-previous', async function() {
        const beforeAction = td.function('before action');
        this.set('beforeAction', beforeAction);

        await render(hbs`
          {{#step-manager will-transition=(action beforeAction) as |w|}}
            {{w.step}}
            {{w.step}}

            <button {{action w.transition-to-next}}>
              Next
            </button>
          {{/step-manager}}
        `);
        await click('button');

        expect(beforeAction).to.be.calledWith(
          matchContains({
            direction: 'next'
          })
        );
      });
    });

    it('can wait for a promise to resolve', async function() {
      let didTransition = false;
      const waitForMe = function() {
        return new RSVP.Promise(function(resolve) {
          run.later(null, resolve, 500);
        });
      };
      this.set('beforeAction', waitForMe);
      this.set('afterTransition', () => (didTransition = true));

      await render(hbs`
        {{#step-manager will-transition=(action beforeAction) did-transition=(action afterTransition) as |w|}}
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

      expect(didTransition).to.equal(false);

      await click('button');

      expect(didTransition).to.equal(true);
      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).to.be.visible;
    });

    it('prevents the transition if the promise resolve to `false`', async function() {
      let didTransition = false;
      const waitForMe = function() {
        return new RSVP.Promise(function(resolve) {
          run.later(null, () => resolve(false), 500);
        });
      };
      this.set('beforeAction', waitForMe);
      this.set('afterTransition', () => (didTransition = true));

      await render(hbs`
        {{#step-manager will-transition=(action beforeAction) did-transition=(action afterTransition) as |w|}}
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

      await click('button');

      expect(didTransition).to.equal(false);
      expect($hook('first')).to.be.visible;
      expect($hook('second')).not.to.be.visible;
    });

    it('prevents the transition if the promise reject', async function() {
      let didTransition = false;
      const waitForMe = function() {
        return new RSVP.Promise(function(resolve, reject) {
          run.later(null, reject, 500);
        });
      };
      this.set('beforeAction', waitForMe);
      this.set('afterTransition', () => (didTransition = true));

      await render(hbs`
        {{#step-manager will-transition=(action beforeAction) did-transition=(action afterTransition) as |w|}}
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

      await click('button');

      expect(didTransition).to.equal(false);
      expect($hook('first')).to.be.visible;
      expect($hook('second')).not.to.be.visible;
    });

    it('prevents the transition if it returns `false`', async function() {
      const beforeAction = td.function('before action');
      td.when(beforeAction(matchAnything())).thenReturn(false);
      this.set('beforeAction', beforeAction);

      await render(hbs`
        {{#step-manager will-transition=(action beforeAction) as |w|}}
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

      await click('button');

      expect($hook('first')).to.be.visible;
      expect($hook('second')).not.to.be.visible;
    });

    it("doesn't update loading when destroyed", async function() {
      let didTransition = false;
      this.set('beforeAction', function() {
        return new RSVP.Promise(function(resolve) {
          run.later(null, resolve, 500);
        });
      });
      this.set('afterTransition', () => (didTransition = true));

      await render(hbs`
        {{#step-manager will-transition=(action beforeAction) did-transition=(action afterTransition) as |w|}}
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
      await this.clearRender();

      expect(didTransition).to.equal(false);
      expect($hook('first')).not.to.be.visible;
      expect($hook('second')).not.to.be.visible;
    });
  });

  describe('assigning step indices', function() {
    it('works outside of a loop', async function() {
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

      expect($hook('step', { index: 0 })).to.be.visible;
      expect($hook('step', { index: 1 })).not.to.be.visible;

      await click('button');

      expect($hook('step', { index: 0 })).not.to.be.visible;
      expect($hook('step', { index: 1 })).to.be.visible;
    });
  });

  describe('showing alternate step states', function() {
    it('property is added by the HTMLBars transform', async function() {
      await render(hbs`
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

      expect($hook('step', { index: 0 }).text().trim()).to.equal('Active');
      expect($hook('step', { index: 1 }).text().trim()).to.equal('Inactive');
    });
  });

  describe('dynamically creating steps', function() {
    beforeEach(function() {
      this.set('data', A([{ name: 'foo' }, { name: 'bar' }]));
    });

    it('allows dynamically creating steps', async function() {
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

      expect($hook('step', { name: 'foo' })).to.be.visible;
      expect($hook('step', { name: 'bar' })).not.to.be.visible;
      expect($hook('steps').text().trim()).to.equal('foo');

      await click('button');

      expect($hook('step', { name: 'foo' })).not.to.be.visible;
      expect($hook('step', { name: 'bar' })).to.be.visible;
      expect($hook('steps').text().trim()).to.equal('bar');
    });

    it('allows for adding more steps after the initial render', async function() {
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

      await click('button');

      this.set('data', A([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]));

      expect($hook('step', { name: 'foo' })).not.to.be.visible;
      expect($hook('step', { name: 'bar' })).to.be.visible;
      expect($hook('step', { name: 'baz' })).not.to.be.visible;

      // Check that the previous "last step" now points to the new one
      await click('button');

      expect($hook('step', { name: 'foo' })).not.to.be.visible;
      expect($hook('step', { name: 'bar' })).not.to.be.visible;
      expect($hook('step', { name: 'baz' })).to.be.visible;
      expect($hook('steps').text().trim()).to.equal('baz');

      // Check that the new step now points to the first one
      await click('button');

      expect($hook('step', { name: 'foo' })).to.be.visible;
      expect($hook('step', { name: 'bar' })).not.to.be.visible;
      expect($hook('step', { name: 'baz' })).not.to.be.visible;
      expect($hook('steps').text().trim()).to.equal('foo');
    });
  });
});
