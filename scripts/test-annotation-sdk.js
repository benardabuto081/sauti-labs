/**
 * Smoke test for the annotation-framework SDK.
 *
 * Exercises createTask, addRecord, and validateTask against the real
 * registries, then cleans up the test entries it created so the
 * registries are left exactly as they were found. Exits non-zero if
 * any assertion fails.
 */

const fs = require('fs');
const path = require('path');
const { createTask, addRecord, validateTask } = require('../frameworks/annotation-framework/sdk');

const TASK_REGISTRY = path.join(__dirname, '..', 'frameworks/annotation-framework/registry/tasks.json');
const RECORD_REGISTRY = path.join(__dirname, '..', 'frameworks/annotation-framework/registry/records.json');

const TEST_TASK_ID = 'test-sdk-smoke-task-DELETE-ME';
const TEST_RECORD_ID = 'test-sdk-smoke-record-DELETE-ME';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

function cleanup() {
  const taskRegistry = JSON.parse(fs.readFileSync(TASK_REGISTRY, 'utf8'));
  taskRegistry.tasks = taskRegistry.tasks.filter((t) => t.task_id !== TEST_TASK_ID);
  fs.writeFileSync(TASK_REGISTRY, JSON.stringify(taskRegistry, null, 2) + '\n', 'utf8');

  const recordRegistry = JSON.parse(fs.readFileSync(RECORD_REGISTRY, 'utf8'));
  recordRegistry.records = recordRegistry.records.filter((r) => r.record_id !== TEST_RECORD_ID);
  fs.writeFileSync(RECORD_REGISTRY, JSON.stringify(recordRegistry, null, 2) + '\n', 'utf8');

  console.log('Cleanup complete: test entries removed from registries.');
}

try {
  console.log('Test 1: createTask() with valid data');
  const task = createTask({
    task_id: TEST_TASK_ID,
    dataset_id: 'kiswahili-storybook-text-v1',
    annotation_type: 'consensus_validation',
    method: 'human_annotation',
    status: 'in_progress',
    quality_score: 0
  });
  assert(task.task_id === TEST_TASK_ID, 'created task has correct task_id');

  console.log('Test 2: createTask() rejects duplicate task_id');
  let duplicateRejected = false;
  try {
    createTask({
      task_id: TEST_TASK_ID,
      dataset_id: 'kiswahili-storybook-text-v1',
      annotation_type: 'consensus_validation',
      method: 'human_annotation',
      status: 'in_progress',
      quality_score: 0
    });
  } catch (err) {
    duplicateRejected = true;
  }
  assert(duplicateRejected, 'duplicate task_id correctly rejected');

  console.log('Test 3: addRecord() with valid data');
  const record = addRecord({
    record_id: TEST_RECORD_ID,
    task_id: TEST_TASK_ID,
    source_ref: 'languages/kiswahili/corpus/raw/0001_mwanamume-mrefu.md',
    annotation_type: 'consensus_validation',
    content: { reviewed: true, language_confirmed: 'sw' },
    status: 'accepted'
  });
  assert(record.record_id === TEST_RECORD_ID, 'created record has correct record_id');

  console.log('Test 4: addRecord() rejects record referencing nonexistent task');
  let missingTaskRejected = false;
  try {
    addRecord({
      record_id: 'test-sdk-smoke-record-orphan-DELETE-ME',
      task_id: 'this-task-does-not-exist',
      source_ref: 'nowhere',
      annotation_type: 'consensus_validation',
      content: { reviewed: true },
      status: 'draft'
    });
  } catch (err) {
    missingTaskRejected = true;
  }
  assert(missingTaskRejected, 'record referencing nonexistent task correctly rejected');

  console.log('Test 5: validateTask() reports the task and its record as valid');
  const validation = validateTask(TEST_TASK_ID);
  assert(validation.found === true, 'validateTask finds the created task');
  assert(validation.valid === true, 'validateTask reports overall valid');
  assert(validation.recordCount === 1, 'validateTask counts exactly 1 linked record');

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
