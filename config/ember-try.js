/* eslint-env node */

module.exports = {
  scenarios: [
    {
      name: 'default',
      bower: {
        dependencies: { }
      }
    },
    {
      name: 'minimum-supported-version',
      bower: {
        dependencies: {
          'ember': '~2.3.0'
        },
        resolutions: {
          'ember': '~2.3.0'
        }
      }
    },
    {
      name: 'fastboot-addon-tests',
      command: 'ember fastboot:test',
      bower: {
        dependencies: { }
      }
    },
    {
      name: 'ember-release',
      bower: {
        dependencies: {
          'ember': 'components/ember#release'
        },
        resolutions: {
          'ember': 'release'
        }
      }
    },
    {
      name: 'ember-beta',
      bower: {
        dependencies: {
          'ember': 'components/ember#beta'
        },
        resolutions: {
          'ember': 'beta'
        }
      }
    },
    {
      name: 'ember-canary',
      bower: {
        dependencies: {
          'ember': 'components/ember#canary'
        },
        resolutions: {
          'ember': 'canary'
        }
      }
    },
    {
      name: 'ember-lts-2.4',
      bower: {
        dependencies: {
          'ember': 'components/ember#lts-2-4'
        },
        resolutions: {
          'ember': 'lts-2-4'
        }
      }
    },
    {
      name: 'ember-lts-2.8',
      bower: {
        dependencies: {
          'ember': 'components/ember#lts-2-8'
        },
        resolutions: {
          'ember': 'lts-2-8'
        }
      }
    }
  ]
};
