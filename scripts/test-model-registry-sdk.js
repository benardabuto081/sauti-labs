/**
 * Smoke test for the model-registry SDK.
 *
 * Exercises registerModel, getModelsByLanguage, and
 * getLinkedBenchmarkResults against the real registries, then cleans
 * up the test entries it created.
 */

const fs = require('fs');
const path = require('path');
const { registerModel, getModelsByLanguage, getLinkedBenchmarkResults } = require('../frameworks/model-registry/sdk');
const { recordResult } = require('../frameworks/benchmark-framework/sdk');

const MODEL_REGISTRY = path.join(__dirname, '..', 'frameworks/model-registry/registry/models.json');
const BENCHMARK_REGISTRY = path.join(__dirname, '..', 'frameworks/benchmark-framework/registry/benchmark-results.json');

const TEST_MODEL_ID = 'test-sdk-smoke-model-DELETE-ME';
const TEST_BENCHMARK_ID = 'test-sdk-smoke-model-benchmark-DELETE-ME';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

function cleanup() {
  const modelRegistry = JSON.parse(fs.readFileSync(MODEL_REGISTRY, 'utf8'));
  modelRegistry.models = modelRegistry.models.filter((m) => m.model_id !== TEST_MODEL_ID);
  fs.writeFileSync(MODEL_REGISTRY, JSON.stringify(modelRegistry, null, 2) + '\n', 'utf8');

  const benchmarkRegistry = JSON.parse(fs.readFileSync(BENCHMARK_REGISTRY, 'utf8'));
  benchmarkRegistry.benchmark_results = benchmarkRegistry.benchmark_results.filter(
    (r) => r.benchmark_id !== TEST_BENCHMARK_ID
  );
  fs.writeFileSync(BENCHMARK_REGISTRY, JSON.stringify(benchmarkRegistry, null, 2) + '\n', 'utf8');

  console.log('Cleanup complete: test entries removed from both registries.');
}

try {
  console.log('Test 1: registerModel() with valid data');
  const model = registerModel({
    model_id: TEST_MODEL_ID,
    name: 'Test Smoke Model',
    model_family: 'speech',
    purpose: 'speech_recognition',
    supported_languages: ['sw', 'luo'],
    architecture: 'Conformer',
    version: '0.0.1',
    deployment_status: 'research'
  });
  assert(model.model_id === TEST_MODEL_ID, 'registered model has correct model_id');

  console.log('Test 2: registerModel() rejects duplicate model_id');
  let duplicateRejected = false;
  try {
    registerModel({
      model_id: TEST_MODEL_ID,
      name: 'Test Smoke Model',
      model_family: 'speech',
      purpose: 'speech_recognition',
      supported_languages: ['sw'],
      architecture: 'Conformer',
      version: '0.0.1',
      deployment_status: 'research'
    });
  } catch (err) {
    duplicateRejected = true;
  }
  assert(duplicateRejected, 'duplicate model_id correctly rejected');

  console.log('Test 3: getModelsByLanguage() finds the model for both its languages');
  const swModels = getModelsByLanguage('sw');
  const luoModels = getModelsByLanguage('luo');
  assert(swModels.some((m) => m.model_id === TEST_MODEL_ID), 'test model found under sw');
  assert(luoModels.some((m) => m.model_id === TEST_MODEL_ID), 'test model found under luo');

  console.log('Test 4: getModelsByLanguage() returns empty array for a language with no models');
  const noneModels = getModelsByLanguage('zz-nonexistent');
  assert(Array.isArray(noneModels) && noneModels.length === 0, 'nonexistent language returns empty array');

  console.log('Test 5: getLinkedBenchmarkResults() finds a real cross-referenced result');
  recordResult({
    benchmark_id: TEST_BENCHMARK_ID,
    benchmark_suite: 'test-suite-smoke',
    model_id: TEST_MODEL_ID,
    language: 'sw',
    metric_name: 'WER',
    metric_value: 10.0,
    lower_is_better: true,
    run_date: '2026-07-19',
    status: 'completed'
  });
  const linked = getLinkedBenchmarkResults(TEST_MODEL_ID);
  assert(linked.length === 1, 'exactly 1 benchmark result linked to test model');
  assert(linked[0].benchmark_id === TEST_BENCHMARK_ID, 'linked result has correct benchmark_id');

  console.log('Test 6: getLinkedBenchmarkResults() throws for nonexistent model');
  let nonexistentRejected = false;
  try {
    getLinkedBenchmarkResults('this-model-does-not-exist');
  } catch (err) {
    nonexistentRejected = true;
  }
  assert(nonexistentRejected, 'nonexistent model_id correctly throws');

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