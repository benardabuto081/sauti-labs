# Model Registry

Tracks every model across the Sauti Labs platform: speech, language,
voice, audio, and multimodal models, per the Master Blueprint's
Pillar IV. This directly implements Layer 4 of the Sauti Codex.

## Contents

    model-registry/
    ├── schema/
    │   └── model.schema.json   Formal schema every model must satisfy
    └── registry/
        └── models.json          Central list of all models platform-wide

## Model Families

Per Pillar IV, every model belongs to exactly one family:

- **speech** — recognition, diarization, speaker verification, enhancement
- **language** — LLMs, translation, semantic search, QA
- **voice** — text-to-speech, voice cloning, voice conversion
- **audio** — noise reduction, classification, source separation
- **multimodal** — speech+vision, speech+documents, and similar combinations

## How to Register a New Model

1. Add a new entry to the `models` array in `registry/models.json`,
   following `schema/model.schema.json`.
2. Reference every `training_dataset_ids` entry against an existing
   `dataset-framework` registry entry — never a dataset that doesn't
   exist yet.
3. Reference this model's `model_id` back in the owning language
   program's `language.meta.json` under its `models` array.
4. Set `deployment_status` honestly. A model is not `"production"`
   simply because training finished — it must be evaluated and staged
   first.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
describes model metadata structure, never the model weights or
language-specific training code themselves — those belong in
dedicated model repositories (see `docs/architecture/ADR-0001.md`
and the top-level `github.com/sauti-labs` organization structure).
