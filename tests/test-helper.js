import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

import './assertions/dom';
import './assertions/verify';
import './assertions/wait-for';

setApplication(Application.create(config.APP));

start();
