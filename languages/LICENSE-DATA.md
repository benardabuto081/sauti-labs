# Data & Content Licensing Boundary

This document explains the licensing status of everything under
`languages/` (and, as the platform grows, any future non-code content
directories). It exists specifically to answer the question:

> "What can I freely reuse under the repository's Apache 2.0 license,
> and what must I check separately?"

## The Short Answer

**Nothing under `languages/` is covered by this repository's root
Apache License, Version 2.0.** Code, schemas, SDKs, and technical
documentation are Apache 2.0 (see `/LICENSE` and `/NOTICE`). Actual
language content - text corpora, speech recordings, lexicons,
benchmarks - is not.

## Why

Sauti Labs does not author most of the raw linguistic content it
collects. Storing a third-party file inside this Git repository does
not transfer ownership of that content to Sauti Labs, and does not
relicense it under Apache 2.0. Per the Master Blueprint's Manifesto
principle ("Open Where It Benefits Everyone"), we are open about our
infrastructure while respecting the actual terms every individual
source was published under.

## Where to Find the Real License for Any Given File

Every piece of language content in this repository is traceable
through the registry frameworks built specifically for this purpose:

- **Text corpus content**: check the corresponding entry in
  `frameworks/corpus-registry/registry/sources.json` - specifically
  its `copyright_status` and `license_details` fields.
- **Speech content**: check the corresponding entry in
  `frameworks/speech-registry/registry/sources.json`.
- **Individual files**: many downloaded corpus files (e.g. everything
  under `languages/*/corpus/raw/`) additionally carry their own
  embedded attribution and license line directly in the file itself
  (e.g. `* License: [CC-BY]`, `* Text: [author]`) - this is the most
  granular, authoritative source of truth for that specific file.

**If a source's `copyright_status` is `"unknown_pending_review"`, that
content must not be used for any purpose until the status is formally
resolved.** This is not a formality - see
`frameworks/dataset-framework/registry/datasets.json` and the Dholuo
Bible source in `corpus-registry` for a real, currently-pending
example of this rule being enforced.

## Current Real Examples in This Repository

- `languages/kiswahili/corpus/raw/` (110 files) and
  `languages/dholuo/corpus/raw/` (6 files): African Storybook Project
  content, CC-BY licensed per-story. See the corresponding
  `corpus-registry` entries for full attribution details.
- `languages/kiswahili/corpus/raw/excluded-cc-by-nc/` (15 files):
  the SAME source, but individually licensed CC-BY-NC
  (non-commercial) rather than CC-BY. These are deliberately excluded
  from the production dataset (see `docs/Enhancements.md`, M2.13) and
  preserved here only for provenance. **Do not use these files for
  any commercial purpose or any purpose beyond what CC-BY-NC permits.**

## Future Content

As Sauti Labs acquires speech recordings, builds lexicons, or trains
models, every new asset must be registered with an explicit,
honestly-set `copyright_status` (for text/speech sources) before any
use, per the existing Copyright Discipline rules in `corpus-registry`
and `speech-registry`. Trained model weights and other genuinely
proprietary future assets will be licensed separately and explicitly,
on a per-asset basis - never assumed to be Apache 2.0 by default.

Every new language program created via
`frameworks/language-program-framework`'s
`createLanguageProgram()` automatically receives a copy of this
boundary notice in its own directory, so this expectation travels
with the platform as it scales to new languages.

## Related Documents

- `/LICENSE` - the Apache License, Version 2.0 full text, and its scope
- `/NOTICE` - a concise summary of what is and isn't covered
- `docs/architecture/ADR-0003.md` - the architectural decision record
  explaining why this split-license structure was chosen