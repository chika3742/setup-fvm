# setup-fvm

This action does:
- Install FVM
- Install Flutter SDK and dependencies in pubspec (running `fvm use`)
- Cache Flutter SDK and Pub packages

## Usage

```YAML
# ...
jobs:
  foo:
    # ...
    steps:
      - uses: actions/checkout@v4

      - uses: chika3742/setup-fvm@master
```

## Inputs

### `working-directory`

**Optional** The working directory where the Flutter project is located. Default is `.`.
