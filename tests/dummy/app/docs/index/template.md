# ember-steps

[![CI](https://github.com/alexlafroscia/ember-steps/workflows/CI/badge.svg)](https://github.com/alexlafroscia/ember-steps/actions?query=workflow%3ACI)

> Declaratively create wizards, tabs, or any interface with sections of the page that should be shown one-at-a-time

## Installation

```bash
ember install ember-steps
```

## Basic Usage

Using `ember-steps` starts with creating a `<StepManager>`.

```handlebars
<StepManager as |w|>
  We'll put some cool stuff in here in a moment
</StepManager>
```

Cool, right?  Ehh, it doesn't do much yet -- we need to add some steps.

```handlebars
<StepManager as |w|>
  <w.step @name="a">
    This is the first step!
  </w.step>

  <w.step @name="b">
    This is the second step!
  </w.step>
</StepManager>
```

As you may have guessed, the first `w.step` component, `a`, will be visible initially, and `b` will be invisible.  Note that these names are important.  Why?  Because we need a way to transition between them!

```handlebars
<StepManager as |w|>
  <w.step @name="a">
    This is the first step!

    <button {{on "click" (fn w.transition-to "b")}}>
      Next, please!
    </button>
  </w.step>

  <w.step @name="b">
    This is the second step!

    <button {{on "click" (fn w.transition-to "a")}}>
      Wait, go back!
    </button>
  </w.step>
</StepManager>
```

The `<StepManager>` provides a [closure action][ember-closure-actions] that can be called with the name of a step to show that one, instead.  One of the neat features of `ember-steps` is that there is no explicit order to the steps; show all of them, or only some. It's entirely up to you.

## Not-So-Basic Usage

The above examples show the basic idea, but there's more configuration (and power) available if you need it.  Head over to {{docs-link 'the cookbook' 'docs.cookbook'}} to read more about what `ember-steps` can do!

## Compatibility Note

Ember `2.12` is the earliest version that the tests are run against. YMMV with older versions of Ember.

[ember-closure-actions]: https://guides.emberjs.com/v3.0.0/templates/actions/
[hash-helper]: http://emberjs.com/blog/2016/01/15/ember-2-3-released.html#toc_hash-helper
