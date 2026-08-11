/**
 * API Framework SDK
 *
 * Provides a programmatic interface for registering API endpoints,
 * cross-checking every referenced model_id against model-registry
 * before allowing registration - an endpoint claiming to expose a
 * model that does not exist would be a real, dangerous inconsistency,
 * not just a documentation gap.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const PATHS = {
  endpointSchema: path.join(REPO_ROOT, 'frameworks/api-framework/schema/api-endpoint.schema.json'),
  endpointRegistry: path.join(REPO_ROOT, 'frameworks/api-framework/registry/endpoints.json'),
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
 * Registers a new API endpoint and appends it to the registry.
 * Throws if the endpoint fails schema validation, if endpoint_id
 * already exists, or if any model_id in model_ids does not exist in
 * model-registry.
 */
function registerEndpoint(endpointData) {
  const { valid, errors } = validateAgainst(PATHS.endpointSchema, endpointData);
  if (!valid) {
    throw new Error(`Invalid API endpoint: ${JSON.stringify(errors, null, 2)}`);
  }

  const modelRegistry = loadJson(PATHS.modelRegistry);
  const existingModelIds = new Set(modelRegistry.models.map((m) => m.model_id));
  const missingModelIds = (endpointData.model_ids || []).filter((id) => !existingModelIds.has(id));
  if (missingModelIds.length > 0) {
    throw new Error(`Endpoint references model_ids that do not exist in model-registry: ${missingModelIds.join(', ')}`);
  }

  const registry = loadJson(PATHS.endpointRegistry);
  if (registry.endpoints.some((e) => e.endpoint_id === endpointData.endpoint_id)) {
    throw new Error(`Endpoint with endpoint_id '${endpointData.endpoint_id}' already exists.`);
  }

  registry.endpoints.push(endpointData);
  saveJson(PATHS.endpointRegistry, registry);
  return endpointData;
}

/**
 * Returns all registered endpoints that expose a given model_id.
 */
function getEndpointsByModel(modelId) {
  const registry = loadJson(PATHS.endpointRegistry);
  return registry.endpoints.filter((e) => Array.isArray(e.model_ids) && e.model_ids.includes(modelId));
}

module.exports = { registerEndpoint, getEndpointsByModel };