import resolver from './helpers/resolver';
import { setResolver } from 'ember-mocha';

// Set up TD assertions in Chai
import td, { tdChai } from 'testdouble';
import chai from 'chai';

chai.use(tdChai(td));
setResolver(resolver);
