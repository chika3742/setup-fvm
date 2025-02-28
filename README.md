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

      - name: Initialize Flutter SDK
        uses: chika3742/setup-fvm@v3
        with:
          project-dir: . # default
          cache: true # default
```

## Inputs

### `project-dir`

**Optional** Path to the Flutter project root directory. Defaults to `.`.

### `cache`

**Optional** Cache Flutter SDK and Pub packages. Defaults to `true`.
