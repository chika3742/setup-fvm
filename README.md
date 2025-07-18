# setup-fvm

This action performs the following tasks:

- Installs FVM
- Installs the Flutter SDK and pubspec dependencies (by running `fvm use`)
- Caches the Flutter SDK and Pub packages (can be disabled)

Even if the job using this action fails, the cache will always be saved as long as this action itself succeeds.

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

      - run: fvm flutter --version
```

## Inputs

### `project-dir`

**Optional** Path to the Flutter project root directory. Defaults to `.`.

### `cache`

**Optional** Cache Flutter SDK and Pub packages. Defaults to `true`.
