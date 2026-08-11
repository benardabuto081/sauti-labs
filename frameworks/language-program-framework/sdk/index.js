/**
 * Language Program Framework SDK
 *
 * Provides a programmatic interface for creating new language
 * programs from the template, and for producing a composite summary
 * of a language's real footprint across every other framework -
 * datasets, corpus sources, speech sources/recordings, models, and
 * benchmark results. This is a working implementation of the Sauti
 * Codex's stated query pattern (e.g. "what datasets does Dholuo have?").
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const PATHS = {
  languageSchema: path.join(REPO_ROOT, 'frameworks/language-program-framework/schema/language-program.schema.json'),
  languagesDir: path.join(REPO_ROOT, 'languages'),
  datasetRegistry: path.join(REPO_ROOT, 'frameworks/dataset-framework/registry/datasets.json'),
  corpusSourceRegistry: path.join(REPO_ROOT, 'frameworks/corpus-registry/registry/sources.json'),
  speechSourceRegistry: path.join(REPO_ROOT, 'frameworks/speech-registry/registry/sources.json'),
  speechRecordingRegistry: path.join(REPO_ROOT, 'frameworks/speech-registry/registry/recordings.json'),
  modelRegistry: path.join(REPO_ROOT, 'frameworks/model-registry/registry/models.json'),
  benchmarkRegistry: path.join(REPO_ROOT, 'frameworks/benchmark-framework/registry/benchmark-results.json')
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
 * Creates a new language program directory under languages/<dirName>/
 * with a language.meta.json validated against the schema. Throws if
 * validation fails or if the target directory already exists.
 */
function createLanguageProgram(dirName, languageData) {
  const { valid, errors } = validateAgainst(PATHS.languageSchema, languageData);
  if (!valid) {
    throw new Error(`Invalid language program data: ${JSON.stringify(errors, null, 2)}`);
  }

  const targetDir = path.join(PATHS.languagesDir, dirName);
  if (fs.existsSync(targetDir)) {
    throw new Error(`Language program directory 'languages/${dirName}' already exists.`);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  for (const sub of ['corpus', 'speech', 'lexicon', 'benchmarks']) {
    fs.mkdirSync(path.join(targetDir, sub), { recursive: true });
    fs.writeFileSync(path.join(targetDir, sub, '.gitkeep'), '', 'utf8');
  }
  saveJson(path.join(targetDir, 'language.meta.json'), languageData);

  return languageData;
}

/**
 * Produces a composite summary of a language's real footprint across
 * every framework registry, keyed by ISO code. Every count reflects
 * actual registry entries at the time of calling - nothing cached or
 * assumed.
 */
function getLanguageSummary(isoCode) {
  const datasets = loadJson(PATHS.datasetRegistry).datasets.filter((d) => d.languages.includes(isoCode));
  const corpusSources = loadJson(PATHS.corpusSourceRegistry).sources.filter((s) => s.languages.includes(isoCode));
  const speechSources = loadJson(PATHS.speechSourceRegistry).sources.filter((s) => s.languages.includes(isoCode));
  const speechRecordings = loadJson(PATHS.speechRecordingRegistry).recordings.filter((r) => r.language === isoCode);
  const models = loadJson(PATHS.modelRegistry).models.filter(
    (m) => Array.isArray(m.supported_languages) && m.supported_languages.includes(isoCode)
  );
  const benchmarkResults = loadJson(PATHS.benchmarkRegistry).benchmark_results.filter((r) => r.language === isoCode);

  return {
    isoCode,
    datasetCount: datasets.length,
    datasetIds: datasets.map((d) => d.dataset_id),
    corpusSourceCount: corpusSources.length,
    corpusSourceIds: corpusSources.map((s) => s.source_id),
    speechSourceCount: speechSources.length,
    speechSourceIds: speechSources.map((s) => s.source_id),
    speechRecordingCount: speechRecordings.length,
    modelCount: models.length,
    modelIds: models.map((m) => m.model_id),
    benchmarkResultCount: benchmarkResults.length
  };
}

module.exports = { createLanguageProgram, getLanguageSummary };