/**
 * Smoke test for the api-framework SDK.
 *
 * Exercises registerEndpoint's cross-check against model-registry
 * (using a real model registered via model-registry's own SDK) and
 * getEndpointsByModel.
 */

const fs = require('fs');
const path = require('path');
const { registerEndpoint, getEndpointsByModel } = require('../frameworks/api-framework/sdk');
const { registerModel } = require('../frameworks/model-registry/sdk');

const ENDPOINT_REGISTRY = path.join(__dirname, '..', 'frameworks/api-framework/registry/endpoints.json');
const MODEL_REGISTRY = path.join(__dirname, '..', 'frameworks/model-registry/registry/models.json');

const TEST_MODEL_ID = 'test-sdk-smoke-api-model-DELETE-ME';
const TEST_ENDPOINT_ID = 'test-sdk-smoke-api-endpoint-DELETE-ME';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

function cleanup() {
  const endpointRegistry = JSON.parse(fs.readFileSync(ENDPOINT_REGISTRY, 'utf8'));
  endpointRegistry.endpoints = endpointRegistry.endpoints.filter((e) => e.endpoint_id !== TEST_ENDPOINT_ID);
  fs.writeFileSync(ENDPOINT_REGISTRY, JSON.stringify(endpointRegistry, null, 2) + '\n', 'utf8');

  const modelRegistry = JSON.parse(fs.readFileSync(MODEL_REGISTRY, 'utf8'));
  modelRegistry.models = modelRegistry.models.filter((m) => m.model_id !== TEST_MODEL_ID);
  fs.writeFileSync(MODEL_REGISTRY, JSON.stringify(modelRegistry, null, 2) + '\n', 'utf8');

  console.log('Cleanup complete: test entries removed from both registries.');
}

try {
  console.log('Test 1: registerEndpoint() rejects an endpoint referencing a nonexistent model_id');
  let missingModelRejected = false;
  try {
    registerEndpoint({
      endpoint_id: TEST_ENDPOINT_ID,
      name: 'Test Smoke Endpoint',
      purpose: 'Test endpoint for SDK smoke testing.',
      http_method: 'POST',
      path: '/v1/test/smoke',
      model_ids: ['this-model-does-not-exist'],
      authentication: 'api_key',
      status: 'planned'
    });
  } catch (err) {
    missingModelRejected = true;
  }
  assert(missingModelRejected, 'endpoint referencing nonexistent model_id correctly rejected');

  console.log('Test 2: registerModel() to set up a real model for the next test');
  registerModel({
    model_id: TEST_MODEL_ID,
    name: 'Test Smoke API Model',
    model_family: 'speech',
    purpose: 'speech_recognition',
    supported_languages: ['sw'],
    architecture: 'Conformer',
    version: '0.0.1',
    deployment_status: 'research'
  });
  console.log('  PASS: test model registered');

  console.log('Test 3: registerEndpoint() succeeds when model_id exists');
  registerEndpoint({
    endpoint_id: TEST_ENDPOINT_ID,
    name: 'Test Smoke Endpoint',
    purpose: 'Test endpoint for SDK smoke testing.',
    http_method: 'POST',
    path: '/v1/test/smoke',
    model_ids: [TEST_MODEL_ID],
    authentication: 'api_key',
    status: 'planned'
  });
  console.log('  PASS: endpoint registered without error');

  console.log('Test 4: registerEndpoint() rejects duplicate endpoint_id');
  let duplicateRejected = false;
  try {
    registerEndpoint({
      endpoint_id: TEST_ENDPOINT_ID,
      name: 'Test Smoke Endpoint',
      purpose: 'Test endpoint for SDK smoke testing.',
      http_method: 'POST',
      path: '/v1/test/smoke',
      model_ids: [TEST_MODEL_ID],
      authentication: 'api_key',
      status: 'planned'
    });
  } catch (err) {
    duplicateRejected = true;
  }
  assert(duplicateRejected, 'duplicate endpoint_id correctly rejected');

  console.log('Test 5: getEndpointsByModel() finds the endpoint');
  const found = getEndpointsByModel(TEST_MODEL_ID);
  assert(found.length === 1, 'exactly 1 endpoint found for test model');
  assert(found[0].endpoint_id === TEST_ENDPOINT_ID, 'found endpoint has correct endpoint_id');

  console.log('Test 6: getEndpointsByModel() returns empty array for a model with no endpoints');
  const none = getEndpointsByModel('some-other-model-with-no-endpoints');
  assert(Array.isArray(none) && none.length === 0, 'model with no endpoints returns empty array');

  console.log('');
  console.log('All SDK smoke tests passed.');
  cleanup();
  process.exit(0);
} catch (err) {
  console.error('');
  console.error('SDK TEST FAILED:', err.message);
  cleanup();
  process.exit(1);
}