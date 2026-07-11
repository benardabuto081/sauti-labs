# Corpus Registry

Tracks the bibliographic provenance of every written-text source used
across the Sauti Labs platform: books, government documents, academic
publications, newspapers, and community contributions, per the Master
Blueprint's Language Corpus Platform (Pillar III).

## Relationship to `dataset-framework`

This framework is narrower and bibliographic. `dataset-framework`
tracks processed, ready-to-use datasets across all modalities (speech,
text, lexicon) with quality scores and benchmark results.
`corpus-registry` tracks the raw source material a text dataset was
derived from — who published it, when, and under what copyright
status — before it becomes a dataset entry.

A single corpus source can produce one or more datasets, tracked via
`linked_dataset_ids` in each source entry.

## Contents

    corpus-registry/
    ├── schema/
    │   └── corpus-source.schema.json   Formal schema every source must satisfy
    └── registry/
        └── sources.json                 Central list of all corpus sources

## Copyright Discipline

Every source's `copyright_status` must be explicitly set. Sources with
unresolved copyright status must use `"unknown_pending_review"` and
must not be used to derive datasets until resolved. Per the AI CTO
Constitution, uncertainty must never be hidden or assumed away.

## How to Register a New Source

1. Add a new entry to the `sources` array in `registry/sources.json`,
   following `schema/corpus-source.schema.json`.
2. Set `copyright_status` accurately — never assume permission.
3. Once a dataset is derived from this source, record the resulting
   `dataset_id` in this entry's `linked_dataset_ids`, and reference
   this `source_id` back in the dataset's own metadata.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
tracks source provenance structure, never language-specific content.
