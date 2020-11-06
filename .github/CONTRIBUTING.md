# Contribution Guidelines

## Installation

- `git clone <repository-url>`
- `cd my-addon`
- `npm install`

## Linting

- `npm run lint:hbs`
- `npm run lint:js`
- `npm run lint:js -- --fix`

## Running tests

- `ember test` – Runs the test suite on the current Ember version
- `ember test --server` – Runs the test suite in "watch mode"
- `ember try:each` – Runs the test suite against multiple Ember versions

## Running the dummy application

- `ember serve`
- Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

## Committing

This project uses [conventional commits][conventional-commits] to help generate changelogs and handle versioning based on the changed made. Please read that document to understand the format. The high-level points are that:

- Commits names should be prefixed with one of:
  - `feat:` for new features that do not break old functionality
  - `fix:` for bug fixes or cleanup work
  - `chore:` for basic project maintenance
- Breaking changes should include the words `BREAKING CHANGE:` in the commit body

Additionally, make sure commit in small, logical chunks. If the entire pull request is for a single change, please squash all commits together. If there are multiple changes, please split them out into logical groupings with the appropriate commit format.

[conventional-commits]: https://conventionalcommits.org/
