# Cyclical Steps

By default, the `step-manager` creates a "one way" state machine, where the first step has no "previous" step, and the last step has no "next" step.

{{docs/features/state-manager/linear}}

However, this can be overwritten to create a "cyclical" state machine, where the first step wraps back around to the last step, and the last step can go "backwards" to the first step.

{{docs/features/state-manager/cyclical}}

Each step also yields whether it has a "next" and "previous" step.

{{docs/features/state-manager/step-yielded}}
