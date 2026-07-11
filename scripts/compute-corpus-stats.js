/**
 * Computes real statistics from downloaded African Storybook corpus
 * files: document count, word count, and a breakdown of per-story
 * license types (since license is set per-story, not uniformly).
 *
 * This produces the honest numbers used to update dataset-framework
 * registry entries — no fabricated or assumed values.
 *
 * Usage: node scripts/compute-corpus-stats.js <corpus-dir>
 * Example: node scripts/compute-corpus-stats.js languages/dholuo/corpus/raw
 */

const fs = require('fs');
const path = require('path');

const corpusDir = process.argv[2];

if (!corpusDir) {
  console.error('Usage: node scripts/compute-corpus-stats.js <corpus-dir>');
  process.exit(1);
}

const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.md'));

let totalWords = 0;
const licenseCounts = {};
const missingLicense = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(corpusDir, file), 'utf8');

  // Extract story text: everything before the final metadata block
  // (metadata block starts with a line beginning with "* License:")
  const metadataIndex = content.indexOf('* License:');
  const storyText = metadataIndex > -1 ? content.slice(0, metadataIndex) : content;

  // Strip markdown page-break markers and count words
  const cleanText = storyText.replace(/^##\s*$/gm, ' ').replace(/#/g, ' ');
  const words = cleanText.split(/\s+/).filter((w) => w.length > 0);
  totalWords += words.length;

  // Extract license
  const licenseMatch = content.match(/\*\s*License:\s*\[([^\]]+)\]/);
  if (licenseMatch) {
    const license = licenseMatch[1].trim();
    licenseCounts[license] = (licenseCounts[license] || 0) + 1;
  } else {
    missingLicense.push(file);
  }
}

console.log(`Corpus directory: ${corpusDir}`);
console.log(`Document count: ${files.length}`);
console.log(`Total word count: ${totalWords}`);
console.log(`License breakdown:`);
for (const [license, count] of Object.entries(licenseCounts)) {
  console.log(`  ${license}: ${count} stories`);
}
if (missingLicense.length > 0) {
  console.log(`WARNING: ${missingLicense.length} files had no detectable license: ${missingLicense.join(', ')}`);
}
