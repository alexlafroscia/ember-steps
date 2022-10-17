# Dynamic Definition of Steps

There may be cases where you need to define your steps dynamically from some data that your application received. Because the API for defining steps is declarative, it's totally possible to iterate over some data in your application to create your series of steps.

<Docs::Cookbook::DynamicDefinition::BasicDemo />

Note that while providing a `name` to each dynamic step is not necessary, it is useful if you're adding to the list of steps dynamically. Without a consistent name between re-renders, the `step-manager` can not ensure that the current step remains visible when the data creating the steps changes.
