/**
 * @class NoInitialStepError
 * @private
 */
export function NoInitialStepError() {
  this.name = 'NoInitialStepError';
  this.stack = (new Error()).stack;
}
NoInitialStepError.prototype = new Error;
NoInitialStepError.prototype.message = `
Initial step must be provided. This should be ensured by the build process.

If you're seeing this message, please file a bug report because something is wrong.
`.trim();

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
