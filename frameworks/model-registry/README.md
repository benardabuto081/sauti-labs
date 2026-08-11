# Model Registry

Tracks every model across the Sauti Labs platform: speech, language,
voice, audio, and multimodal models, per the Master Blueprint's
Pillar IV. This directly implements Layer 4 of the Sauti Codex.

## Contents

    model-registry/
    |-- schema/
    |   `-- model.schema.json   Formal schema every model must satisfy
    |-- registry/
    |   `-- models.json          Central list of all models platform-wide
    `-- sdk/
        `-- index.js             Programmatic interface: registerModel, getModelsByLanguage, getLinkedBenchmarkResults

## Model Families

Per Pillar IV, every model belongs to exactly one family:

- **speech** - recognition, diarization, speaker verification, enhancement
- **language** - LLMs, translation, semantic search, QA
- **voice** - text-to-speech, voice cloning, voice conversion
- **audio** - noise reduction, classification, source separation
- **multimodal** - speech+vision, speech+documents, and similar combinations

## Using the SDK

Rather than hand-editing registry JSON directly, use the SDK:

    const { registerModel, getModelsByLanguage, getLinkedBenchmarkResults } = require('./frameworks/model-registry/sdk');

    registerModel({
      model_id: 'kiswahili-asr-conformer-v1',
      name: 'Kiswahili ASR Conformer v1',
      model_family: 'speech',
      purpose: 'speech_recognition',
      supported_languages: ['sw'],
      architecture: 'Conformer',
      version: '1.0.0',
      deployment_status: 'research'
    });

    getModelsByLanguage('sw');
    // => all registered models supporting Kiswahili

    getLinkedBenchmarkResults('kiswahili-asr-conformer-v1');
    // => all benchmark-framework results recorded against this model_id

`getLinkedBenchmarkResults` cross-references benchmark-framework's own
registry directly rather than duplicating benchmark data inside
model-registry, keeping each framework the single source of truth for
its own domain.

## How to Register a New Model

1. Use `registerModel()` from the SDK rather than hand-editing
   `registry/models.json` directly - it validates against the schema
   and rejects duplicate `model_id` values before anything is written
   to disk.
2. Reference every `training_dataset_ids` entry against an existing
   `dataset-framework` registry entry - never a dataset that doesn't
   exist yet.
3. Reference this model's `model_id` back in the owning language
   program's `language.meta.json` under its `models` array.
4. Set `deployment_status` honestly. A model is not `"production"`
   simply because training finished - it must be evaluated and staged
   first.

## Testing

Run the SDK smoke tests directly at any time:

    node scripts/test-model-registry-sdk.js

This creates a real test model and a real cross-referenced benchmark
result through both SDKs, verifies the linkage works correctly, then
removes both test entries, leaving the real registries untouched. This
same test runs automatically in CI on every push.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
describes model metadata structure, never the model weights or
language-specific training code themselves - those belong in
dedicated model repositories (see `docs/architecture/ADR-0001.md`
and the top-level `github.com/sauti-labs` organization structure).