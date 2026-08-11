# Speaker Registry

Governs pseudonymous speaker profiles and structured consent metadata
across the Sauti Labs platform, per ADR-0002. This framework is
intentionally separate from `speech-registry` - speakers and
recordings have fundamentally different lifecycles, and conflating
them would violate the single-responsibility pattern used throughout
this platform.

## Privacy Is Architectural, Not a Policy

This framework's schema makes it structurally impossible to store
personally identifying information - there is no field for name,
contact details, exact location, date of birth, or photograph. This
is enforced by `"additionalProperties": false` in the schema itself,
not by contributor discipline.

**If you are tempted to add a field like `full_name`, `phone_number`,
`email`, `exact_location`, or `date_of_birth` to this schema, stop.**
Per ADR-0002, real-world operational identity management (signed
consent forms, payment records, contact details) belongs in a
separate, secure system entirely outside this repository - never in
Git history, ever.

## Contents

    speaker-registry/
    |-- schema/
    |   `-- speaker.schema.json   Formal schema every speaker profile must satisfy
    |-- registry/
    |   `-- speakers.json          Central list of all pseudonymous speaker profiles
    `-- sdk/
        `-- index.js                Programmatic interface: registerSpeaker, canUseForPurpose

## Using the SDK

Rather than hand-editing registry JSON directly, use the SDK:

    const { registerSpeaker, canUseForPurpose } = require('./frameworks/speaker-registry/sdk');

    registerSpeaker({
      speaker_id: 'spk-a1b2c3d4',
      languages: ['sw'],
      age_range: '25-34',
      consent: {
        status: 'obtained',
        scope: ['research', 'model_training'],
        consent_agreement_version: 'v1.0',
        consent_date: '2026-07-19'
      }
    });

    canUseForPurpose('spk-a1b2c3d4', 'research');
    // => true

    canUseForPurpose('spk-a1b2c3d4', 'commercial_use');
    // => false (not in this speaker's consent.scope)

### `canUseForPurpose` Is a Real Safety Gate

`canUseForPurpose(speakerId, purpose)` is not a simple lookup - it is
the code-level enforcement of ADR-0002's Consent Discipline. It
returns `false` (never throws) for every case where usage should be
denied:

- The speaker does not exist.
- `consent.status` is anything other than `'obtained'` or
  `'implied_public_broadcast'` (this includes `'withdrawn'` and
  `'unknown_pending_review'`).
- The requested `purpose` is not present in `consent.scope`, even if
  the speaker's overall status is otherwise permitted.

This function is deliberately conservative: any uncertainty defaults
to `false`, never to assumed permission. Any code elsewhere in the
platform that uses a speaker's recording for training, redistribution,
or any other purpose should call this function first and respect its
result.

## How to Register a New Speaker

1. Generate a new pseudonymous `speaker_id` (format: `spk-` followed
   by at least 8 alphanumeric characters).
2. Use `registerSpeaker()` from the SDK rather than hand-editing
   `registry/speakers.json` directly - it validates against the
   schema (including the PII guard) and rejects duplicate
   `speaker_id` values before anything is written to disk.
3. Record only broad demographics - age as a range, location as a
   region, never anything more specific.
4. Set `consent.status` honestly. Do not default to `obtained`
   without verified evidence.

## Testing

Run the SDK smoke tests directly at any time:

    node scripts/test-speaker-registry-sdk.js

This creates real test speakers covering consented, unresolved, and
withdrawn consent states, verifies `canUseForPurpose` correctly denies
use in every case it should (including the withdrawn-but-scope-listed
edge case), then removes the test entries, leaving the real registry
untouched. This same test runs automatically in CI on every push.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. Per
ADR-0002, it must remain incapable of storing personally identifying
information by construction, not by convention.