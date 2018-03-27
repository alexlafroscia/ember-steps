import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-cli-qunit';
import { computed, get } from '@ember/object';
import QUnit from 'qunit';
import StepManagerComponent from 'ember-steps/components/step-manager';
import StepComponent from 'ember-steps/components/step-manager/step';

import td from 'testdouble';

QUnit.extend(QUnit.assert, {
  verify() {
    try {
      td.verify(...arguments);

      this.pushResult({
        result: true,
        message: 'Stub passed verification'
      });
    } catch ({ message }) {
      this.pushResult({
        result: false,
        message
      });
    }
  },

  wasCalled(fxn, expected = 1) {
    const { callCount: actual } = td.explain(fxn);
    const result = actual === expected;

    this.pushResult({
      result,
      actual,
      expected,
      message: result
        ? 'Stub was called the expected number of times'
        : `Should have been called ${expected} times, but was called ${actual}`
    });
  },

  wasNotCalled(fxn) {
    const meta = td.explain(fxn);
    const actual = meta.callCount;
    const result = actual === 0;

    this.pushResult({
      result,
      actual,
      expected: 0,
      message: result
        ? 'Stub was not called'
        : 'Should not have been called, but it was'
    });
  }
});

// Configure ember-hook
StepManagerComponent.reopen({
  hook: 'step-manager'
});

StepComponent.reopen({
  hook: 'step',
  hookQualifiers: computed('name', function() {
    const index = get(this, 'index');
    const name = get(this, 'name');

    return { index, name };
  })
});

setApplication(Application.create(config.APP));

start();
