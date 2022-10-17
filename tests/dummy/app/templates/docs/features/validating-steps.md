# Validating Steps

You might want to run some validations to ensure that your UI is actually ready to move onto the next step. `ember-steps` provides a `validate-transition` helper to aid with accomplishing this.

Basic usage of the helper looks like this:

<Docs::Features::ValidatingSteps::BasicUsage />

The general idea is that

- Instead of invoking the `transition` action directly, you can wrap it with a `validate-transition` helper and provide a validator function
- The validator function received a callback to invoke if the validation is successful
- When the validator calls the callback, the transition is performed

This allows the `validate-transition` helper to play nicely with any kind of asynchronous behavior you might need to perform. If you need to bind a "loading state" to the validator currently being run, I recommend using an [`ember-concurrency`][ember-concurrency] task as the validator function. In the below example, we disable the `button` while the task is in-flight.

<Docs::Features::ValidatingSteps::WithEmberConcurrency />

You probably noticed that, in the last two examples, there is no good way to go "back" to the previous step. What would going back mean? We want to both perform a transition _and_ reset the state of the component. We want to know when the transition has taken place.

Thankfully, there are already great tools for composing actions together. I recommend the `pipe` operator from [`ember-composable-helpers`][ember-composable-helpers]:

<Docs::Features::ValidatingSteps::WithDidTransition />

[ember-concurrency]: http://ember-concurrency.com/docs/introduction/
[ember-composable-helpers]: https://github.com/DockYard/ember-composable-helpers
