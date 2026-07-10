# Development Guide

This document explains how to work inside the Sauti Labs monorepo:
environment setup, conventions, and daily workflow expectations.

## Prerequisites

- **Git** — version control
- **PowerShell 7+** — required on Windows. Windows PowerShell 5.1 has a
  known UTF-8 rendering bug and must not be used for this project, since
  we work with non-ASCII text across dozens of African languages.
- Additional language-specific toolchains (Python, Node.js, etc.) will
  be documented here as each framework introduces them.

## File Encoding

All files in this repository must be saved as **UTF-8 without BOM**.
This is non-negotiable given the multilingual scope of the project.
VS Code is configured via `.vscode/settings.json` (added in a later
milestone) to enforce this automatically.

## Commit Conventions

Per the Project Operating System (SPOS), every commit follows:

type(scope): concise description

Examples:

feat(dataset): add annotation pipeline
fix(platform): resolve websocket timeout
docs(api): update authentication guide
refactor(models): simplify inference engine
chore(repo): update dependency versions

Common types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `ci`.

## Repository Structure

See `docs/Architecture.md` for the full directory layout and
architectural principles.

## Branching

- `main` — always stable, always working.
- Feature work happens on branches named `type/short-description`
  (e.g. `feat/dataset-registry-schema`).
- Branches are merged back into `main` only after verification.

## Working on a Framework

Each directory under `frameworks/` is a self-contained, language-agnostic
component. Before adding code to a framework, confirm:

1. The change does not embed logic specific to a single language.
2. The change does not duplicate functionality that belongs in another
   framework.
3. The change is documented (README within the framework directory,
   added in a later milestone).

## Working on a Language Program

Each directory under `languages/` represents one language (e.g.
`languages/kiswahili/`). Language programs depend on frameworks —
never the reverse. See ADR-0001 for the reasoning.

## Questions or Architectural Challenges

Per the AI CTO Constitution, all architectural decisions must be
technically defensible. If something in this repository doesn't make
sense, raise it — do not silently work around it.
