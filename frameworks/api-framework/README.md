# API Framework

Tracks every API endpoint exposed by the Sauti Labs platform, per the
Master Blueprint's Developer Platform (Pillar V) and Codex Layer 5.
This is the last of the seven core frameworks, and structurally
different from the others: instead of tracking raw content (languages,
datasets, models, benchmarks, annotations), it tracks how that content
becomes a capability developers can actually call.

## Relationship to Other Frameworks

- **model-registry** - every endpoint references the `model_ids` it
  is backed by. `registerEndpoint()` will refuse to register an
  endpoint that references a model_id that does not actually exist.
- **language-program-framework** - every endpoint declares which
  languages it supports.

This framework sits at the top of the dependency chain described in
`docs/Architecture.md`: Products depend on the Developer Platform,
which depends on Foundation Models, which depend on Data
Infrastructure, which depends on African Languages. An endpoint must
never expose a model that doesn't exist in `model-registry`.

## Contents

    api-framework/
    |-- schema/
    |   `-- api-endpoint.schema.json   Formal schema every endpoint must satisfy
    |-- registry/
    |   `-- endpoints.json              Central list of all API endpoints
    `-- sdk/
        `-- index.js                    Programmatic interface: registerEndpoint, getEndpointsByModel

## Using the SDK

Rather than hand-editing registry JSON directly, use the SDK:

    const { registerEndpoint, getEndpointsByModel } = require('./frameworks/api-framework/sdk');

    registerEndpoint({
      endpoint_id: 'kiswahili-asr-streaming-v1',
      name: 'Kiswahili Streaming ASR',
      purpose: 'Real-time Kiswahili speech-to-text transcription.',
      http_method: 'WEBSOCKET',
      path: '/v1/speech/sw/transcribe',
      model_ids: ['kiswahili-asr-conformer-v1'],
      supported_languages: ['sw'],
      authentication: 'api_key',
      status: 'planned'
    });

    getEndpointsByModel('kiswahili-asr-conformer-v1');
    // => every endpoint that exposes this model

### The Model-Existence Guard Is Enforced, Not Just Documented

`registerEndpoint()` checks every `model_id` in `model_ids` against
`model-registry`'s actual registered models before allowing
registration. An endpoint claiming to expose a model that doesn't
exist is refused outright - this prevents a real, dangerous class of
inconsistency where documentation describes a capability that isn't
actually backed by anything.

## Status Discipline

An endpoint's `status` must reflect reality. `"generally_available"`
means external developers can rely on it; `"planned"` or
`"internal_alpha"` endpoints must never be documented publicly as
production-ready. This directly serves the Constitution's restriction
against producing misleading confidence.

## How to Register a New Endpoint

1. Confirm every `model_id` referenced already exists in
   `model-registry` - or just call `registerEndpoint()` and let it
   verify this for you; it will throw a clear error listing exactly
   which model_ids are missing if any are not found.
2. Use `registerEndpoint()` from the SDK rather than hand-editing
   `registry/endpoints.json` directly.
3. Set `authentication` and `rate_limit` before marking status beyond
   `"planned"` - an endpoint without access control defined is not
   ready for even internal alpha use.

## Testing

Run the SDK smoke tests directly at any time:

    node scripts/test-api-framework-sdk.js

This verifies the model-existence guard correctly rejects an endpoint
referencing a nonexistent model, then registers a real test model
through model-registry's own SDK and confirms the endpoint registers
successfully once the model is real, then removes both test entries.
This same test runs automatically in CI on every push.

## Dependency Rule

Per ADR-0001, this framework must remain language-agnostic. It
describes API surface structure, never language-specific request or
response content itself - that belongs in each endpoint's own API
documentation once implemented.