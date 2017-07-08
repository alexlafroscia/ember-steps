function createErrorMessage(missingProperty) {
  return `\`${missingProperty}\` must be provided as static value.

If you're seeing this message, you're likely either iterating over some data
to create your steps or doing something to provide the value dynamically. This
is currently unsupported by \`ember-steps\`. Please see the following for more
information:

https://github.com/alexlafroscia/ember-steps/wiki/dynamically-generating-steps`;
}

/**
 * @class MissingPropertyError
 * @private
 */
export function MissingPropertyError(missingProperty) {
  this.name = 'MissingPropertyError';
  this.stack = new Error().stack;
  this.message = createErrorMessage(missingProperty);
}
MissingPropertyError.prototype = new Error();

/**
 * @class StepNameError
 * @private
 */
export function StepNameError(message) {
  this.name = 'StepNameError';
  this.message = message;
  this.stack = new Error().stack;
}
StepNameError.prototype = new Error();
