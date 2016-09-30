import { expect } from 'chai';
import { describeComponent, it } from 'ember-mocha';
import { beforeEach, describe } from 'mocha';
import td from 'testdouble';
import hbs from 'htmlbars-inline-precompile';
import { initialize as initializeEmberHook, $hook } from 'ember-hook';

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
      it('registers its name when provided an action', function() {
        const registerAction = td.function();
        this.on('register', registerAction);

        this.render(hbs`
          {{step-manager/step
              name='foo'
              register-step=(action 'register')}}
        `);

        expect(registerAction).to.be.calledWith('foo');
      });

      it('throws an error when not provided an action', function() {
        expect(() => {
          this.render(hbs`{{step-manager/step}}`);
        }).to.throw(Error);
      });
    });

    describe('rendering', function() {
      it('renders block content if visible', function() {
        this.render(hbs`
          {{#step-manager/step currentStep='foo' name='foo' register-step=(action 'register')}}
            Foo
          {{/step-manager/step}}
        `);

        expect(this.$().text().trim()).to.equal('Foo');
      });
    });

    describe('programmatically controlling visibility', function() {
      it('is visible if the name and `currentStep` match', function() {
        this.render(hbs`
          {{step-manager/step currentStep='foo' name='foo' register-step=(action 'register')}}
        `);

        expect($hook('ember-wizard-step')).to.be.visible;
      });

      it('is hidden if the name and `currentStep` do not match', function() {
        this.render(hbs`
          {{step-manager/step currentStep='bar' name='foo' register-step=(action 'register')}}
        `);

        expect($hook('ember-wizard-step')).not.to.be.visible;
      });
    });
  }
);
