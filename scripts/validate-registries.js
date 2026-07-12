/**
 * Bulk registry validator for the Sauti Labs platform.
 *
 * Loops through every framework's registry file, validates each entry
 * against its corresponding schema, and reports every failure clearly.
 * Exits with code 1 if any entry is invalid, so this can gate CI.
 *
 * This closes the gap noted in every framework README: registries wrap
 * entries in an array under a named key, so validating the whole file
 * against the per-entry schema isn't possible directly. This script
 * validates each entry individually instead.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const REGISTRIES = [
  {
    name: 'language-program-framework',
    schema: 'frameworks/language-program-framework/schema/language-program.schema.json',
    dataFiles: ['languages/kiswahili/language.meta.json', 'languages/dholuo/language.meta.json'],
    isRegistryFile: false
  },
  {
    name: 'dataset-framework',
    schema: 'frameworks/dataset-framework/schema/dataset.schema.json',
    registry: 'frameworks/dataset-framework/registry/datasets.json',
    arrayKey: 'datasets',
    isRegistryFile: true
  },
  {
    name: 'corpus-registry',
    schema: 'frameworks/corpus-registry/schema/corpus-source.schema.json',
    registry: 'frameworks/corpus-registry/registry/sources.json',
    arrayKey: 'sources',
    isRegistryFile: true
  },
  {
    name: 'speaker-registry',
    schema: 'frameworks/speaker-registry/schema/speaker.schema.json',
    registry: 'frameworks/speaker-registry/registry/speakers.json',
    arrayKey: 'speakers',
    isRegistryFile: true
  },
  {
    name: 'speech-registry (sources)',
    schema: 'frameworks/speech-registry/schema/speech-source.schema.json',
    registry: 'frameworks/speech-registry/registry/sources.json',
    arrayKey: 'sources',
    isRegistryFile: true
  },
  {
    name: 'speech-registry (recordings)',
    schema: 'frameworks/speech-registry/schema/speech-recording.schema.json',
    registry: 'frameworks/speech-registry/registry/recordings.json',
    arrayKey: 'recordings',
    isRegistryFile: true
  },
  {
    name: 'model-registry',
    schema: 'frameworks/model-registry/schema/model.schema.json',
    registry: 'frameworks/model-registry/registry/models.json',
    arrayKey: 'models',
    isRegistryFile: true
  },
  {
    name: 'benchmark-framework',
    schema: 'frameworks/benchmark-framework/schema/benchmark-result.schema.json',
    registry: 'frameworks/benchmark-framework/registry/benchmark-results.json',
    arrayKey: 'benchmark_results',
    isRegistryFile: true
  },
  {
    name: 'annotation-framework',
    schema: 'frameworks/annotation-framework/schema/annotation-task.schema.json',
    registry: 'frameworks/annotation-framework/registry/tasks.json',
    arrayKey: 'tasks',
    isRegistryFile: true
  },
  {
    name: 'api-framework',
    schema: 'frameworks/api-framework/schema/api-endpoint.schema.json',
    registry: 'frameworks/api-framework/registry/endpoints.json',
    arrayKey: 'endpoints',
    isRegistryFile: true
  }
];

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

let totalEntries = 0;
let totalFailures = 0;
const failureDetails = [];

for (const registry of REGISTRIES) {
  const schemaPath = path.join(process.cwd(), registry.schema);
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const validate = ajv.compile(schema);

  let entries = [];

  if (registry.isRegistryFile) {
    const registryPath = path.join(process.cwd(), registry.registry);
    const registryData = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    const rawEntries = registryData[registry.arrayKey] || [];
    entries = rawEntries.map((entry, index) => ({
      label: `${registry.registry} [${registry.arrayKey}][${index}] (${entry[Object.keys(entry)[0]] || 'unknown'})`,
      data: entry
    }));
  } else {
    entries = registry.dataFiles.map((filePath) => ({
      label: filePath,
      data: JSON.parse(fs.readFileSync(path.join(process.cwd(), filePath), 'utf8'))
    }));
  }

  for (const entry of entries) {
    totalEntries++;
    const valid = validate(entry.data);
    if (!valid) {
      totalFailures++;
      failureDetails.push({
        framework: registry.name,
        label: entry.label,
        errors: validate.errors
      });
    }
  }

  console.log(`[${registry.name}] checked ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`);
}

console.log('');

if (totalFailures > 0) {
  console.error(`VALIDATION FAILED: ${totalFailures} of ${totalEntries} entries invalid.\n`);
  for (const failure of failureDetails) {
    console.error(`  [${failure.framework}] ${failure.label}`);
    for (const err of failure.errors) {
      console.error(`    - ${err.instancePath || '(root)'} ${err.message}`);
    }
  }
  process.exit(1);
} else {
  console.log(`All ${totalEntries} entries across ${REGISTRIES.length} frameworks are valid.`);
  process.exit(0);
}
