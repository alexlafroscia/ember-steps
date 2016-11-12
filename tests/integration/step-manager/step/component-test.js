import { expect } from 'chai';
import { describeComponent, it } from 'ember-mocha';
import { beforeEach, describe } from 'mocha';
import td from 'testdouble';
import hbs from 'htmlbars-inline-precompile';
import { initialize as initializeEmberHook, $hook } from 'ember-hook';
import { StepNameError } from 'ember-steps/-private/errors';

describeComponent(
  'step-manager/step',
  'Integration: StepManagerStepComponent',
  {
    integration: true
  },
  function() {
    beforeEach(initializeEmberHook);

    beforeEach(function() {
      this.on('register', function() { });
    });

    describe('registering with the rendering context', function() {
      it('registers itself with the step manager', function() {
        const registerAction = td.function();
        this.on('register', registerAction);

        this.render(hbs`
          {{step-manager/step name='foo' register-step=(action 'register')}}
        `);

        expect(registerAction).to.be.called;
      });

      it('throws an error when not provided a registration action', function() {
        expect(() => {
          this.render(hbs`{{step-manager/step}}`);
        }).to.throw(Error);
      });
    });

    describe('the step name', function() {
      it('must be provided', function() {
        expect(() => {
          this.render(hbs`
            {{step-manager/step register-step=(action 'register')}}
          `);
        }).to.throw(StepNameError, /Name must be provided/);
      });

      describe('with immuatable values', function() {
        it('can be given a value with the `unbound` helper', function() {
          this.set('name', 'someValue');

          expect(() => {
            this.render(hbs`
              {{step-manager/step name=(unbound name) register-step=(action 'register')}}
            `);
          }).not.to.throw(StepNameError);
        });

        it('can be given a string primitive', function() {
          expect(() => {
            this.render(hbs`
              {{step-manager/step name='someValue' register-step=(action 'register')}}
            `);
          }).not.to.throw(StepNameError);
        });
      });

      describe('with mutable values', function() {
        beforeEach(function() {
          this.set('name', 'someValue');
        });

        it('errors when given a value from the `mut` helper', function() {
          expect(() => {
            this.render(hbs`
              {{step-manager/step name=(mut name) register-step=(action 'register')}}
            `);
          }).to.throw(StepNameError, /Name must be an immutable string/);
        });

        // Skipped because there's currently no way to detect the `readonly` helper
        // at runtime. I eventually want to be able to error here because changes to
        // this value will not actually change the name of the step and could get
        // the user in trouble.
        it.skip('errors when given a value from the `readonly` helper', function() {
          expect(() => {
            this.render(hbs`
              {{step-manager/step name=(readonly name) register-step=(action 'register')}}
            `);
          }).to.throw(StepNameError, /Name must be an immutable string/);
        });

        it('errors when given a dynamic property directly', function() {
          expect(() => {
            this.render(hbs`
              {{step-manager/step name=name register-step=(action 'register')}}
            `);
          }).to.throw(StepNameError, /Name must be an immutable string/);
        });
      });

    });

    describe('rendering', function() {
      it('renders block content when visible', function() {
        this.render(hbs`
          {{#step-manager/step name='foo' isActive=true register-step=(action 'register')}}
            Foo
          {{/step-manager/step}}
        `);

        expect($hook('step')).to.contain('Foo');
      });

      describe('when inactive', function() {
        it('is hidden when no alternate state is provided', function() {
          this.render(hbs`
            {{#step-manager/step name='foo' register-step=(action 'register')}}
              Active Content
            {{/step-manager/step}}
          `);

          expect($hook('step')).not.to.be.visible;
          expect($hook('step')).not.to.contain('Active Content');
        });

        it('renders the inverse block if provided', function() {
          this.render(hbs`
            {{#step-manager/step name='foo' hasInactiveState=true register-step=(action 'register')}}
              Active Content
            {{else}}
              Inactive Content
            {{/step-manager/step}}
          `);

          expect($hook('step')).to.be.visible;
          expect($hook('step')).to.contain('Inactive Content');
        });
      });
    });

    describe('programmatically controlling visibility', function() {
      it('is visible when active', function() {
        this.render(hbs`
          {{step-manager/step name='foo' isActive=true register-step=(action 'register')}}
        `);

        expect($hook('step')).to.be.visible;
      });

      it('is invisible when not active', function() {
        this.render(hbs`
          {{step-manager/step name='foo' register-step=(action 'register')}}
        `);

        expect($hook('step')).not.to.be.visible;
      });
    });

    describe('lifecycle hooks', function() {
      describe('will-enter', function() {
        it('is called if the step is initially active', function() {
          const entranceAction = td.function();
          this.on('entrance', entranceAction);
          this.set('currentStep', 'foo');

          this.render(hbs`
            {{step-manager/step
                name='foo'
                currentStep=currentStep
                will-enter=(action 'entrance')
                register-step=(action 'register')}}
          `);

          this.set('currentStep', 'foo');

          expect(entranceAction).to.be.called;
        });

        it('is called when the step becomes active', function() {
          const entranceAction = td.function();
          this.on('entrance', entranceAction);
          this.set('currentStep', 'bar');

          this.render(hbs`
            {{step-manager/step
                name='foo'
                currentStep=currentStep
                will-enter=(action 'entrance')
                register-step=(action 'register')}}
          `);

          // Activate the step
          this.set('currentStep', 'foo');

          expect(entranceAction).to.be.called;
        });
      });

      describe('will-exit', function() {
        it('is called when the step becomes inactive', function() {
          const exitAction = td.function();
          this.on('exit', exitAction);
          this.set('currentStep', 'foo');

          this.render(hbs`
            {{step-manager/step
                name='foo'
                currentStep=currentStep
                will-exit=(action 'exit')
                register-step=(action 'register')}}
          `);

          // Deactivate the step
          this.set('currentStep', 'bar');

          expect(exitAction).to.be.called;
        });

        it('is not called when the current step changes to a value that is not the name of the step', function() {
          const exitAction = td.function();
          this.on('exit', exitAction);
          this.set('currentStep', 'bar');

          this.render(hbs`
            {{step-manager/step
                name='foo'
                currentStep=currentStep
                will-exit=(action 'exit')
                register-step=(action 'register')}}
          `);

          // Deactivate the step
          this.set('currentStep', 'baz');

          expect(exitAction).not.to.be.called;
        });
      });
    });
  }
);
