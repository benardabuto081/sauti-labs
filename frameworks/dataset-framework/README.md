# Dataset Framework

Defines the required metadata structure and central registry for every
dataset in the Sauti Labs platform. Per the Master Blueprint, data is
treated as infrastructure, not a by-product — this framework is what
makes that principle enforceable rather than aspirational.

This directly implements Layer 3 of the Sauti Codex. Traceability is
mandatory: every dataset must record its origin, language, license,
version, quality metrics, and collection methodology.

## Contents

    dataset-framework/
    ├── schema/
    │   └── dataset.schema.json   Formal schema every dataset must satisfy
    └── registry/
        └── datasets.json          Central list of all datasets platform-wide

## How to Register a New Dataset

1. Add a new entry to the `datasets` array in
   `registry/datasets.json`, following `schema/dataset.schema.json`.
2. Reference the dataset's `dataset_id` in the owning language
   program's `language.meta.json` under its `datasets` array (see
   `frameworks/language-program-framework/`).
3. Validate the registry against the schema before committing (see
   Validation below).
4. Place the actual raw data files in the relevant language program's
   `corpus/`, `speech/`, or `lexicon/` folder — this framework tracks
   metadata, not the raw files themselves (see `.gitignore`, which
   excludes raw audio and processed data from Git).

## Validation

From the repository root:

    ajv validate -s frameworks/dataset-framework/schema/dataset.schema.json -d frameworks/dataset-framework/registry/datasets.json

Note: `datasets.json` wraps entries in a `datasets` array with a
`$comment` field, so full-registry validation against the per-dataset
schema requires validating each entry individually rather than the
registry file as a whole. This will be automated in a future milestone
once the registry has real entries.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
describes data shape and provenance, never language-specific
assumptions. Language-specific data belongs inside `languages/*/`.
