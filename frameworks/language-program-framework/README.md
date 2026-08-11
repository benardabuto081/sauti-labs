# Language Program Framework

Defines the required structure and metadata schema for every language
program in the Sauti Labs platform. This is the "cookie cutter" that
ensures every language - Kiswahili, Dholuo, Yoruba, or any future
addition - has an identical, predictable shape, even though their
linguistic content is entirely different.

This directly implements Layer 2 of the Sauti Codex.

## Contents

    language-program-framework/
    |-- schema/
    |   `-- language-program.schema.json   Formal schema every language program must satisfy
    |-- template/                           Ready-to-copy skeleton (used internally by the SDK)
    `-- sdk/
        `-- index.js                        Programmatic interface: createLanguageProgram, getLanguageSummary

## Using the SDK

Rather than manually copying the template folder, use the SDK:

    const { createLanguageProgram, getLanguageSummary } = require('./frameworks/language-program-framework/sdk');

    createLanguageProgram('yoruba', {
      language_name: 'Yoruba',
      iso_code: 'yo',
      status: 'planned',
      research_stage: 'not_started',
      language_family: 'Niger-Congo (Volta-Niger)',
      countries: ['Nigeria', 'Benin', 'Togo'],
      writing_system: 'Latin'
    });
    // => creates languages/yoruba/ with language.meta.json and
    //    corpus/, speech/, lexicon/, benchmarks/ subfolders, each
    //    with a .gitkeep placeholder

    getLanguageSummary('sw');
    // => { isoCode: 'sw', datasetCount: 1, datasetIds: [...],
    //      corpusSourceCount: 1, corpusSourceIds: [...],
    //      speechSourceCount: 0, speechRecordingCount: 0,
    //      modelCount: 0, modelIds: [], benchmarkResultCount: 0 }

### `getLanguageSummary` Is a Working Codex Query

`getLanguageSummary(isoCode)` is a real implementation of the pattern
described in `THE_SAUTI_CODEX` - "what datasets does Dholuo have?" is
no longer a rhetorical question the Codex document poses, it is a
function call that returns a real, live answer by querying every
other framework's registry: `dataset-framework`, `corpus-registry`,
`speech-registry` (both sources and recordings), `model-registry`, and
`benchmark-framework`. Every count reflects the actual registry state
at the moment of calling - nothing cached, nothing assumed.

## How to Create a New Language Program

1. Use `createLanguageProgram(dirName, languageData)` from the SDK
   rather than manually copying `template/` - it validates the
   metadata against the schema and creates the full directory
   structure (including all four standard subfolders with
   `.gitkeep` placeholders) in one call.
2. Fill in real, accurate values - see ADR-0001's context on why
   linguistic accuracy in this metadata matters (Kiswahili's and
   Dholuo's dialect corrections in earlier milestones are a good
   reference for the level of care expected).
3. As real data accumulates, use `getLanguageSummary()` to verify the
   language program's registered footprint matches expectations.

## Testing

Run the SDK smoke tests directly at any time:

    node scripts/test-language-program-sdk.js

This creates a real temporary language program (verifying the full
directory structure is created correctly), confirms duplicate
directories are rejected, verifies `getLanguageSummary` returns
correct counts against **real, live Kiswahili production data**, and
verifies it returns all-zero counts for a language with no footprint
yet. The temporary language directory is removed afterward. This same
test runs automatically in CI on every push.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
describes language program structure, never assumptions about any
specific language.