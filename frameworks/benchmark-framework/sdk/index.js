/**
 * Benchmark Framework SDK
 *
 * Provides a programmatic interface for recording and comparing
 * benchmark results, so contributors don't need to hand-edit registry
 * JSON directly, and so model comparisons correctly respect each
 * metric's lower_is_better direction rather than being compared naively.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const PATHS = {
  resultSchema: path.join(REPO_ROOT, 'frameworks/benchmark-framework/schema/benchmark-result.schema.json'),
  resultRegistry: path.join(REPO_ROOT, 'frameworks/benchmark-framework/registry/benchmark-results.json')
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
 * Records a new benchmark result and appends it to the registry.
 * Throws if the result fails schema validation or if benchmark_id
 * already exists.
 */
function recordResult(resultData) {
  const { valid, errors } = validateAgainst(PATHS.resultSchema, resultData);
  if (!valid) {
    throw new Error(`Invalid benchmark result: ${JSON.stringify(errors, null, 2)}`);
  }

  const registry = loadJson(PATHS.resultRegistry);
  if (registry.benchmark_results.some((r) => r.benchmark_id === resultData.benchmark_id)) {
    throw new Error(`Benchmark result with benchmark_id '${resultData.benchmark_id}' already exists.`);
  }

  registry.benchmark_results.push(resultData);
  saveJson(PATHS.resultRegistry, registry);
  return resultData;
}

/**
 * Compares all recorded results for a given benchmark_suite + language
 * + metric_name combination, correctly respecting lower_is_better.
 * Returns results sorted from best to worst. Throws if results for
 * the same metric_name disagree on lower_is_better (a real data
 * integrity problem, not something to silently guess around).
 */
function compareModels({ benchmarkSuite, language, metricName }) {
  const registry = loadJson(PATHS.resultRegistry);
  const matches = registry.benchmark_results.filter(
    (r) =>
      r.benchmark_suite === benchmarkSuite &&
      r.language === language &&
      r.metric_name === metricName &&
      r.status === 'completed'
  );

  if (matches.length === 0) {
    return [];
  }

  const lowerIsBetterValues = new Set(matches.map((r) => r.lower_is_better));
  if (lowerIsBetterValues.size > 1) {
    throw new Error(
      `Data integrity error: results for benchmark_suite='${benchmarkSuite}', language='${language}', metric_name='${metricName}' disagree on lower_is_better.`
    );
  }
  const lowerIsBetter = matches[0].lower_is_better !== false;

  const sorted = [...matches].sort((a, b) =>
    lowerIsBetter ? a.metric_value - b.metric_value : b.metric_value - a.metric_value
  );

  return sorted;
}

/**
 * Convenience wrapper around compareModels that returns only the
 * single best result, or null if none exist.
 */
function getBestResult({ benchmarkSuite, language, metricName }) {
  const sorted = compareModels({ benchmarkSuite, language, metricName });
  return sorted.length > 0 ? sorted[0] : null;
}

module.exports = { recordResult, compareModels, getBestResult };
