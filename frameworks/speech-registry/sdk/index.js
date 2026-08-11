/**
 * Speech Registry SDK
 *
 * Provides a programmatic interface for registering speech sources
 * and individual recordings, cross-checking recordings against both
 * their source and (if present) a real speaker-registry entry, and
 * auto-linking recordings back to their source.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const PATHS = {
  sourceSchema: path.join(REPO_ROOT, 'frameworks/speech-registry/schema/speech-source.schema.json'),
  sourceRegistry: path.join(REPO_ROOT, 'frameworks/speech-registry/registry/sources.json'),
  recordingSchema: path.join(REPO_ROOT, 'frameworks/speech-registry/schema/speech-recording.schema.json'),
  recordingRegistry: path.join(REPO_ROOT, 'frameworks/speech-registry/registry/recordings.json'),
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
 * Registers a new speech source and appends it to the registry.
 * Throws if the source fails schema validation or if source_id
 * already exists.
 */
function registerSource(sourceData) {
  const { valid, errors } = validateAgainst(PATHS.sourceSchema, sourceData);
  if (!valid) {
    throw new Error(`Invalid speech source: ${JSON.stringify(errors, null, 2)}`);
  }

  const registry = loadJson(PATHS.sourceRegistry);
  if (registry.sources.some((s) => s.source_id === sourceData.source_id)) {
    throw new Error(`Source with source_id '${sourceData.source_id}' already exists.`);
  }

  registry.sources.push(sourceData);
  saveJson(PATHS.sourceRegistry, registry);
  return sourceData;
}

/**
 * Registers a new speech recording. Throws if the recording fails
 * schema validation, if recording_id already exists, if the
 * referenced source_id does not exist in speech-registry, or if a
 * speaker_id is given but does not exist in speaker-registry.
 * On success, also appends recording_id to the source's
 * linked_recording_ids automatically.
 */
function registerRecording(recordingData) {
  const { valid, errors } = validateAgainst(PATHS.recordingSchema, recordingData);
  if (!valid) {
    throw new Error(`Invalid speech recording: ${JSON.stringify(errors, null, 2)}`);
  }

  const sourceRegistry = loadJson(PATHS.sourceRegistry);
  const source = sourceRegistry.sources.find((s) => s.source_id === recordingData.source_id);
  if (!source) {
    throw new Error(`Referenced source_id '${recordingData.source_id}' does not exist in speech-registry sources.`);
  }

  if (recordingData.speaker_id) {
    const speakerRegistry = loadJson(PATHS.speakerRegistry);
    const speakerExists = speakerRegistry.speakers.some((s) => s.speaker_id === recordingData.speaker_id);
    if (!speakerExists) {
      throw new Error(`Referenced speaker_id '${recordingData.speaker_id}' does not exist in speaker-registry.`);
    }
  }

  const recordingRegistry = loadJson(PATHS.recordingRegistry);
  if (recordingRegistry.recordings.some((r) => r.recording_id === recordingData.recording_id)) {
    throw new Error(`Recording with recording_id '${recordingData.recording_id}' already exists.`);
  }

  recordingRegistry.recordings.push(recordingData);
  saveJson(PATHS.recordingRegistry, recordingRegistry);

  if (!Array.isArray(source.linked_recording_ids)) {
    source.linked_recording_ids = [];
  }
  if (!source.linked_recording_ids.includes(recordingData.recording_id)) {
    source.linked_recording_ids.push(recordingData.recording_id);
  }
  saveJson(PATHS.sourceRegistry, sourceRegistry);

  return recordingData;
}

/**
 * Returns all recordings belonging to a given source_id.
 */
function getRecordingsBySource(sourceId) {
  const registry = loadJson(PATHS.recordingRegistry);
  return registry.recordings.filter((r) => r.source_id === sourceId);
}

module.exports = { registerSource, registerRecording, getRecordingsBySource };