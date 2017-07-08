import Ember from 'ember';
import SlotsMixin from 'ember-block-slots';
import layout from './template';

const { Component } = Ember;

export default Component.extend(SlotsMixin, {
  localClassNames: ['usage-example'],

  layout,

  title: ''
});
