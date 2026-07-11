# Annotation Framework

Tracks every annotation task across the Sauti Labs platform: human
annotation, AI-assisted annotation, and consensus validation, per the
Master Blueprint's Annotation Platform (Pillar III). Raw collected
data is not usable for training until it passes through this process
— this framework makes that process auditable rather than invisible.

## Relationship to Other Frameworks

- **dataset-framework** — every annotation task references the
  `dataset_id` it produces or improves.
- **corpus-registry** — annotation tasks working from raw text
  sources may reference a `source_id`.

## Contents

    annotation-framework/
    ├── schema/
    │   └── annotation-task.schema.json   Formal schema every task must satisfy
    └── registry/
        └── tasks.json                     Central list of all annotation tasks

## Quality Discipline

Every task requires a `quality_score`. Tasks involving multiple
annotators should record `inter_annotator_agreement` where possible.
A task with `status: "validated"` but no meaningful quality score is
incomplete documentation, not a completed task.

## How to Register a New Annotation Task

1. Confirm the target `dataset_id` exists in `dataset-framework`
   (or is being created alongside this task).
2. Add a new entry to `tasks` in `registry/tasks.json`, following
   `schema/annotation-task.schema.json`.
3. Update `status` as the task progresses — do not jump straight to
   `"validated"` without passing through review.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
describes annotation process structure, never language-specific
annotation guidelines themselves — those belong inside each language
program's own documentation.
