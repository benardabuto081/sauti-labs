/**
 * Speaker Registry SDK
 *
 * Provides a programmatic interface for registering pseudonymous
 * speaker profiles and, critically, for checking whether a speaker's
 * structured consent actually permits a given use - enforcing
 * ADR-0002's consent discipline in code, not just in documentation.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const PATHS = {
  speakerSchema: path.join(REPO_ROOT, 'frameworks/speaker-registry/schema/speaker.schema.json'),
  speakerRegistry: path.join(REPO_ROOT, 'frameworks/speaker-registry/registry/speakers.json')
};

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const compiledValidators = new Map();

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function validateAgainst(schemaPath, data) {
  let validate = compiledValidators.get(schemaPath);
  if (!validate) {
    const schema = loadJson(schemaPath);
    validate = ajv.compile(schema);
    compiledValidators.set(schemaPath, validate);
  }
  const valid = validate(data);
  return { valid, errors: valid ? [] : validate.errors };
}

/**
 * Registers a new pseudonymous speaker and appends it to the
 * registry. Throws if the speaker fails schema validation (which
 * includes the speaker_id pattern check and additionalProperties:
 * false PII guard) or if speaker_id already exists.
 */
function registerSpeaker(speakerData) {
  const { valid, errors } = validateAgainst(PATHS.speakerSchema, speakerData);
  if (!valid) {
    throw new Error(`Invalid speaker data: ${JSON.stringify(errors, null, 2)}`);
  }

  const registry = loadJson(PATHS.speakerRegistry);
  if (registry.speakers.some((s) => s.speaker_id === speakerData.speaker_id)) {
    throw new Error(`Speaker with speaker_id '${speakerData.speaker_id}' already exists.`);
  }

  registry.speakers.push(speakerData);
  saveJson(PATHS.speakerRegistry, registry);
  return speakerData;
}

/**
 * Checks whether a speaker's structured consent actually permits a
 * given use (e.g. 'research', 'model_training', 'redistribution',
 * 'commercial_use'), per ADR-0002's Consent Discipline.
 *
 * Returns false (never throws) if the speaker does not exist, if
 * consent.status is not 'obtained' or 'implied_public_broadcast', or
 * if the requested purpose is not in consent.scope. This is
 * deliberately conservative: any uncertainty defaults to false, never
 * to assumed permission.
 */
function canUseForPurpose(speakerId, purpose) {
  const registry = loadJson(PATHS.speakerRegistry);
  const speaker = registry.speakers.find((s) => s.speaker_id === speakerId);

  if (!speaker) {
    return false;
  }

  const permittedStatuses = ['obtained', 'implied_public_broadcast'];
  if (!permittedStatuses.includes(speaker.consent.status)) {
    return false;
  }

  if (!Array.isArray(speaker.consent.scope) || !speaker.consent.scope.includes(purpose)) {
    return false;
  }

  return true;
}

module.exports = { registerSpeaker, canUseForPurpose };