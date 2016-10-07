function createErrorMessage(missingProperty) {
  return `\`${missingProperty}\` must be provided. This should be ensured by the build process.

If you\'re seeing this message, please file a bug report because something is wrong.`;
}

/**
 * @class MissingPropertyError
 * @private
 */
export function MissingPropertyError(missingProperty) {
  this.name = 'MissingPropertyError';
  this.stack = (new Error()).stack;
  this.message = createErrorMessage(missingProperty);
}
MissingPropertyError.prototype = new Error;

/**
 * @class StepNameError
 * @private
 */
export function StepNameError(message) {
  this.name = 'StepNameError';
  this.message = message;
  this.stack = (new Error()).stack;
}
StepNameError.prototype = new Error;
