# setup-fvm

This action does:
- Install FVM
- Install Flutter SDK and dependencies in pubspec (running `fvm use`)
- Cache Flutter SDK and Pub packages

## Inputs

### `working-directory`

**Optional** The working directory where the Flutter project is located. Default is `.`.
