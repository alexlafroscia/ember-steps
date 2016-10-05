import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import StateMachine from 'ember-wizard/-private/state-machine';

describe('stateMachine', function() {
  it('sets the initial step as the current one, if provided', function() {
    const m = new StateMachine({
      initialStep: 'foo'
    });

    expect(m.currentStep).to.equal('foo');
  });

  describe('#peek', function() {
    it('can get the next value without advancing', function() {
      const m = new StateMachine();
      m.addStep('foo');
      m.addStep('bar');

      expect(m.peek()).to.equal('bar');
      expect(m.currentStep).to.equal('foo');
    });
  });

  describe('moving through states', function() {
    beforeEach(function() {
      const m = new StateMachine();
      m.addStep('foo');
      m.addStep('bar');
      m.addStep('baz');

      this.stateMachine = m;
    });

    it('can step through a number of steps', function() {
      const m = this.stateMachine;

      // Check initial state
      expect(m.currentStep).to.equal('foo');

      expect(m.next()).to.equal('bar');
      expect(m.currentStep).to.equal('bar');

      expect(m.next()).to.equal('baz');
      expect(m.currentStep).to.equal('baz');

      expect(m.next()).to.equal('foo');
      expect(m.currentStep).to.equal('foo');
    });
  });

  describe('activating a specific step', function() {
    beforeEach(function() {
      const m = new StateMachine();
      m.addStep('foo');
      m.addStep('bar');
      m.addStep('baz');

      this.stateMachine = m;
    });

    it('can activate a step by name', function() {
      const m = this.stateMachine;

      m.activate('bar');

      expect(m.currentStep).to.equal('bar');

      expect(m.next()).to.equal('baz');
      expect(m.currentStep).to.equal('baz');

      expect(m.next()).to.equal('foo');
      expect(m.currentStep).to.equal('foo');
    });

    it('throws an error if the step name is not valid', function() {
      const m = this.stateMachine;

      expect(function() {
        m.activate('foobar');
      }).to.throw(Error, /Step name "foobar" is invalid/);
    });

    it('throws an error if no step name is provided', function() {
      const m = this.stateMachine;

      expect(function() {
        m.activate();
      }).to.throw(Error, /No step name provided/);
    });
  });

  describe('calculating the total number of steps', function() {
    it('exposes the length', function() {
      const m = new StateMachine();

      m.addStep('foo');
      m.addStep('bar');

      expect(m.get('length')).to.equal(2);

      m.addStep('baz');

      expect(m.get('length')).to.equal(3);
    });
  });
});
