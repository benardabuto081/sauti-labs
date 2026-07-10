# Language Program Framework

Defines the required structure and metadata schema for every language
program in the Sauti Labs platform. This is the "cookie cutter" that
ensures every language — Kiswahili, Dholuo, Yoruba, or any future
addition — has an identical, predictable shape, even though their
linguistic content is entirely different.

This directly implements Layer 2 of the Sauti Codex.

## Contents

- `schema/language-program.schema.json` — The formal JSON Schema
  definition of what metadata every language program must provide.
- `template/` — A ready-to-copy skeleton for creating a new language
  program, matching the schema.

## Template Structure

    template/
    ├── language.meta.json   Metadata file conforming to the schema
    ├── corpus/              Text corpus resources
    ├── speech/              Speech/audio resources
    ├── lexicon/             Dictionaries, pronunciation resources
    └── benchmarks/          Evaluation results for this language

## How to Create a New Language Program

1. Copy the entire `template/` folder into `languages/<language-name>/`.
2. Fill in `language.meta.json` with real values, following
   `schema/language-program.schema.json`.
3. Remove the `.gitkeep` placeholder files as real content is added to
   each subfolder.
4. Register the new language program in the Sauti Codex (tracked
   separately, per `THE_SAUTI_CODEX`).

## Dependency Rule

Per ADR-0001, language programs depend on this framework — this
framework must never contain logic or assumptions specific to any
single language.
