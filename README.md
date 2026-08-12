# Sauti Labs

**Building Africa's Speech and Language Intelligence Infrastructure**

Sauti Labs is a research and infrastructure company building the foundational
technologies that allow machines to understand, generate, translate, and
communicate naturally across African languages.

This is not an application. This is infrastructure - the foundation upon
which speech and language products across Africa will be built for decades.

## Architecture

Sauti Labs is organized around a framework-first architecture per
`docs/architecture/ADR-0001.md`: seven core frameworks
(`language-program-framework`, `dataset-framework`, `corpus-registry`,
`model-registry`, `benchmark-framework`, `annotation-framework`,
`api-framework`) plus `speaker-registry` and `speech-registry`
(per `docs/architecture/ADR-0002.md`), each with a schema, a registry,
an SDK, and tests.

Full architectural detail lives in `docs/Architecture.md`.

## Repository Structure

    sauti-labs/
    |-- frameworks/     Reusable infrastructure (schema + registry + SDK per framework)
    |-- languages/       Individual language programs (Kiswahili, Dholuo, ...)
    |-- docs/            Architecture, ADRs, operational documentation
    |-- scripts/         Automation, tooling, developer scripts
    `-- .github/         CI/CD workflows

## Status

**Phase:** 2 - Intelligence Foundations

All 8 registry-style frameworks are at full SDK maturity: schema,
registry, SDK, tests, and CI enforcement. Two real language programs
(Kiswahili, Dholuo) have real, licensed corpus data.

## License

Sauti Labs uses a split licensing architecture. The infrastructure and
code layer (`frameworks/`, `scripts/`, `.github/`, `docs/`) is
licensed under the Apache License, Version 2.0 - see `LICENSE`.

Third-party datasets, corpora, and speech content under `languages/`
retain their own original licenses and are NOT covered by the Apache
License. See `NOTICE` and `languages/LICENSE-DATA.md` for the full
explanation, and `docs/architecture/ADR-0003.md` for the reasoning
behind this split.