import Ember from 'ember';
import resolver from './helpers/resolver';
import { setResolver } from 'ember-mocha';

import StepManagerComponent from 'ember-steps/components/step-manager/component';
import StepComponent from 'ember-steps/components/step-manager/step/component';

const { $, computed, get } = Ember;

setResolver(resolver);

// Custom test Mocha browser config
if (window.location.search.indexOf('nocontainer') > -1) {
  $('#ember-testing-container').css({ visibility: 'hidden' });
}

// Configure ember-hook
StepManagerComponent.reopen({
  hook: 'step-manager'
});

StepComponent.reopen({
  hook: 'step',
  hookQualifiers: computed('name', function() {
    const index = get(this, 'index');
    const name = get(this, 'name');

    return { index, name };
  })
});
