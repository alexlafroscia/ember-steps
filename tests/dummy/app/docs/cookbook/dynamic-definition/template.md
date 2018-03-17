# Dynamic Definition of Steps

There may be cases where you need to define your steps dynamically from some data that your application received. Because the API for defining steps is declarative, it's totally possible to iterate over some data in your application to create your series of steps.

{{docs/cookbook/dynamic-definition/basic-demo}}

There are a few "gotchas" to know about when doing this that will be cleaned up in a future version:

1. Steps *must* be provided an explicit name
2. You *must* provide `currentStep` as an `unbound` value equal to the first step you want to show

These end up being necessary because of the way that `ember-steps` normally can generate step names and infer the first one at build time. When you're dynamically generating the steps, the build-time operations cannot be performed, which requires that the data is provided explicitly instead.
