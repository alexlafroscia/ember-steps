import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import StateMachine from 'ember-steps/-private/state-machine';

describe('Step Transition State Machine', function() {
  describe('constructor', function() {
    it('uses the initial step, if provided', function() {
      const m = new StateMachine({
        initialStep: 'foo'
      });

      expect(m.get('currentStep')).to.equal('foo');
    });

    it('calculates the initial step if necessary', function() {
      const m = new StateMachine();
      m.addStep('foo');

      expect(m.get('currentStep')).to.equal('foo');
    });
  });

  describe('#peek', function() {
    it('can get the next step without advancing', function() {
      const m = new StateMachine();
      m.addStep('foo');
      m.addStep('bar');

      expect(m.peek()).to.equal('bar');
      expect(m.get('currentStep')).to.equal('foo');
    });
  });

  describe('#next', function() {
    it('can transition to the next step', function() {
      const m = new StateMachine();
      m.addStep('foo');
      m.addStep('bar');
      m.addStep('baz');

      expect(m.next()).to.equal('bar');
      expect(m.next()).to.equal('baz');
      expect(m.next()).to.equal('foo');
    });
  });

  describe('#activate', function() {
    beforeEach(function() {
      this.m = new StateMachine();
      this.m.addStep('foo');
      this.m.addStep('bar');
    });

    it('can go to a step by name', function() {
      this.m.activate('bar');
      expect(this.m.get('currentStep')).to.equal('bar');
    });

    it('throws an error if the step name is not valid', function() {
      expect(() => {
        this.m.activate('foobar');
      }).to.throw(Error, /Step name "foobar" is invalid/);
    });

    it('throws an error if no step name is provided', function() {
      expect(() => {
        this.m.activate();
      }).to.throw(Error, /No step name provided/);
    });
  });

  describe('.length', function() {
    beforeEach(function() {
      this.m = new StateMachine();
      this.m.addStep('foo');
      this.m.addStep('bar');
    });

    it('is set to the number of steps', function() {
      expect(this.m.get('length')).to.equal(2);
    });

    it('updates as more steps are added', function() {
      this.m.addStep('baz');
      expect(this.m.get('length')).to.equal(3);
    });
  });

  describe('.currentStep', function() {
    it('exposes the name of the current step', function() {
      const m = new StateMachine();
      m.addStep('foo');
      expect(m.get('currentStep')).to.equal('foo');
    });
  });
});
