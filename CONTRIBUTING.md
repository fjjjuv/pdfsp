# Contributing to PDFSP

PDFSP is a specification, not a codebase. Contributions are spec
changes: clarifications, new ops, edge-case rules, examples.

## How to propose a change

1. Open an issue describing the problem (what is ambiguous or missing).
2. For non-trivial changes, propose the diff in the issue first.
3. Pull requests must update `SPEC.md`, bump the version header if the
   change is breaking, and keep `examples/` valid.

## Rules

- Keep the spec engine-agnostic: no implementation-specific fields in
  the core format (extensions MUST be namespaced `x_*`).
- Every MUST/SHOULD follows RFC 2119 semantics.
- Examples must be valid patch documents per §2.

Author: fjjjuv — https://github.com/fjjjuv
