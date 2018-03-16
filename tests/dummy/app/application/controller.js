import Controller from '@ember/controller';

export default Controller.extend({
  navExpanded: false,

  actions: {
    toggleNav() {
      this.toggleProperty('navExpanded');
    }
  }
});
