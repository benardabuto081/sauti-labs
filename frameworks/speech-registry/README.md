# Speech Registry

Governs speech sources, individual recordings, acquisition methods,
and technical audio metadata across the Sauti Labs platform, per
ADR-0002 and the Master Blueprint's Speech Data Platform (Pillar III).

## Relationship to Other Frameworks

- **speaker-registry** — a recording may reference a pseudonymous
  `speaker_id`. Per ADR-0002, recordings linked to a speaker whose
  consent status is `unknown_pending_review` or `withdrawn` must not
  be used to derive a dataset.
- **corpus-registry** — the written-text sibling of this framework.
  Speech and text are governed separately because they have distinct
  metadata needs (audio format, sample rate, speaker consent vs.
  bibliographic provenance).
- **dataset-framework** — every processed speech dataset references
  back to the speech sources and recordings it was derived from.

## Two-Tier Structure

Unlike `corpus-registry`, speech has two schemas because one source
can yield thousands of individual recordings:

    speech-registry/
    ├── schema/
    │   ├── speech-source.schema.json      One acquisition origin (e.g. a radio archive)
    │   └── speech-recording.schema.json   One individual audio clip derived from a source
    └── registry/
        ├── sources.json                    Central list of all speech sources
        └── recordings.json                 Central list of all individual recordings

## Copyright Discipline

Identical to `corpus-registry`: every source's `copyright_status` must
be explicitly set. Sources with unresolved copyright must use
`"unknown_pending_review"` and must not be used to derive datasets
until formally cleared.

## Consent Discipline

Every recording that has an identifiable speaker must reference a
`speaker_id` from `speaker-registry`. Recordings with no known speaker
(e.g. anonymous broadcast archives, synthetic audio) may omit
`speaker_id` entirely. A recording must never contain any personally
identifying information directly — identity is always mediated through
the pseudonymous speaker registry.

## Technical vs. Human Quality

`speech-recording.schema.json`'s `technical_quality_score` is an
automated, objective measure (silence, clipping, signal-to-noise
ratio). It is intentionally separate from `annotation-framework`'s
human-reviewed `quality_score` on datasets — these measure different
things and must never be conflated or averaged together.

## How to Register a New Speech Source and Recordings

1. Add a source entry to `registry/sources.json`, following
   `schema/speech-source.schema.json`. Set `copyright_status`
   accurately.
2. For each individual audio file derived from that source, add a
   recording entry to `registry/recordings.json`, following
   `schema/speech-recording.schema.json`, referencing the source's
   `source_id`.
3. If the speaker is known and has consented, reference their
   `speaker_id` from `speaker-registry`. Register the speaker there
   first if they don't yet exist.
4. Update the source's `linked_recording_ids` and, once a dataset is
   derived, `linked_dataset_ids`.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. Per
ADR-0002, it must never store personally identifying information
directly — identity is always mediated through `speaker-registry`'s
pseudonymous references.
