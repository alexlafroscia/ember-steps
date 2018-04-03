/* eslint-env node, mocha */

'use strict';

const expect = require('chai').expect;
const setupTest = require('ember-fastboot-addon-tests').setupTest;

describe('FastBoot', function() {
  setupTest('fastboot');

  it('renders the initially visible step', async function() {
    const res = await this.visit('/');
    const { jQuery: jq, response } = res;

    expect(response.statusCode).to.equal(200);
    expect(
      jq('h1')
        .text()
        .trim()
    ).to.equal('First Step');
  });
});
