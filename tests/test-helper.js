import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

import './assertions/verify';

setApplication(Application.create(config.APP));

start();
