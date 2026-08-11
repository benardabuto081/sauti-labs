/**
 * Smoke test for the corpus-registry SDK.
 *
 * Exercises registerSource and linkDataset against the real registry,
 * then cleans up the test entries it created.
 */

const fs = require('fs');
const path = require('path');
const { registerSource, linkDataset } = require('../frameworks/corpus-registry/sdk');

const SOURCE_REGISTRY = path.join(__dirname, '..', 'frameworks/corpus-registry/registry/sources.json');

const TEST_SOURCE_ID = 'test-sdk-smoke-source-DELETE-ME';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

function cleanup() {
  const registry = JSON.parse(fs.readFileSync(SOURCE_REGISTRY, 'utf8'));
  registry.sources = registry.sources.filter((s) => s.source_id !== TEST_SOURCE_ID);
  fs.writeFileSync(SOURCE_REGISTRY, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  console.log('Cleanup complete: test entry removed from registry.');
}

try {
  console.log('Test 1: registerSource() with valid data');
  const source = registerSource({
    source_id: TEST_SOURCE_ID,
    title: 'Test Smoke Source',
    languages: ['sw'],
    source_type: 'digital_content',
    copyright_status: 'licensed',
    status: 'identified',
    linked_dataset_ids: []
  });
  assert(source.source_id === TEST_SOURCE_ID, 'registered source has correct source_id');

  console.log('Test 2: registerSource() rejects duplicate source_id');
  let duplicateRejected = false;
  try {
    registerSource({
      source_id: TEST_SOURCE_ID,
      title: 'Test Smoke Source',
      languages: ['sw'],
      source_type: 'digital_content',
      copyright_status: 'licensed',
      status: 'identified'
    });
  } catch (err) {
    duplicateRejected = true;
  }
  assert(duplicateRejected, 'duplicate source_id correctly rejected');

  console.log('Test 3: linkDataset() adds a dataset_id to linked_dataset_ids');
  const linked = linkDataset(TEST_SOURCE_ID, 'test-dataset-DELETE-ME');
  assert(
    linked.linked_dataset_ids.includes('test-dataset-DELETE-ME'),
    'linked_dataset_ids now includes the new dataset_id'
  );

  console.log('Test 4: linkDataset() does not create duplicate entries when called again');
  const linkedAgain = linkDataset(TEST_SOURCE_ID, 'test-dataset-DELETE-ME');
  const count = linkedAgain.linked_dataset_ids.filter((id) => id === 'test-dataset-DELETE-ME').length;
  assert(count === 1, 'calling linkDataset twice does not duplicate the entry');

  console.log('Test 5: linkDataset() throws for nonexistent source');
  let nonexistentRejected = false;
  try {
    linkDataset('this-source-does-not-exist', 'test-dataset-DELETE-ME');
  } catch (err) {
    nonexistentRejected = true;
  }
  assert(nonexistentRejected, 'nonexistent source_id correctly throws');

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