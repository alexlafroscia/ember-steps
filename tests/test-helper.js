import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-cli-qunit';
import QUnit from 'qunit';
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

setApplication(Application.create(config.APP));

start();
