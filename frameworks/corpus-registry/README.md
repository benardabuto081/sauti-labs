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
derived from - who published it, when, and under what copyright
status - before it becomes a dataset entry.

A single corpus source can produce one or more datasets, tracked via
`linked_dataset_ids` in each source entry.

## Contents

    corpus-registry/
    |-- schema/
    |   `-- corpus-source.schema.json   Formal schema every source must satisfy
    |-- registry/
    |   `-- sources.json                 Central list of all corpus sources
    `-- sdk/
        `-- index.js                     Programmatic interface: registerSource, linkDataset

## Using the SDK

Rather than hand-editing registry JSON directly, use the SDK:

    const { registerSource, linkDataset } = require('./frameworks/corpus-registry/sdk');

    registerSource({
      source_id: 'kiswahili-newspaper-taifa-leo-2020-2025',
      title: 'Taifa Leo archive 2020-2025',
      languages: ['sw'],
      source_type: 'newspaper',
      copyright_status: 'unknown_pending_review',
      status: 'identified'
    });

    linkDataset('kiswahili-newspaper-taifa-leo-2020-2025', 'kiswahili-news-text-v1');
    // => cross-references the source to a dataset-framework entry;
    //    safe to call multiple times, will not create duplicate links

`linkDataset` replaces the manual JSON cross-referencing done by hand
in earlier milestones (M2.10, M2.12) - it will not create duplicate
entries if called more than once for the same pair.

## Copyright Discipline

Every source's `copyright_status` must be explicitly set. Sources with
unresolved copyright status must use `"unknown_pending_review"` and
must not be used to derive datasets until resolved. Per the AI CTO
Constitution, uncertainty must never be hidden or assumed away.

## How to Register a New Source

1. Use `registerSource()` from the SDK rather than hand-editing
   `registry/sources.json` directly - it validates against the schema
   and rejects duplicate `source_id` values before anything is
   written to disk.
2. Set `copyright_status` accurately - never assume permission.
3. Once a dataset is derived from this source, call `linkDataset()`
   to cross-reference it, then reference this `source_id` back in the
   dataset's own metadata.

## Testing

Run the SDK smoke tests directly at any time:

    node scripts/test-corpus-registry-sdk.js

This creates a real test source through the SDK, links it to a test
dataset_id, verifies no duplicate links are created on repeat calls,
then removes the test entry, leaving the real registry untouched. This
same test runs automatically in CI on every push.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
tracks source provenance structure, never language-specific content.