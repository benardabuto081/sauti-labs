/**
 * Separates a downloaded corpus directory into license-pure subsets.
 * Moves CC-BY-NC files into an 'excluded-cc-by-nc' subfolder for
 * provenance, leaving only CC-BY files in the main directory.
 *
 * Nothing is deleted — excluded files remain on disk, just separated,
 * so the exclusion is fully traceable and reversible.
 *
 * Usage: node scripts/filter-corpus-by-license.js <corpus-dir>
 * Example: node scripts/filter-corpus-by-license.js languages/kiswahili/corpus/raw
 */

const fs = require('fs');
const path = require('path');

const corpusDir = process.argv[2];

if (!corpusDir) {
  console.error('Usage: node scripts/filter-corpus-by-license.js <corpus-dir>');
  process.exit(1);
}

const excludedDir = path.join(corpusDir, 'excluded-cc-by-nc');
fs.mkdirSync(excludedDir, { recursive: true });

const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.md'));

let moved = 0;
let kept = 0;
const movedFiles = [];

for (const file of files) {
  const filePath = path.join(corpusDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const licenseMatch = content.match(/\*\s*License:\s*\[([^\]]+)\]/);
  const license = licenseMatch ? licenseMatch[1].trim() : null;

  if (license === 'CC-BY-NC') {
    fs.renameSync(filePath, path.join(excludedDir, file));
    movedFiles.push(file);
    moved++;
  } else {
    kept++;
  }
}

console.log(`Corpus directory: ${corpusDir}`);
console.log(`Kept (non-NC): ${kept}`);
console.log(`Moved to excluded-cc-by-nc/: ${moved}`);
if (movedFiles.length > 0) {
  console.log(`Excluded files: ${movedFiles.join(', ')}`);
}
