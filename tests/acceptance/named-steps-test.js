import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { $hook, hook } from 'ember-hook';

describe('Acceptance: NamedSteps', function() {
  let application;

  this.timeout(0);

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('can advance through a set of named steps', function() {
    visit('/named-steps');

    andThen(function() {
      expect($hook('ember-wizard-step', { name: 'first' })).to.contain('This is the first step');
      expect($hook('ember-wizard-step', { name: 'second' })).not.to.be.visible;
      expect($hook('ember-wizard-step', { name: 'third' })).not.to.be.visible;
    });

    click(hook('first-button'));

    andThen(function() {
      expect($hook('ember-wizard-step', { name: 'first' })).not.to.be.visible;
      expect($hook('ember-wizard-step', { name: 'second' })).to.contain('This is the second step');
      expect($hook('ember-wizard-step', { name: 'third' })).not.to.be.visible;
    });

    click(hook('second-button'));

    andThen(function() {
      expect($hook('ember-wizard-step', { name: 'first' })).not.to.be.visible;
      expect($hook('ember-wizard-step', { name: 'second' })).not.to.be.visible;
      expect($hook('ember-wizard-step', { name: 'third' })).to.contain('This is the third step');
    });

    click(hook('third-button'));

    andThen(function() {
      expect($hook('ember-wizard-step', { name: 'first' })).to.contain('This is the first step');
      expect($hook('ember-wizard-step', { name: 'second' })).not.to.be.visible;
      expect($hook('ember-wizard-step', { name: 'third' })).not.to.be.visible;
    });
  });
});
