import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { computed, get } from '@ember/object';
import StepManagerComponent from 'ember-steps/components/step-manager';
import StepComponent from 'ember-steps/components/step-manager/step';

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

setApplication(Application.create(config.APP));
