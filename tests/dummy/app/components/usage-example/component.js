import Component from '@ember/component';
import SlotsMixin from 'ember-block-slots';
import layout from './template';

export default Component.extend(SlotsMixin, {
  localClassNames: ['usage-example'],

  layout,

  title: ''
});
