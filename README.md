# ember-steps

[![Build Status](https://travis-ci.org/alexlafroscia/ember-steps.svg?branch=master)](https://travis-ci.org/alexlafroscia/ember-steps)

> Declaratively create wizards, tabs, or any interface with sections of the page that should be shown one-at-a-time

## Installation

```bash
ember install ember-steps
```

## Basic Usage

Using `ember-steps` starts with creating a `step-manager`.

```handlebars
{{#step-manager as |w|}}
  We'll put some cool stuff in here in a moment
{{/step-manager}}
```

Cool, right? Ehh, it doesn't do much yet -- we need to add some steps.

```handlebars
{{#step-manager as |w|}}
  {{#w.step name='a'}}
    This is the first step!
  {{/w.step}}

  {{#w.step name='b'}}
    This is the second step!
  {{/w.step}}
{{/step-manager}}
```

As you may have guessed, the first `w.step` component, `a`, will be visible initially, and `b` will be invisible. Note that these names are important. Why? Because we need a way to transition between them!

```handlebars
{{#step-manager as |w|}}
  {{#w.step name='a'}}
    This is the first step!

    <button {{action w.transition-to 'b'}}>
      Next, please!
    </button>
  {{/w.step}}

  {{#w.step name='b'}}
    This is the second step!

    <button {{action w.transition-to 'a'}}>
      Wait, go back!
    </button>
  {{/w.step}}
{{/step-manager}}
```

The `step-manager` provides a [closure action][ember-closure-actions] that can be called with the name of a step to show that one, instead. One of the neat features of `ember-steps` is that there is no explicit order to the steps; show all of them, or only some. It's entirely up to you.

## Not-So-Basic Usage

The above examples show the basic idea, but there's more configuration (and power) available if you need it. Head over to [the cookbook][cookbook] to read more about what `ember-steps` can do!

## Compatibility Note

The following table can help determine which verison of `ember-steps` work with specific Ember versions

| `ember` Version                           | `ember-steps` Version |
| :---------------------------------------- | :-------------------- |
| `3.6` (or `3.4`+ with polyfill) to latest | `v8.0.0` or later     |
| `3.4` to `3.6`                            | `v7.0.0` or later     |
| `3.3` to `2.16`                           | `v6.1.3`              |
| `2.12` or earlier                         | `v4.0.0`              |

[ember-closure-actions]: https://guides.emberjs.com/v3.17.0/components/component-state-and-actions/
[cookbook]: https://alexlafroscia.github.io/ember-steps/docs/cookbook
[hash-helper]: http://emberjs.com/blog/2016/01/15/ember-2-3-released.html#toc_hash-helper
