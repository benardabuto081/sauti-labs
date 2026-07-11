# API Framework

Tracks every API endpoint exposed by the Sauti Labs platform, per the
Master Blueprint's Developer Platform (Pillar V) and Codex Layer 5.
This is the last of the seven core frameworks, and structurally
different from the others: instead of tracking raw content (languages,
datasets, models, benchmarks, annotations), it tracks how that content
becomes a capability developers can actually call.

## Relationship to Other Frameworks

- **model-registry** — every endpoint references the `model_ids` it
  is backed by.
- **language-program-framework** — every endpoint declares which
  languages it supports.

This framework sits at the top of the dependency chain described in
`docs/Architecture.md`: Products depend on the Developer Platform,
which depends on Foundation Models, which depend on Data
Infrastructure, which depends on African Languages. An endpoint must
never expose a model that doesn't exist in `model-registry`.

## Contents

    api-framework/
    ├── schema/
    │   └── api-endpoint.schema.json   Formal schema every endpoint must satisfy
    └── registry/
        └── endpoints.json              Central list of all API endpoints

## Status Discipline

An endpoint's `status` must reflect reality. `"generally_available"`
means external developers can rely on it; `"planned"` or
`"internal_alpha"` endpoints must never be documented publicly as
production-ready. This directly serves the Constitution's restriction
against producing misleading confidence.

## How to Register a New Endpoint

1. Confirm every `model_id` referenced already exists in
   `model-registry`.
2. Add a new entry to `endpoints` in `registry/endpoints.json`,
   following `schema/api-endpoint.schema.json`.
3. Set `authentication` and `rate_limit` before marking status beyond
   `"planned"` — an endpoint without access control defined is not
   ready for even internal alpha use.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
describes API surface structure, never language-specific request or
response content itself — that belongs in each endpoint's own API
documentation once implemented.
