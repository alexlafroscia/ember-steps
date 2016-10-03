import { expect } from 'chai';
import { describeComponent, it } from 'ember-mocha';
import { beforeEach, describe } from 'mocha';
import td from 'testdouble';
import hbs from 'htmlbars-inline-precompile';
import { initialize as initializeEmberHook, $hook } from 'ember-hook';

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

    describe('exposing meta-data', function() {
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

    describe('collecting data', function() {
      describe('during named transitions', function() {
        it('triggers an event on transition', function() {
          const onTransitionAction = td.function();
          this.on('transition', onTransitionAction);

          this.render(hbs`
            {{#step-manager initialStep='first' on-transition=(action 'transition') as |w|}}
              <button {{action w.transition-to 'second' 'some value'}}>
                Transition to Next
              </button>

              {{w.step name='first'}}
              {{w.step name='second'}}
            {{/step-manager}}
          `);

          this.$('button').click();

          expect(onTransitionAction).to.be.calledWith('second', 'some value');
        });
      });

      describe('during anonymous transitions', function() {
        it('triggers an event on transition', function() {
          const onTransitionAction = td.function();
          this.on('transition', onTransitionAction);

          this.render(hbs`
            {{#step-manager on-transition=(action 'transition') as |w|}}
              <button {{action w.transition-to-next 'some value'}}>
                Transition to Next
              </button>

              {{w.step}}
              {{w.step}}
            {{/step-manager}}
          `);

          this.$('button').click();

          expect(onTransitionAction).to.be.calledWith('some value');
        });
      });
    });
  }
);
