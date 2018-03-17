/* eslint-disable ember/no-global-jquery */

const { expect } = require('chai');

describe('index', function() {
  it('renders the initial step', function() {
    return this.visit('/').then(function(res) {
      const $ = res.jQuery;

      expect($('.step').is(':visible')).to.be.ok;
      expect($('h1').text().trim()).to.equal('This should be visible');
    });
  });
});
