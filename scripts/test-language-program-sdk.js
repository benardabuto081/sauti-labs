/**
 * Smoke test for the language-program-framework SDK.
 *
 * Exercises createLanguageProgram against a temporary test language,
 * and getLanguageSummary against BOTH a real, live language (Kiswahili,
 * to prove the composite query works correctly on real production
 * data) and the temporary test language (to prove it correctly
 * reports zero counts for a language with no real footprint yet).
 */

const fs = require('fs');
const path = require('path');
const { createLanguageProgram, getLanguageSummary } = require('../frameworks/language-program-framework/sdk');

const TEST_DIR_NAME = 'test-sdk-smoke-language-DELETE-ME';
const TEST_ISO_CODE = 'zztest';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

function cleanup() {
  const targetDir = path.join(__dirname, '..', 'languages', TEST_DIR_NAME);
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  console.log('Cleanup complete: test language directory removed.');
}

try {
  console.log('Test 1: createLanguageProgram() with valid data creates real directory structure');
  createLanguageProgram(TEST_DIR_NAME, {
    language_name: 'Test Smoke Language',
    iso_code: TEST_ISO_CODE,
    status: 'planned',
    research_stage: 'not_started',
    language_family: 'Test Family',
    countries: ['Testland'],
    writing_system: 'Latin'
  });
  const targetDir = path.join(__dirname, '..', 'languages', TEST_DIR_NAME);
  assert(fs.existsSync(path.join(targetDir, 'language.meta.json')), 'language.meta.json was created');
  assert(fs.existsSync(path.join(targetDir, 'corpus', '.gitkeep')), 'corpus/ subfolder was created');
  assert(fs.existsSync(path.join(targetDir, 'speech', '.gitkeep')), 'speech/ subfolder was created');
  assert(fs.existsSync(path.join(targetDir, 'lexicon', '.gitkeep')), 'lexicon/ subfolder was created');
  assert(fs.existsSync(path.join(targetDir, 'benchmarks', '.gitkeep')), 'benchmarks/ subfolder was created');

  console.log('Test 2: createLanguageProgram() rejects an already-existing directory');
  let duplicateRejected = false;
  try {
    createLanguageProgram(TEST_DIR_NAME, {
      language_name: 'Test Smoke Language',
      iso_code: TEST_ISO_CODE,
      status: 'planned',
      research_stage: 'not_started',
      language_family: 'Test Family',
      countries: ['Testland'],
      writing_system: 'Latin'
    });
  } catch (err) {
    duplicateRejected = true;
  }
  assert(duplicateRejected, 'duplicate directory correctly rejected');

  console.log('Test 3: getLanguageSummary() on REAL Kiswahili data returns correct real counts');
  const swSummary = getLanguageSummary('sw');
  assert(swSummary.datasetCount === 1, `Kiswahili has exactly 1 real dataset (got ${swSummary.datasetCount})`);
  assert(
    swSummary.datasetIds.includes('kiswahili-storybook-text-v1'),
    'Kiswahili dataset list includes the real kiswahili-storybook-text-v1'
  );
  assert(swSummary.corpusSourceCount === 1, `Kiswahili has exactly 1 real corpus source (got ${swSummary.corpusSourceCount})`);

  console.log('Test 4: getLanguageSummary() on the new test language returns all zero counts');
  const testSummary = getLanguageSummary(TEST_ISO_CODE);
  assert(testSummary.datasetCount === 0, 'test language has 0 datasets');
  assert(testSummary.corpusSourceCount === 0, 'test language has 0 corpus sources');
  assert(testSummary.speechSourceCount === 0, 'test language has 0 speech sources');
  assert(testSummary.modelCount === 0, 'test language has 0 models');
  assert(testSummary.benchmarkResultCount === 0, 'test language has 0 benchmark results');

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