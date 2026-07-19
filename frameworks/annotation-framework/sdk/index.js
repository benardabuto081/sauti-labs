/**
 * Annotation Framework SDK
 *
 * Provides a programmatic interface for creating and managing
 * annotation tasks and records, so contributors don't need to
 * hand-edit registry JSON files directly against the raw schemas.
 *
 * All functions read and write the registry files in
 * frameworks/annotation-framework/registry/ relative to the
 * repository root.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const PATHS = {
  taskSchema: path.join(REPO_ROOT, 'frameworks/annotation-framework/schema/annotation-task.schema.json'),
  taskRegistry: path.join(REPO_ROOT, 'frameworks/annotation-framework/registry/tasks.json'),
  recordSchema: path.join(REPO_ROOT, 'frameworks/annotation-framework/schema/annotation-record.schema.json'),
  recordRegistry: path.join(REPO_ROOT, 'frameworks/annotation-framework/registry/records.json')
};

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

const compiledValidators = new Map();

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
 * Creates a new annotation task and appends it to the task registry.
 * Throws if the task fails schema validation or if task_id already exists.
 */
function createTask(taskData) {
  const { valid, errors } = validateAgainst(PATHS.taskSchema, taskData);
  if (!valid) {
    throw new Error(`Invalid task data: ${JSON.stringify(errors, null, 2)}`);
  }

  const registry = loadJson(PATHS.taskRegistry);
  if (registry.tasks.some((t) => t.task_id === taskData.task_id)) {
    throw new Error(`Task with task_id '${taskData.task_id}' already exists.`);
  }

  registry.tasks.push(taskData);
  saveJson(PATHS.taskRegistry, registry);
  return taskData;
}

/**
 * Adds a new annotation record and appends it to the record registry.
 * Throws if the record fails schema validation, if record_id already
 * exists, or if the referenced task_id does not exist.
 */
function addRecord(recordData) {
  const { valid, errors } = validateAgainst(PATHS.recordSchema, recordData);
  if (!valid) {
    throw new Error(`Invalid record data: ${JSON.stringify(errors, null, 2)}`);
  }

  const taskRegistry = loadJson(PATHS.taskRegistry);
  const taskExists = taskRegistry.tasks.some((t) => t.task_id === recordData.task_id);
  if (!taskExists) {
    throw new Error(`Referenced task_id '${recordData.task_id}' does not exist in tasks.json.`);
  }

  const recordRegistry = loadJson(PATHS.recordRegistry);
  if (recordRegistry.records.some((r) => r.record_id === recordData.record_id)) {
    throw new Error(`Record with record_id '${recordData.record_id}' already exists.`);
  }

  recordRegistry.records.push(recordData);
  saveJson(PATHS.recordRegistry, recordRegistry);
  return recordData;
}

/**
 * Validates an existing task (by task_id) against the schema, and
 * checks that every record referencing it also validates cleanly.
 * Returns a summary object rather than throwing, since this is a
 * read-only diagnostic function.
 */
function validateTask(taskId) {
  const taskRegistry = loadJson(PATHS.taskRegistry);
  const task = taskRegistry.tasks.find((t) => t.task_id === taskId);
  if (!task) {
    return { taskId, found: false, valid: false, errors: [`Task '${taskId}' not found.`] };
  }

  const taskResult = validateAgainst(PATHS.taskSchema, task);

  const recordRegistry = loadJson(PATHS.recordRegistry);
  const relatedRecords = recordRegistry.records.filter((r) => r.task_id === taskId);
  const recordResults = relatedRecords.map((r) => ({
    recordId: r.record_id,
    ...validateAgainst(PATHS.recordSchema, r)
  }));

  const allValid = taskResult.valid && recordResults.every((r) => r.valid);

  return {
    taskId,
    found: true,
    valid: allValid,
    taskValid: taskResult.valid,
    taskErrors: taskResult.errors,
    recordCount: relatedRecords.length,
    recordResults
  };
}

module.exports = { createTask, addRecord, validateTask };
