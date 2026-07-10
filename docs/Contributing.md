# Contributing to Sauti Labs

This document defines the rules for contributing to this repository.
It applies to the Founder, future team members, and any external
contributors once the repository is opened up (see Engineering
Roadmap, Era IV — Ecosystem).

## Core Rule

Every contribution must strengthen the infrastructure. Per the Master
Blueprint's Blueprint Principle, before adding anything, ask:

> Does this strengthen Africa's Speech & Language Intelligence
> Infrastructure and expand the technological future of African
> languages?

If the answer is no, it does not belong here.

## Before You Contribute

1. Read `docs/Architecture.md` to understand where your change fits
   in the six-layer dependency chain.
2. Read `docs/architecture/ADR-0001.md` to understand the
   framework-first structure.
3. Confirm your change does not bypass a layer (e.g. a product must
   never contain logic that belongs in a framework or model).

## Code Standards

Every contribution must be:

- **Modular** — no monolithic files mixing unrelated responsibilities.
- **Documented** — public functions, modules, and APIs require
  docstrings or equivalent inline documentation.
- **Tested** — new logic requires corresponding tests. Untested code
  is considered incomplete, not merely risky.
- **UTF-8 without BOM** — mandatory for all text files, given the
  multilingual scope of this project.

## Commit Standards

Follow the commit convention defined in `docs/Development.md`:

    type(scope): concise description

## Pull Request Process

1. Create a branch named `type/short-description`.
2. Make focused, atomic commits — one logical change per commit.
3. Ensure the change is verified (tests pass, output confirmed) before
   requesting review.
4. Update relevant documentation in the same pull request as the code
   change. Documentation is never a follow-up task.

## Language Program Contributions

Contributions to `languages/*` must not introduce logic that
duplicates or forks functionality already provided by `frameworks/*`.
If a framework is missing a capability a language program needs, the
capability should be added to the framework, not worked around inside
the language program.

## What Will Be Rejected

- Code without documentation.
- Code without tests.
- Logic that bypasses the six-layer architecture.
- Hardcoded, language-specific assumptions inside shared frameworks.
- Files saved with incorrect encoding.

## Questions

Per the AI CTO Constitution, disagreement and technical challenge are
welcome and expected. If you believe a standard in this document is
wrong, raise it with evidence — do not silently ignore it.