/**
 * Corpus Registry SDK
 *
 * Provides a programmatic interface for registering text corpus
 * sources and linking them to datasets derived from them, replacing
 * the manual JSON editing used in earlier milestones (M2.10, M2.12).
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const PATHS = {
  sourceSchema: path.join(REPO_ROOT, 'frameworks/corpus-registry/schema/corpus-source.schema.json'),
  sourceRegistry: path.join(REPO_ROOT, 'frameworks/corpus-registry/registry/sources.json')
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
 * Registers a new corpus source and appends it to the registry.
 * Throws if the source fails schema validation or if source_id
 * already exists.
 */
function registerSource(sourceData) {
  const { valid, errors } = validateAgainst(PATHS.sourceSchema, sourceData);
  if (!valid) {
    throw new Error(`Invalid corpus source: ${JSON.stringify(errors, null, 2)}`);
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
 * Adds a dataset_id to an existing source's linked_dataset_ids array,
 * avoiding duplicates. Throws if the source does not exist. This is
 * the programmatic replacement for the manual cross-referencing done
 * by hand in M2.10 and M2.12.
 */
function linkDataset(sourceId, datasetId) {
  const registry = loadJson(PATHS.sourceRegistry);
  const source = registry.sources.find((s) => s.source_id === sourceId);
  if (!source) {
    throw new Error(`Source with source_id '${sourceId}' does not exist.`);
  }

  if (!Array.isArray(source.linked_dataset_ids)) {
    source.linked_dataset_ids = [];
  }
  if (!source.linked_dataset_ids.includes(datasetId)) {
    source.linked_dataset_ids.push(datasetId);
  }

  saveJson(PATHS.sourceRegistry, registry);
  return source;
}

module.exports = { registerSource, linkDataset };