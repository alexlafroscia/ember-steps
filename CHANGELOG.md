# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="9.0.0"></a>
# [9.0.0](https://github.com/alexlafroscia/ember-steps/compare/v9.0.0-beta.0...v9.0.0) (2019-06-19)


### Chores

* remove activation hooks ([aa2f10d](https://github.com/alexlafroscia/ember-steps/commit/aa2f10d)), closes [#120](https://github.com/alexlafroscia/ember-steps/issues/120) [#129](https://github.com/alexlafroscia/ember-steps/issues/129)


### Features

* one-way-bind the `currentStep` property ([72efb43](https://github.com/alexlafroscia/ember-steps/commit/72efb43))


### BREAKING CHANGES

* `onActivate` and `onDeactivate` should instead be called by `did-insert` or `will-destroy` on element inside the step definition.
* `currentStep` no longer updates the value passed in; it is a one-way bi7nding from
  the context down to the component. If you need to bind a value to the `currentStep`, you can use
  `onTransition` and the `mut` helper.

Co-authored-by: Lou Greenwood <lougreenwood@me.com>



<a name="9.0.0-beta.0"></a>
# [9.0.0-beta.0](https://github.com/alexlafroscia/ember-steps/compare/v8.0.2...v9.0.0-beta.0) (2019-05-10)


### Bug Fixes

* eslint ignore node_modules ([7c35d33](https://github.com/alexlafroscia/ember-steps/commit/7c35d33))
* fastboot testing ([cc8b36c](https://github.com/alexlafroscia/ember-steps/commit/cc8b36c))
* move `ember-decorators-polyfill` to `dependencies` ([7dc7857](https://github.com/alexlafroscia/ember-steps/commit/7dc7857))


### Code Refactoring

* remove TypeScript ([5652e28](https://github.com/alexlafroscia/ember-steps/commit/5652e28))


### BREAKING CHANGES

* Package no longer provides TypeScript definitions for
  components. This is unlikely to _actually_ be a breaking change for
  anyone, but it is better to err on the safe side.



<a name="8.0.2"></a>
## [8.0.2](https://github.com/alexlafroscia/ember-steps/compare/v8.0.1...v8.0.2) (2019-03-15)


### Bug Fixes

* avoid resetting the step manager on any attribute changes ([569991a](https://github.com/alexlafroscia/ember-steps/commit/569991a))



<a name="8.0.1"></a>

## [8.0.1](https://github.com/alexlafroscia/ember-steps/compare/v8.0.0...v8.0.1) (2019-02-28)

### Chores

* removes inheritance from EmberObject from StepNode ([c4f8e8](https://github.com/alexlafroscia/ember-steps/commit/c4f8e8))

<a name="8.0.0"></a>

# [8.0.0](https://github.com/alexlafroscia/ember-steps/compare/v7.0.0...v8.0.0) (2019-01-22)

### Chores

* **deps:** externalize `ember-native-class-polyfill` ([904cd97](https://github.com/alexlafroscia/ember-steps/commit/904cd97))

### BREAKING CHANGES

* **deps:** For Ember `3.4` and `3.5` compatibility, you _must_ install `ember-native-class-polyfill` in your application. This was previously brought in as a dependency, but should not be supplied by the host app.

<a name="7.0.0"></a>

# [7.0.0](https://github.com/alexlafroscia/ember-steps/compare/v6.1.3...v7.0.0) (2018-12-30)

### Chores

* **deps:** upgrade to `ember-cli-typescript@rc.1` ([0c919c4](https://github.com/alexlafroscia/ember-steps/commit/0c919c4))

### BREAKING CHANGES

* **deps:** Increased the minimum supported version of Ember to
  `3.4.0` to align with what native Classes are well-supported by at
  this time. This was necessary to fix a number of issues that arose
  with the upgraded version of `ember-cli-typescript`

<a name="6.1.3"></a>

## [6.1.3](https://github.com/alexlafroscia/ember-steps/compare/v6.1.2...v6.1.3) (2018-12-04)

<a name="6.1.2"></a>

## [6.1.2](https://github.com/alexlafroscia/ember-steps/compare/v6.1.1...v6.1.2) (2018-11-04)

### Bug Fixes

* add action hooks when current step property changes ([1ddda66](https://github.com/alexlafroscia/ember-steps/commit/1ddda66))
* add compatibility with Ember 3.6+ ([3523a4c](https://github.com/alexlafroscia/ember-steps/commit/3523a4c))

<a name="5.0.1"></a>

## [5.0.1](https://github.com/alexlafroscia/ember-steps/compare/v5.0.0...v5.0.1) (2018-04-21)

### Bug Fixes

* Allow string, name, or symbol step names ([2615f9e](https://github.com/alexlafroscia/ember-steps/commit/2615f9e)), closes [#103](https://github.com/alexlafroscia/ember-steps/issues/103)

<a name="5.0.0"></a>

# [5.0.0](https://github.com/alexlafroscia/ember-steps/compare/v5.0.0-beta.2...v5.0.0) (2018-04-19)

<a name="5.0.0-beta.2"></a>

# [5.0.0-beta.2](https://github.com/alexlafroscia/ember-steps/compare/v5.0.0-beta.1...v5.0.0-beta.2) (2018-04-18)

### Bug Fixes

* Fix TypeScript compilation errors ([c11bbb7](https://github.com/alexlafroscia/ember-steps/commit/c11bbb7))
* Simplify step addition/removal logic ([9535dfe](https://github.com/alexlafroscia/ember-steps/commit/9535dfe))

### Features

* Step manager now handles removal ([14f3e50](https://github.com/alexlafroscia/ember-steps/commit/14f3e50))

<a name="5.0.0-beta.1"></a>

# [5.0.0-beta.1](https://github.com/alexlafroscia/ember-steps/compare/v4.0.0...v5.0.0-beta.1) (2018-04-04)

### Features

* Rewritten in TypeScript ([a94e9a](https://github.com/alexlafroscia/ember-steps/commit/a94e9a))

### BREAKING CHANGES

* Drop support for Ember 2.12 ([191403](https://github.com/alexlafroscia/ember-steps/commit/191403))
