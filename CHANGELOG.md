# Changelog

## v0.0.3

- `core`: `open` → `from`, `save` → `to`.
- `core`: `image#encode` now only needs output format.
- `core`: image format automatic detection.
- `core`: better support of streams, new `Pipeline#stream` function.
- `net`: express middleware, #29.
- `net`: caching system, #30.
- `cli`: support pipes.

## v0.0.2

- `test`: refactored and enhanced existing tests, #22.
- `core`: fixed crop bugs, #22.
- `core`: better error handling, #23.
- `core`: refactored hook system, #25.
- `core`: new `Pipeline` event facility, #27.
- `arch`: off-load test fixtures to a npm dependency.
- `docs`: added more docs for the node module.

## v0.0.1

- `arch`: switched to **OpenCV**, #13.
- `core`: implemented basic operations, #7, #8, #11.
