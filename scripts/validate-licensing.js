/**
 * Licensing validation for the Sauti Labs platform.
 *
 * Verifies the split-licensing architecture (ADR-0003) is intact:
 * - Every language program directory has a NOTICE.md.
 * - Every corpus-registry source with copyright_status "licensed"
 *   has non-empty license_details.
 * - Every speech-registry source with copyright_status "licensed"
 *   has non-empty license_details.
 * - Every corpus-registry source with copyright_status
 *   "unknown_pending_review" is NOT referenced as linked_dataset_ids
 *   on any dataset currently marked "ready".
 *
 * Exits non-zero if any check fails, so this can gate CI.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

let failures = 0;

function fail(message) {
  console.error(`  FAIL: ${message}`);
  failures++;
}

function pass(message) {
  console.log(`  PASS: ${message}`);
}

console.log('Check 1: Every language program has a NOTICE.md');
const languagesDir = path.join(REPO_ROOT, 'languages');
const languageDirs = fs.readdirSync(languagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

for (const dirName of languageDirs) {
  const noticePath = path.join(languagesDir, dirName, 'NOTICE.md');
  if (fs.existsSync(noticePath)) {
    pass(`languages/${dirName}/NOTICE.md exists`);
  } else {
    fail(`languages/${dirName}/NOTICE.md is MISSING - this language program has no licensing boundary notice`);
  }
}

console.log('');
console.log('Check 2: Every "licensed" corpus source has non-empty license_details');
const corpusRegistry = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'frameworks/corpus-registry/registry/sources.json'), 'utf8')
);
for (const source of corpusRegistry.sources) {
  if (source.copyright_status === 'licensed') {
    if (source.license_details && source.license_details.trim().length > 0) {
      pass(`${source.source_id}: has license_details`);
    } else {
      fail(`${source.source_id}: copyright_status is "licensed" but license_details is empty`);
    }
  }
}

console.log('');
console.log('Check 2b: Every "licensed" speech source has non-empty license_details');
const speechSourceRegistry = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'frameworks/speech-registry/registry/sources.json'), 'utf8')
);
for (const source of speechSourceRegistry.sources) {
  if (source.copyright_status === 'licensed') {
    if (source.license_details && source.license_details.trim().length > 0) {
      pass(`${source.source_id}: has license_details`);
    } else {
      fail(`${source.source_id}: copyright_status is "licensed" but license_details is empty`);
    }
  }
}

console.log('');
console.log('Check 3: No "ready" dataset is linked from an unresolved-copyright corpus source');
const datasetRegistry = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'frameworks/dataset-framework/registry/datasets.json'), 'utf8')
);
const readyDatasetIds = new Set(
  datasetRegistry.datasets.filter((d) => d.status === 'ready').map((d) => d.dataset_id)
);

for (const source of corpusRegistry.sources) {
  if (source.copyright_status === 'unknown_pending_review') {
    const linkedReadyDatasets = (source.linked_dataset_ids || []).filter((id) => readyDatasetIds.has(id));
    if (linkedReadyDatasets.length > 0) {
      fail(`${source.source_id}: copyright_status is "unknown_pending_review" but is linked to READY dataset(s): ${linkedReadyDatasets.join(', ')} - this must not happen`);
    } else {
      pass(`${source.source_id}: unresolved copyright, correctly not linked to any ready dataset`);
    }
  }
}

console.log('');
if (failures > 0) {
  console.error(`LICENSING VALIDATION FAILED: ${failures} issue(s) found.`);
  process.exit(1);
} else {
  console.log('All licensing checks passed.');
  process.exit(0);
}