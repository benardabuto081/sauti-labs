# Speech Registry

Governs speech sources, individual recordings, acquisition methods,
and technical audio metadata across the Sauti Labs platform, per
ADR-0002 and the Master Blueprint's Speech Data Platform (Pillar III).

## Relationship to Other Frameworks

- **speaker-registry** - a recording may reference a pseudonymous
  `speaker_id`. Per ADR-0002, recordings linked to a speaker whose
  consent status is `unknown_pending_review` or `withdrawn` must not
  be used to derive a dataset - check `speaker-registry`'s
  `canUseForPurpose()` before using any recording with a speaker_id.
- **corpus-registry** - the written-text sibling of this framework.
- **dataset-framework** - every processed speech dataset references
  back to the speech sources and recordings it was derived from.

## Two-Tier Structure

    speech-registry/
    |-- schema/
    |   |-- speech-source.schema.json      One acquisition origin (e.g. a radio archive)
    |   `-- speech-recording.schema.json   One individual audio clip derived from a source
    |-- registry/
    |   |-- sources.json                    Central list of all speech sources
    |   `-- recordings.json                 Central list of all individual recordings
    `-- sdk/
        `-- index.js                         Programmatic interface: registerSource, registerRecording, getRecordingsBySource

## Using the SDK

Rather than hand-editing registry JSON directly, use the SDK:

    const { registerSource, registerRecording, getRecordingsBySource } = require('./frameworks/speech-registry/sdk');

    registerSource({
      source_id: 'kiswahili-common-voice-v1',
      title: 'Common Voice Scripted Speech 26.0 - Swahili',
      languages: ['sw'],
      collection_method: 'public_dataset',
      copyright_status: 'licensed',
      status: 'available'
    });

    registerRecording({
      recording_id: 'kiswahili-common-voice-v1-clip-0001',
      source_id: 'kiswahili-common-voice-v1',
      language: 'sw',
      duration_seconds: 4.2,
      sample_rate_hz: 48000,
      audio_format: 'mp3',
      status: 'acquired'
      // speaker_id omitted: Common Voice contributors are anonymous
    });

    getRecordingsBySource('kiswahili-common-voice-v1');
    // => all recordings registered under this source

### Cross-Referencing Is Enforced, Not Just Documented

`registerRecording()` will throw if:

- The referenced `source_id` does not exist in this framework's own
  source registry.
- A `speaker_id` is given but does not exist in `speaker-registry`.

On success, it also automatically appends the new `recording_id` to
the source's `linked_recording_ids` - this cross-reference no longer
needs to be maintained by hand.

`speaker_id` is optional on a recording precisely because many real
sources (anonymous broadcast archives, crowdsourced datasets like
Common Voice) have no identifiable speaker at all - per ADR-0002, we
never fabricate a speaker profile just to fill the field.

## Copyright and Consent Discipline

Identical to `corpus-registry`'s Copyright Discipline for sources.
For recordings with a `speaker_id`, always call
`speaker-registry`'s `canUseForPurpose(speakerId, purpose)` before
using the recording for any specific purpose - registration alone
does not imply permission to use.

## Technical vs. Human Quality

`speech-recording.schema.json`'s `technical_quality_score` is an
automated, objective measure, intentionally separate from
`annotation-framework`'s human-reviewed `quality_score` on datasets.

## Testing

Run the SDK smoke tests directly at any time:

    node scripts/test-speech-registry-sdk.js

This creates a real test source, a real test speaker (via
speaker-registry's own SDK), and a real recording cross-referencing
both, verifies rejection of recordings referencing nonexistent
sources or speakers, verifies auto-linking works, then removes every
test entry across all three affected registries. This same test runs
automatically in CI on every push.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. Per
ADR-0002, it must never store personally identifying information
directly - identity is always mediated through speaker-registry's
pseudonymous references.