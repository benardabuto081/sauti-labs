/**
 * Model Registry SDK
 *
 * Provides a programmatic interface for registering models and
 * querying them by language, and for cross-referencing a model to
 * benchmark results recorded via benchmark-framework's SDK.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const PATHS = {
  modelSchema: path.join(REPO_ROOT, 'frameworks/model-registry/schema/model.schema.json'),
  modelRegistry: path.join(REPO_ROOT, 'frameworks/model-registry/registry/models.json')
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
 * Registers a new model and appends it to the registry. Throws if
 * the model fails schema validation or if model_id already exists.
 */
function registerModel(modelData) {
  const { valid, errors } = validateAgainst(PATHS.modelSchema, modelData);
  if (!valid) {
    throw new Error(`Invalid model data: ${JSON.stringify(errors, null, 2)}`);
  }

  const registry = loadJson(PATHS.modelRegistry);
  if (registry.models.some((m) => m.model_id === modelData.model_id)) {
    throw new Error(`Model with model_id '${modelData.model_id}' already exists.`);
  }

  registry.models.push(modelData);
  saveJson(PATHS.modelRegistry, registry);
  return modelData;
}

/**
 * Returns all models supporting a given language (ISO code).
 */
function getModelsByLanguage(languageCode) {
  const registry = loadJson(PATHS.modelRegistry);
  return registry.models.filter(
    (m) => Array.isArray(m.supported_languages) && m.supported_languages.includes(languageCode)
  );
}

/**
 * Returns all benchmark-framework results whose model_id matches the
 * given model. Throws if the model does not exist in model-registry.
 */
function getLinkedBenchmarkResults(modelId) {
  const registry = loadJson(PATHS.modelRegistry);
  const model = registry.models.find((m) => m.model_id === modelId);
  if (!model) {
    throw new Error(`Model with model_id '${modelId}' does not exist.`);
  }

  const benchmarkRegistryPath = path.join(
    REPO_ROOT,
    'frameworks/benchmark-framework/registry/benchmark-results.json'
  );
  const benchmarkRegistry = loadJson(benchmarkRegistryPath);
  return benchmarkRegistry.benchmark_results.filter((r) => r.model_id === modelId);
}

module.exports = { registerModel, getModelsByLanguage, getLinkedBenchmarkResults };