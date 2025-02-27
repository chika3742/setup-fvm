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
        uses: chika3742/setup-fvm@v2
        with:
          fvmrc-path: .fvmrc
          project-dir: .
          cache: true
```

## Inputs

### `fvmrc-path`

**Optional** Path to `.fvmrc` file. Defaults to `.fvmrc`.

### `project-dir`

**Optional** Path to the Flutter project root directory. Defaults to `.`.

### `cache`

**Optional** Cache Flutter SDK and Pub packages. Defaults to `true`.
