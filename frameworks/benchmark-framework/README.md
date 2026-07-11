# Benchmark Framework

Records verified, repeatable evaluation runs for every model across
the Sauti Labs platform, per the Master Blueprint's Research pillar
and Codex Layer 8. This is distinct from a model's self-reported
`evaluation_metrics` field in `model-registry` — that field reflects
what was measured during training; this framework tracks independent,
dated benchmark runs that can be compared across models and over time.

## Relationship to Other Frameworks

- **model-registry** — every benchmark result references a `model_id`
  here.
- **dataset-framework** — a benchmark run may reference a `dataset_id`
  used as the evaluation set.
- **language-program-framework** — every result is tied to a specific
  language, enabling per-language performance tracking.

## Contents

    benchmark-framework/
    ├── schema/
    │   └── benchmark-result.schema.json   Formal schema every result must satisfy
    └── registry/
        └── benchmark-results.json          Central list of all benchmark runs

## Metric Discipline

Every result must set `lower_is_better` explicitly — WER and CER are
error rates (lower is better), while BLEU, MOS, F1, and accuracy are
quality scores (higher is better). Comparing results across the
registry without checking this field will produce misleading
conclusions.

## How to Register a New Benchmark Result

1. Confirm the `model_id` already exists in `model-registry`.
2. Add a new entry to `benchmark_results` in
   `registry/benchmark-results.json`, following
   `schema/benchmark-result.schema.json`.
3. Use `status: "invalidated"` rather than deleting a result if a
   run is later found to be flawed — per the AI CTO Constitution,
   integrity requires a visible record, not silent removal.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
describes evaluation result structure, never language-specific
benchmark content itself.
