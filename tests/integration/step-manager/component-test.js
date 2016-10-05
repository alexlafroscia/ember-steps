import { expect } from 'chai';
import { describeComponent, it } from 'ember-mocha';
import { beforeEach, describe } from 'mocha';
import td from 'testdouble';
import hbs from 'htmlbars-inline-precompile';
import { initialize as initializeEmberHook, $hook } from 'ember-hook';

const { matchers: { anything: matchAnything } } = td;

describeComponent(
  'step-manager',
  'Integration: StepManagerComponent',
  {
    integration: true
  },
  function() {
    beforeEach(initializeEmberHook);

    describe('initial render', function() {
      it('renders `initialStep` first if provided', function() {
        this.render(hbs`
          {{#step-manager initialStep='second' as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}
          {{/step-manager}}
        `);

        expect($hook('ember-wizard-step', { name: 'first' })).not.to.be.visible;
        expect($hook('ember-wizard-step', { name: 'second' })).to.be.visible;
      });

      it('renders the first step in the DOM if no `initialStep` is present', function() {
        this.render(hbs`
          {{#step-manager as |w|}}
            {{w.step name='first'}}
            {{w.step name='second'}}
          {{/step-manager}}
        `);

        expect($hook('ember-wizard-step', { name: 'first' })).to.be.visible;
        expect($hook('ember-wizard-step', { name: 'second' })).not.to.be.visible;
      });
    });

    describe('meta-data', function() {
      it('exposes the total number of steps', function() {
        this.render(hbs`
          {{#step-manager as |w|}}
            {{w.totalSteps}}

            {{w.step}}
            {{w.step}}
          {{/step-manager}}
        `);

        expect($hook('ember-wizard-step-manager')).to.contain('2');
      });

      describe('exposing the current step\'s name', function() {
        it('works with a provided name', function() {
          this.render(hbs`
            {{#step-manager as |w|}}
              {{w.currentStep}}

              {{w.step name='foo'}}
            {{/step-manager}}
          `);

          expect($hook('ember-wizard-step-manager')).to.contain('foo');
        });

        it('works with a generated, index-based name', function() {
          this.render(hbs`
            {{#step-manager as |w|}}
              {{w.currentStep}}

              {{w.step}}
            {{/step-manager}}
          `);

          expect($hook('ember-wizard-step-manager')).to.contain('index-0');
        });
      });
    });

    describe('transitions to named steps', function() {
      it('can transition to another step', function() {
        this.render(hbs`
          {{#step-manager initialStep='first' as |w|}}
            <button {{action w.transition-to 'second'}}>
              Transition to Next
            </button>

            {{w.step name='first'}}
            {{w.step name='second'}}
          {{/step-manager}}
        `);

        expect($hook('ember-wizard-step', { name: 'first' })).to.be.visible;
        expect($hook('ember-wizard-step', { name: 'second' })).not.to.be.visible;

        this.$('button').click();

        expect($hook('ember-wizard-step', { name: 'first' })).not.to.be.visible;
        expect($hook('ember-wizard-step', { name: 'second' })).to.be.visible;
      });

      it('errors when transitioning to an invalid step', function() {
        expect(() => {
          this.render(hbs`
            {{#step-manager initialStep='first' as |w|}}
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
          {{#step-manager initialStep='first' did-transition=(action 'transition') as |w|}}
            <button {{action w.transition-to 'second' 'some value'}}>
              Transition to Next
            </button>

            {{w.step name='first'}}
            {{w.step name='second'}}
          {{/step-manager}}
        `);

        this.$('button').click();

        expect(onTransitionAction).to.be.calledWith({
          value: 'some value',
          from: 'first',
          to: 'second'
        });
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

        expect(onTransitionAction).to.be.calledWith({
          value: 'some value',
          from: 'index-0',
          to: 'index-1'
        });
      });

      describe('the arguments', function() {
        it('passes the destination and source step', function() {
          const action = td.function('did-transition action');
          this.on('action', action);

          this.render(hbs`
            {{#step-manager did-transition=(action 'action') as |w|}}
              {{w.step}}
              {{w.step}}

              <button {{action w.transition-to-next}}>
                Next
              </button>
            {{/step-manager}}
          `);
          this.$('button').click();

          expect(action).to.be.calledWith({
            value: undefined,
            from: 'index-0',
            to: 'index-1'
          });
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

          expect(action).to.be.calledWith({
            value: 'foo',
            from: 'index-0',
            to: 'index-1'
          });
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
              {{w.step}}
              {{w.step}}

              <button {{action w.transition-to-next}}>
                Next
              </button>
            {{/step-manager}}
          `);
          this.$('button').click();

          expect(beforeAction).to.be.calledWith({
            value: undefined,
            from: 'index-0',
            to: 'index-1'
          });
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

          expect(beforeAction).to.be.calledWith({
            value: 'foo',
            from: 'index-0',
            to: 'index-1'
          });
        });
      });

      it('prevents the transition if it returns `false`', function() {
        const beforeAction = td.function('before action');
        td.when(beforeAction(matchAnything())).thenReturn(false);
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

        expect($hook('ember-wizard-step', { name: 'index-0' })).to.be.visible;
        expect($hook('ember-wizard-step', { name: 'index-1' })).not.to.be.visible;
      });
    });
  }
);
