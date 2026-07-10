# Sauti Labs — System Architecture

This document describes the current high-level architecture of the
Sauti Labs monorepo. It is a living document, maintained continuously
per the Sauti Codex principle: if something isn't documented here, it
effectively doesn't exist.

## Guiding Decision

See `docs/architecture/ADR-0001.md` for the decision to use a
framework-first architecture instead of a single-language-first
approach.

## Repository Layout

sauti-labs/
├── .github/           CI/CD workflows, issue templates, repo config
├── docs/              Architecture, ADRs, operational documentation
├── frameworks/        Reusable infrastructure shared by every language
│   ├── annotation-framework/       Human + AI-assisted data annotation
│   ├── api-framework/              Shared API layer (REST/streaming)
│   ├── benchmark-framework/        Evaluation and benchmarking harness
│   ├── corpus-registry/            Text corpus tracking and metadata
│   ├── dataset-framework/          Dataset versioning and validation
│   ├── language-program-framework/ Shared scaffolding for each language program
│   └── model-registry/             Model versioning, metadata, deployment status
├── languages/         Individual language programs (Kiswahili, Dholuo, etc.)
├── research/          Papers, experiments, open questions
└── scripts/           Automation, tooling, developer scripts

## Architectural Principles

Per the Engineering Roadmap's Engineering Doctrine, every component
must strengthen exactly one of six layers, and no layer may bypass the
one beneath it:

Products
^
Developer Platform
^
AI Infrastructure Layer
^
Foundation Models
^
Data Infrastructure
^
African Languages

Concretely, this means:

- A **language program** (`languages/kiswahili/`) depends on the
  frameworks, never the other way around.
- A **framework** (`frameworks/dataset-framework/`) must remain
  language-agnostic — it should work identically whether the language
  is Kiswahili or Zulu.
- No product-specific logic is permitted inside `frameworks/`.

## Current Status

**Phase:** 1 — Engineering Foundations
**Milestone:** M1.1 — Monorepo Skeleton

## Change Log

- 2026-07-10: Initial architecture established. Framework-first
  structure adopted (ADR-0001). Repository initialized.