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
      it('registers itself with the step manager', function() {
        const registerAction = td.function();
        this.on('register', registerAction);

        this.render(hbs`
          {{step-manager/step
              name='foo'
              register-step=(action 'register')}}
        `);

        expect(registerAction).to.be.called;
      });

      it('throws an error when not provided a registration action', function() {
        expect(() => {
          this.render(hbs`{{step-manager/step}}`);
        }).to.throw(Error);
      });
    });

    describe('rendering', function() {
      it('renders block content when visible', function() {
        this.render(hbs`
          {{#step-manager/step isActive=true register-step=(action 'register')}}
            Foo
          {{/step-manager/step}}
        `);

        expect($hook('ember-wizard-step')).to.contain('Foo');
      });

      describe('when inactive', function() {
        it('is hidden when no alternate state is provided', function() {
          this.render(hbs`
            {{#step-manager/step register-step=(action 'register')}}
              Active Content
            {{/step-manager/step}}
          `);

          expect($hook('ember-wizard-step')).not.to.be.visible;
          expect($hook('ember-wizard-step')).not.to.contain('Active Content');
        });

        it('renders the inverse block if provided', function() {
          this.render(hbs`
            {{#step-manager/step hasInactiveState=true register-step=(action 'register')}}
              Active Content
            {{else}}
              Inactive Content
            {{/step-manager/step}}
          `);

          expect($hook('ember-wizard-step')).to.be.visible;
          expect($hook('ember-wizard-step')).to.contain('Inactive Content');
        });
      });
    });

    describe('programmatically controlling visibility', function() {
      it('is visible when active', function() {
        this.render(hbs`
          {{step-manager/step isActive=true register-step=(action 'register')}}
        `);

        expect($hook('ember-wizard-step')).to.be.visible;
      });

      it('is invisible when not active', function() {
        this.render(hbs`
          {{step-manager/step register-step=(action 'register')}}
        `);

        expect($hook('ember-wizard-step')).not.to.be.visible;
      });
    });
  }
);
