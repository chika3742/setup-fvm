# setup-fvm

Set up Flutter SDK using [FVM](https://fvm.app) and cache them. In detail, this action performs the following tasks:

- Installs FVM
- Installs Flutter SDK and run `fvm flutter pub get --enforce-lockfile`
- Caches the Flutter SDK and Pub packages (can be disabled)

Even if the job using this action fails, the cache will always be saved as long as this action itself succeeds.

## Usage

```YAML
# ...
jobs:
  foo:
    # ...
    steps:
      - uses: actions/checkout@v6

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
