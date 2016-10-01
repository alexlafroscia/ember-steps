import Ember from 'ember';
import SlotsMixin from 'ember-block-slots';
import layout from './template';

const { Component, set } = Ember;

export default Component.extend(SlotsMixin, {
  classNameBindings: ['styles.usage-example'],

  layout,

  title: '',

  activeBlock: 'template',

  actions: {
    'switch-to-block'(name) {
      set(this, 'activeBlock', name);
    }
  }
});
