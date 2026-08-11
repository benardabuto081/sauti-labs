# Benchmark Framework

Records verified, repeatable evaluation runs for every model across
the Sauti Labs platform, per the Master Blueprint's Research pillar
and Codex Layer 8. This is distinct from a model's self-reported
`evaluation_metrics` field in `model-registry` - that field reflects
what was measured during training; this framework tracks independent,
dated benchmark runs that can be compared across models and over time.

## Relationship to Other Frameworks

- **model-registry** - every benchmark result references a `model_id`
  here.
- **dataset-framework** - a benchmark run may reference a `dataset_id`
  used as the evaluation set.
- **language-program-framework** - every result is tied to a specific
  language, enabling per-language performance tracking.

## Contents

    benchmark-framework/
    |-- schema/
    |   `-- benchmark-result.schema.json   Formal schema every result must satisfy
    |-- registry/
    |   `-- benchmark-results.json          Central list of all benchmark runs
    `-- sdk/
        `-- index.js                        Programmatic interface: recordResult, compareModels, getBestResult

## Using the SDK

Rather than hand-editing registry JSON directly, use the SDK:

    const { recordResult, compareModels, getBestResult } = require('./frameworks/benchmark-framework/sdk');

    recordResult({
      benchmark_id: 'kiswahili-asr-conformer-v1-fleurs-2026-07-19',
      benchmark_suite: 'FLEURS-sw',
      model_id: 'kiswahili-asr-conformer-v1',
      language: 'sw',
      metric_name: 'WER',
      metric_value: 12.4,
      lower_is_better: true,
      run_date: '2026-07-19',
      status: 'completed'
    });

    compareModels({ benchmarkSuite: 'FLEURS-sw', language: 'sw', metricName: 'WER' });
    // => results sorted best-to-worst, correctly ascending since WER is lower_is_better

    getBestResult({ benchmarkSuite: 'FLEURS-sw', language: 'sw', metricName: 'WER' });
    // => the single top-ranked result, or null if none exist

`compareModels` and `getBestResult` correctly respect each metric's
`lower_is_better` direction - WER and CER rank ascending (lowest
first), while BLEU, MOS, F1, and accuracy rank descending (highest
first). Comparing results without this logic would silently produce
misleading conclusions about which model is actually best.

## Metric Discipline

Every result must set `lower_is_better` explicitly. If multiple
results for the same `benchmark_suite` + `language` + `metric_name`
combination disagree on `lower_is_better`, `compareModels` throws
rather than guessing - this is treated as a data integrity error to
be fixed, not silently averaged over.

## How to Register a New Benchmark Result

1. Confirm the `model_id` already exists in `model-registry`.
2. Use `recordResult()` from the SDK rather than hand-editing
   `registry/benchmark-results.json` directly - it validates against
   the schema and rejects duplicate `benchmark_id` values before
   anything is written to disk.
3. Use `status: "invalidated"` rather than deleting a result if a
   run is later found to be flawed - per the AI CTO Constitution,
   integrity requires a visible record, not silent removal.

## Testing

Run the SDK smoke tests directly at any time:

    node scripts/test-benchmark-sdk.js

This creates real test results through the SDK (including both a
lower-is-better and a higher-is-better metric, to verify ranking logic
in both directions), validates the comparison output, then removes the
test entries, leaving the real registry untouched. This same test runs
automatically in CI on every push.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
describes evaluation result structure, never language-specific
benchmark content itself.