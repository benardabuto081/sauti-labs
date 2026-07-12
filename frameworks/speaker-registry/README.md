# Speaker Registry

Governs pseudonymous speaker profiles and structured consent metadata
across the Sauti Labs platform, per ADR-0002. This framework is
intentionally separate from `speech-registry` — speakers and
recordings have fundamentally different lifecycles, and conflating
them would violate the single-responsibility pattern used throughout
this platform.

## Privacy Is Architectural, Not a Policy

This framework's schema makes it structurally impossible to store
personally identifying information — there is no field for name,
contact details, exact location, date of birth, or photograph. This
is enforced by `"additionalProperties": false` in the schema itself,
not by contributor discipline.

**If you are tempted to add a field like `full_name`, `phone_number`,
`email`, `exact_location`, or `date_of_birth` to this schema, stop.**
Per ADR-0002, real-world operational identity management (signed
consent forms, payment records, contact details) belongs in a
separate, secure system entirely outside this repository — never in
Git history, ever.

## Contents

    speaker-registry/
    ├── schema/
    │   └── speaker.schema.json   Formal schema every speaker profile must satisfy
    └── registry/
        └── speakers.json          Central list of all pseudonymous speaker profiles

## Consent Discipline

Consent is a structured object, never a boolean. Every speaker record
must specify:

- `status` — e.g. `obtained`, `unknown_pending_review`
- `scope` — which uses are permitted (research, model training,
  redistribution, commercial use) — a speaker may consent to some and
  not others
- `consent_agreement_version` and `consent_date` once status is
  `obtained`

A recording in `speech-registry` linked to a speaker whose consent
status is `unknown_pending_review` or `withdrawn` must not be used to
derive a dataset — the same discipline already applied to
`corpus-registry`'s copyright status field.

## How to Register a New Speaker

1. Generate a new pseudonymous `speaker_id` (format: `spk-` followed
   by at least 8 alphanumeric characters).
2. Add a new entry to `speakers` in `registry/speakers.json`,
   following `schema/speaker.schema.json`.
3. Record only broad demographics — age as a range, location as a
   region, never anything more specific.
4. Set `consent.status` honestly. Do not default to `obtained` without
   verified evidence.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. Per
ADR-0002, it must remain incapable of storing personally identifying
information by construction, not by convention.
