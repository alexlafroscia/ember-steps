# Contribution Guidelines

## Committing

This project uses [conventional commits][conventional-commits] to help generate changelogs and handle versioning based on the changed made. Please read that document to understand the format. The high-level points are that:

- Commits names should be prefixed with one of:
  - `feat:` for new features that do not break old functionality
  - `fix:` for bug fixes or cleanup work
  - `chore:` for basic project maintenance
- Breaking changes should include the words `BREAKING CHANGE:` in the commit body

Additionally, make sure commit in small, logical chunks. If the entire pull request is for a single change, please squash all commits together. If there are multiple changes, please split them out into logical groupings with the appropriate commit format.

## Testing

It is expected that pull requests will pass a TypeScript build and the existing test suite. New features or significant changes should include new tests.

Currently, tests are run against Ember `2.16` through the active `beta`, plus FastBoot.

[conventional-commits]: https://conventionalcommits.org/
