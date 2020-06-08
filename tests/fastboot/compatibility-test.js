import { module, test } from 'qunit';
import { setup, visit } from 'ember-cli-fastboot-testing/test-support';

module('FastBoot | compatibility', function (hooks) {
  setup(hooks);

  test('renders the initial visible step', async function (assert) {
    await visit('/fastboot-test');

    assert
      .dom('[data-test-step="first"]')
      .exists('The initial step is rendered');
    assert
      .dom('[data-test-step="second"]')
      .doesNotExist('Other steps are not rendered');
  });
});
