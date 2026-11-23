# PDFSP — PDF Scene Patch

**Portable, verifiable JSON format for mutating a PDF scene graph.**
The PDF equivalent of JSON Patch (RFC 6902): a patch describes *what to
change*, not *how to change it*.

- **Spec:** [SPEC.md](SPEC.md) — version 1.0 (Working Draft)
- **License:** [Apache-2.0](LICENSE) — implementations are free, including commercial
- **Reference implementation:** [pdfbadger](https://github.com/fjjjuv/pdfbadger)
- **Author:** [fjjjuv](https://github.com/fjjjuv)

## Why

Today's PDF tooling answers "ok" to mutations. A PDFSP patch can be:

- applied by any conforming engine;
- **replayed** on a related document (template batch editing);
- **rebased** onto a newer revision;
- **inverted** for rollback (every op class has a canonical inverse).

It addresses elements by **semantic selectors** (`page[2]`,
`table[0].row[1].cell[0]`, `text:'invoice #42'`), not coordinates, and
supports contracts (`only_touch`), post-conditions (`verify`), typed
issues, and atomic or best-effort application.

## Related specifications

| Spec | Repo | Relation |
|---|---|---|
| DTP — Document Transaction Protocol | [fjjjuv/pdfdtp](https://github.com/fjjjuv/pdfdtp) | Carries PDFSP ops inside transactions (`ops` field, SPEC §3) |
| PDFAD — PDF Agent Descriptor | [fjjjuv/pdfad](https://github.com/fjjjuv/pdfad) | Declares the `id_scheme` engines use for element ids (SPEC §5) |

**Compatibility:** PDFSP/1.0 is the op vocabulary consumed by DTP/1.0
and the id scheme referenced by PDFAD/1.0. Engines implementing
PDFSP/1.0 can apply any patch carried by a DTP/1.0 request.

## Example

See [`examples/replace-text.pdfpatch`](examples/replace-text.pdfpatch) —
a minimal patch with contract and verification.

## Contributing

Spec changes: see [CONTRIBUTING.md](CONTRIBUTING.md). Issues and pull
requests welcome.
