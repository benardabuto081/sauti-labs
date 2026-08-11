/**
 * Smoke test for the benchmark-framework SDK.
 *
 * Exercises recordResult, compareModels, and getBestResult against
 * the real registry, then cleans up the test entries it created.
 * Specifically verifies that lower_is_better ranking is correct in
 * both directions (error rates vs. quality scores), since getting
 * this backwards would silently misreport which model is "best."
 */

const fs = require('fs');
const path = require('path');
const { recordResult, compareModels, getBestResult } = require('../frameworks/benchmark-framework/sdk');

const RESULT_REGISTRY = path.join(__dirname, '..', 'frameworks/benchmark-framework/registry/benchmark-results.json');

const TEST_IDS = [
  'test-sdk-smoke-wer-a-DELETE-ME',
  'test-sdk-smoke-wer-b-DELETE-ME',
  'test-sdk-smoke-bleu-a-DELETE-ME',
  'test-sdk-smoke-bleu-b-DELETE-ME'
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

function cleanup() {
  const registry = JSON.parse(fs.readFileSync(RESULT_REGISTRY, 'utf8'));
  registry.benchmark_results = registry.benchmark_results.filter(
    (r) => !TEST_IDS.includes(r.benchmark_id)
  );
  fs.writeFileSync(RESULT_REGISTRY, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  console.log('Cleanup complete: test entries removed from registry.');
}

try {
  console.log('Test 1: recordResult() with valid data (WER, lower is better)');
  recordResult({
    benchmark_id: TEST_IDS[0],
    benchmark_suite: 'test-suite-smoke',
    model_id: 'test-model-a',
    language: 'sw',
    metric_name: 'WER',
    metric_value: 15.2,
    lower_is_better: true,
    run_date: '2026-07-19',
    status: 'completed'
  });
  recordResult({
    benchmark_id: TEST_IDS[1],
    benchmark_suite: 'test-suite-smoke',
    model_id: 'test-model-b',
    language: 'sw',
    metric_name: 'WER',
    metric_value: 8.7,
    lower_is_better: true,
    run_date: '2026-07-19',
    status: 'completed'
  });
  console.log('  PASS: two WER results recorded without error');

  console.log('Test 2: recordResult() rejects duplicate benchmark_id');
  let duplicateRejected = false;
  try {
    recordResult({
      benchmark_id: TEST_IDS[0],
      benchmark_suite: 'test-suite-smoke',
      model_id: 'test-model-a',
      language: 'sw',
      metric_name: 'WER',
      metric_value: 15.2,
      lower_is_better: true,
      run_date: '2026-07-19',
      status: 'completed'
    });
  } catch (err) {
    duplicateRejected = true;
  }
  assert(duplicateRejected, 'duplicate benchmark_id correctly rejected');

  console.log('Test 3: compareModels() ranks WER correctly (lower value = better = first)');
  const werRanked = compareModels({ benchmarkSuite: 'test-suite-smoke', language: 'sw', metricName: 'WER' });
  assert(werRanked.length === 2, 'compareModels finds exactly 2 WER results');
  assert(werRanked[0].model_id === 'test-model-b', 'model-b (8.7 WER) correctly ranked best (lowest)');
  assert(werRanked[1].model_id === 'test-model-a', 'model-a (15.2 WER) correctly ranked second');

  console.log('Test 4: recordResult() with valid data (BLEU, higher is better)');
  recordResult({
    benchmark_id: TEST_IDS[2],
    benchmark_suite: 'test-suite-smoke',
    model_id: 'test-model-a',
    language: 'sw',
    metric_name: 'BLEU',
    metric_value: 22.1,
    lower_is_better: false,
    run_date: '2026-07-19',
    status: 'completed'
  });
  recordResult({
    benchmark_id: TEST_IDS[3],
    benchmark_suite: 'test-suite-smoke',
    model_id: 'test-model-b',
    language: 'sw',
    metric_name: 'BLEU',
    metric_value: 31.4,
    lower_is_better: false,
    run_date: '2026-07-19',
    status: 'completed'
  });
  console.log('  PASS: two BLEU results recorded without error');

  console.log('Test 5: compareModels() ranks BLEU correctly (higher value = better = first)');
  const bleuRanked = compareModels({ benchmarkSuite: 'test-suite-smoke', language: 'sw', metricName: 'BLEU' });
  assert(bleuRanked.length === 2, 'compareModels finds exactly 2 BLEU results');
  assert(bleuRanked[0].model_id === 'test-model-b', 'model-b (31.4 BLEU) correctly ranked best (highest)');
  assert(bleuRanked[1].model_id === 'test-model-a', 'model-a (22.1 BLEU) correctly ranked second');

  console.log('Test 6: getBestResult() returns only the top result');
  const best = getBestResult({ benchmarkSuite: 'test-suite-smoke', language: 'sw', metricName: 'WER' });
  assert(best.model_id === 'test-model-b', 'getBestResult correctly returns model-b for WER');

  console.log('Test 7: getBestResult() returns null when no results exist');
  const none = getBestResult({ benchmarkSuite: 'test-suite-smoke', language: 'sw', metricName: 'CER' });
  assert(none === null, 'getBestResult correctly returns null for nonexistent metric');

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
