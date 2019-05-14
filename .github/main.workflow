workflow "Build and Test" {
  on = "push"
  resolves = [
    "Lint Handlebars",
    "Lint JavaScript",
    "Ember Try: Minimum Supported Version",
    "Ember Try: Ember Release",
    "Ember Try: Fastboot Addon Tests",
  ]
}

action "Install Dependencies" {
  uses = "nuxt/actions-yarn@node-10"
  args = "install"
}

action "Lint Handlebars" {
  uses = "nuxt/actions-yarn@node-10"
  needs = ["Install Dependencies"]
  args = "lint:hbs"
}

action "Lint JavaScript" {
  uses = "nuxt/actions-yarn@node-10"
  needs = ["Install Dependencies"]
  args = "lint:js"
}

action "Run Tests" {
  uses = "alexlafroscia/actions-ember-testing@master"
  needs = ["Lint Handlebars", "Lint JavaScript"]
  args = "test"
}

action "Ember Try: Minimum Supported Version" {
  uses = "alexlafroscia/actions-ember-testing@master"
  needs = ["Run Tests"]
  args = "try:one minimum-supported-version"
}

action "Ember Try: Ember Release" {
  uses = "alexlafroscia/actions-ember-testing@master"
  needs = ["Run Tests"]
  args = "try:one ember-release"
}

action "Ember Try: Fastboot Addon Tests" {
  uses = "alexlafroscia/actions-ember-testing@master"
  needs = ["Run Tests"]
  args = "try:one fastboot-addon-tests"
}
