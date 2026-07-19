# Annotation Framework

Tracks every annotation task and its actual annotated content across
the Sauti Labs platform: human annotation, AI-assisted annotation, and
consensus validation, per the Master Blueprint's Annotation Platform
(Pillar III). Raw collected data is not usable for training until it
passes through this process — this framework makes that process
auditable rather than invisible.

## Two-Tier Structure

Tasks and records are tracked separately, mirroring the pattern used
in `speech-registry` for sources vs. recordings:

    annotation-framework/
    ├── schema/
    │   ├── annotation-task.schema.json     Task-level metadata: who, when, overall status/quality
    │   └── annotation-record.schema.json   Individual annotated content items belonging to a task
    ├── registry/
    │   ├── tasks.json                       Central list of all annotation tasks
    │   └── records.json                     Central list of all individual annotation records
    └── sdk/
        └── index.js                         Programmatic interface: createTask, addRecord, validateTask

A task describes the work (who is annotating what, using which method,
at what quality). A record is one actual piece of annotated content
(one corrected sentence, one translation pair, one labeled span) that
belongs to a task. This split exists because a single task typically
produces many records, and each record's content shape varies by
`annotation_type` in ways that don't belong in task-level metadata.

## Using the SDK

Rather than hand-editing registry JSON directly, use the SDK:

    const { createTask, addRecord, validateTask } = require('./frameworks/annotation-framework/sdk');

    createTask({
      task_id: 'kiswahili-storybook-review-batch-01',
      dataset_id: 'kiswahili-storybook-text-v1',
      annotation_type: 'consensus_validation',
      method: 'human_annotation',
      status: 'in_progress',
      quality_score: 0
    });

    addRecord({
      record_id: 'kiswahili-storybook-0001-review',
      task_id: 'kiswahili-storybook-review-batch-01',
      source_ref: 'languages/kiswahili/corpus/raw/0001_mwanamume-mrefu.md',
      annotation_type: 'consensus_validation',
      content: { reviewed: true, language_confirmed: 'sw' },
      status: 'accepted'
    });

    validateTask('kiswahili-storybook-review-batch-01');
    // => { taskId, found: true, valid: true, recordCount: 1, ... }

The SDK validates every write against the relevant schema and rejects
duplicate IDs and orphaned references (a record pointing to a
nonexistent task) before anything is saved to disk.

## Quality Discipline

Every task requires a `quality_score`. Tasks involving multiple
annotators should record `inter_annotator_agreement` where possible.
A task with `status: "validated"` but no meaningful quality score is
incomplete documentation, not a completed task.

`annotator_id` on individual records must be pseudonymous or
role-based (e.g. `'founder-review'`), never a real name — consistent
with the privacy-by-architecture pattern established in
`speaker-registry` (ADR-0002).

## Testing

Run the SDK smoke tests directly at any time:

    node scripts/test-annotation-sdk.js

This creates real test task/record entries through the SDK, validates
them, then removes them, leaving the real registries untouched. This
same test runs automatically in CI on every push.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
describes annotation process and content structure, never
language-specific annotation guidelines themselves — those belong
inside each language program's own documentation.
