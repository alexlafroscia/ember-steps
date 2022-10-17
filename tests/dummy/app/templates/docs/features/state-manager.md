# Cyclical Steps

By default, the `step-manager` creates a "one way" state machine, where the first step has no "previous" step, and the last step has no "next" step.

<Docs::Features::StateManager::Linear />

However, this can be overwritten to create a "cyclical" state machine, where the first step wraps back around to the last step, and the last step can go "backwards" to the first step.

<Docs::Features::StateManager::Cyclical />

Each step also yields whether it has a "next" and "previous" step.

<Docs::Features::StateManager::StepYielded />
