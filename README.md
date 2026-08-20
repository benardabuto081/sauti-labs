# Sauti Labs

**Building Africa's Speech and Language Intelligence Infrastructure**

[![CI](https://github.com/benardabuto081/sauti-labs/actions/workflows/ci.yml/badge.svg)](https://github.com/benardabuto081/sauti-labs/actions/workflows/ci.yml)

Sauti Labs is a research and infrastructure company building the foundational
technologies that allow machines to understand, generate, translate, and
communicate naturally across African languages.

This is not an application. This is infrastructure - the foundation upon
which speech and language products across Africa will be built for decades.

## Strategy

**Multilingual by destination. Language-first by execution.**

Rather than developing many languages shallowly in parallel, Sauti Labs takes
one language to genuine depth - data discovery, corpus development, speech
acquisition, annotation, benchmarking, and a working baseline model - before
moving to the next. **Dholuo is Language 1.** Kiswahili's existing real
corpus (110 text documents, 100 speech clips) is preserved as a valuable
parallel asset and the foundation for Language 2.

## What's Actually Built (not aspirational)

- **8 core frameworks**, each at full maturity: JSON Schema, a central
  registry, a tested SDK, and CI enforcement on every push.
  `language-program-framework`, `dataset-framework`, `corpus-registry`,
  `speech-registry`, `speaker-registry`, `model-registry`,
  `benchmark-framework`, `annotation-framework`, `api-framework`.
- **Real, licensed language data** for two languages, with full provenance
  tracked through the registries above.
- **A split licensing architecture** (Apache 2.0 for infrastructure,
  preserved original licenses for third-party data) - see `LICENSE`,
  `NOTICE`, and `languages/LICENSE-DATA.md`.
- **An active Dholuo Resource Census** investigating the real Dholuo data
  ecosystem across academic corpora, open-licensed audio, and broadcast
  archives - see `docs/Enhancements.md` for findings as they emerge.

## Architecture

Framework-first per `docs/architecture/ADR-0001.md`. Privacy-by-architecture
for speaker/speech data per `docs/architecture/ADR-0002.md`. Split licensing
per `docs/architecture/ADR-0003.md`.

Full architectural detail lives in `docs/Architecture.md`.

## Repository Structure

    sauti-labs/
    |-- frameworks/     Reusable infrastructure (schema + registry + SDK per framework)
    |-- languages/       Individual language programs (Dholuo, Kiswahili)
    |-- docs/            Architecture, ADRs, operational documentation
    |-- scripts/         Automation, tooling, developer scripts
    `-- .github/         CI/CD workflows

## Getting Started

    npm install
    npm run validate:registries        # validates every real registry entry against its schema
    node scripts/validate-licensing.js # validates the licensing architecture is intact

Each framework also has its own SDK smoke tests, e.g.
`node scripts/test-speech-registry-sdk.js`. All of the above run
automatically in CI on every push - see `.github/workflows/ci.yml`.

## Documentation

| Document | Purpose |
|---|---|
| `docs/Architecture.md` | System architecture overview |
| `docs/Development.md` | Environment setup, conventions |
| `docs/Contributing.md` | Contribution rules and licensing expectations |
| `docs/Enhancements.md` | Tracked technical debt and research findings |
| `docs/architecture/ADR-*.md` | Architectural Decision Records |
| `languages/LICENSE-DATA.md` | Data licensing boundary explanation |

## License

Sauti Labs uses a split licensing architecture. The infrastructure and
code layer (`frameworks/`, `scripts/`, `.github/`, `docs/`) is
licensed under the Apache License, Version 2.0 - see `LICENSE`.

Third-party datasets, corpora, and speech content under `languages/`
retain their own original licenses and are NOT covered by the Apache
License. See `NOTICE` and `languages/LICENSE-DATA.md` for the full
explanation, and `docs/architecture/ADR-0003.md` for the reasoning
behind this split.