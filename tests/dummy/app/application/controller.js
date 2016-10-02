import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  navExpanded: false,

  actions: {
    toggleNav() {
      this.toggleProperty('navExpanded');
    }
  }
});
