# PDFSP — PDF Scene Patch

**Version 1.0 — 2026-11-22**
Author: fjjjuv — https://github.com/fjjjuv
Status: Stable
License: Apache License 2.0 — implementations are free.

---

## 1. Abstract

PDFSP defines a **portable, verifiable JSON format for describing mutations
of a PDF document's scene graph**. It is the PDF equivalent of JSON Patch
(RFC 6902): a patch describes *what to change*, not *how to change it*.

A PDFSP patch can be:

- applied to a PDF by any conforming engine;
- **replayed** on a different but related document (template batch editing);
- **rebased** onto a newer revision of the same document;
- inverted (every op MAY carry its inverse) for rollback.

The format is engine-agnostic.

## 2. Document format

```json
{
  "spec":    "PDFSP/1.0",
  "target":  "sha256:<hex>",              // optional: hash of the source file
  "base":    "blake3:<scene-root-hash>",  // optional: scene-graph base hash
  "ops":     [ <op>, ... ],
  "contract": {                           // optional: formal constraints
    "only_touch": ["e12", "e13"]
  },
  "verify": {                             // optional: post-conditions
    "expect": ["text A"],
    "absent": ["text B"]
  },
  "meta": {                               // optional provenance
    "author": "agent-name",
    "ts":     "2026-11-22T15:00:00Z"
  }
}
```

`spec` is REQUIRED. `ops` is REQUIRED and non-empty. Everything else is
OPTIONAL.

## 3. Targets (semantic addressing)

Every op addresses elements via a **selector**, not coordinates:

| Selector | Meaning |
|---|---|
| `"e12"` | element id (stable hash, see §5) |
| `"page[2]"` | whole page (0-based) |
| `"table[0].row[2].cell[1]"` | table element path |
| `"section['Résumé'].para[1]"` | named section path |
| `"text:'invoice #42'"` | first occurrence of a text search |
| `{"rect": [x0,y0,x1,y1], "page": 0}` | coordinate fallback |

Coordinate targets are legal but DISCOURAGED: they break on reflow.
Engines MUST resolve semantic targets before applying ops.

## 4. Operations

| op | required fields | semantics |
|---|---|---|
| `replace_text` | `target`, `text` | replace the text of the element |
| `set_textbox` | `target`, `text` | reflow-replace within the element's box |
| `delete` | `target` | remove the element from the scene |
| `insert` | `at`, `element` | insert a new element (position anchor) |
| `insert_text` | `page`, `x`, `y`, `text` | raw text insertion (legacy/simple ops) |
| `insert_image` | `page`, `rect`, `src` | image placement |
| `restyle` | `target`, `role` | re-style an element per document DNA |
| `move` | `target`, `to` | relocate element |
| `fill_field` | `label`, `text` | fill a form field or dotted-line field |

Engines MAY ignore unknown ops but MUST report them as issues
`{"kind": "unknown_op", "op": <name>}` — never fail silently.

## 5. Stable element ids

Element ids SHOULD be content-derived:

```
id = "e" + base36( sha1( normalized_pos | style_sig | text_sig ) )
```

Engines MUST define their id scheme in a `PDFAD` manifest when present.
Ids MUST be stable across save/reload of the *same* element.

## 6. Contracts

`contract.only_touch` lists element ids the patch is allowed to mutate.
An engine MUST abort (or report `contract_violation`) if applying the ops
would mutate a non-listed element.

## 7. Verification

After application, engines SHOULD evaluate `verify.expect`/`verify.absent`
against the resulting document and return a report:

```json
{"ok": true, "checks": [{"expect": "A", "ok": true}],
 "certificate": {"touched": ["e12"], "untouched_changed": []}}
```

## 8. Inversion

Every op class has a canonical inverse (e.g. `delete` ↔ re-insert,
`replace_text` ↔ `replace_text` with old text). A conforming engine
SHOULD return `inverse_ops` for any applied patch, enabling rollback
without snapshots.

## 9. Errors

Engine responses SHOULD carry typed issues:

`{kind, msg}` with `kind` in:
`bad_op | unknown_op | missing_fields | target_not_found |
contract_violation | op_error | stale_target | io_error`.

## 10. Portability

A `.pdfpatch` file (extension `.pdfpatch`, MIME `application/pdfsp+json`)
is a PDFSP document. Patches are portable across documents when element
ids match OR targets degrade to text/coordinate selectors.

## 11. Edge cases & semantics

### 11.1 Application order

Ops apply **sequentially in array order**, each op acting on the scene
produced by the previous ops. There is no implicit reordering,
parallelism, or sorting by kind. An engine MUST NOT reorder ops to
"help" the caller — a patch that relies on a different evaluation order
is malformed.

Consequence: an `insert` followed by a `restyle` MAY address the
inserted element only if the `insert` produced a resolvable target for
it. Selectors are resolved **per op at apply time**, never hoisted.

### 11.2 Invalid targets

A target that resolves to zero elements yields issue
`target_not_found` for that op. This is a **blocking** issue for the op,
not necessarily for the batch:

- default mode (**best-effort**): the op is skipped, remaining ops
  continue, and the response reports all issues;
- `meta.atomic: true` (**all-or-nothing**): the first blocking issue
  aborts the batch, the document is restored to its pre-apply state,
  and the response reports `applied: 0` plus the triggering issue.

Issue kinds are blocking if they mean "this op could not execute":
`bad_op | unknown_op | missing_fields | target_not_found |
contract_violation | op_error`. Kinds describing degraded-but-done
work (substituted font, painted background, `unsupported_content`)
are non-blocking: the op counts as applied.

### 11.3 Conflicting ops in one batch

Two ops addressing the same element are legal and resolve
sequentially (§11.1). The outcome MUST be deterministic:

- `replace_text` then `delete` on `e12` → element deleted, no issue;
- `delete` then any op on `e12` → the second op yields
  `target_not_found` (the element no longer exists);
- two `replace_text` on the same element → last writer wins.

Engines MUST NOT silently merge or drop conflicting ops.

### 11.4 Stale targets

Content-derived ids change when the element changes (§5). A patch
recorded against an older scene therefore legitimately yields
`target_not_found` on rebased application. Engines MAY emit
`stale_target` instead when they can prove the selector matched an
element in the recorded base scene but not the current one (e.g. via
`base:` hash comparison) — this is strictly more informative and
preferred when available.

### 11.5 `insert` anchors

`insert.at` is one of:

| form | semantics |
|---|---|
| `"e12"` | directly after element `e12` in reading order |
| `"before:e12"` | directly before element `e12` |
| `"page[2]"` | appended at the end of page 2's flow |
| `{"rect": [...], "page": n}` | anchored box (portable, reflow-fragile) |

An `insert` op MUST report its created element's new id in the
response (`created: ["e31"]`) so later ops and the caller can
reference it.

### 11.6 Empty effective batch

If every op is skipped (all targets unresolved or all unknown), a
conforming engine still returns a response with `applied: 0` and the
full issue list — an empty effective batch is a reportable outcome,
never an engine error.

---

*PDFSP is published under Apache-2.0 to maximize adoption. The name
"PDFSP" is claimed by fjjjuv.*
