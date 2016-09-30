import resolver from './helpers/resolver';
import { setResolver } from 'ember-mocha';

// Set up TD assertions in Chai
import td, { tdChai } from 'testdouble';
import chai from 'chai';

chai.use(tdChai(td));
chai.use(isVisible);

setResolver(resolver);

/*
 * Create a Chai helper for jQuery element visibility
 */
function isVisible(chai, utils) {
  utils.addProperty(chai.Assertion.prototype, 'visible', visibilityHandler);

  function visibilityHandler(opts) {
    const subject = this._obj;
    let id;

    try {
      id = subject.attr('data-test')
        .split('&^%^&')
        .filter((segment) => segment.length)
        .join(' ');
      id = `'${id}'`;
    } catch(e) {
      id = '(selector error)';
    }

    this.assert(
      subject.is(':visible'),
      `Element ${id} is not visible`,
      `Element ${id} is visible`
    );
  }
}
