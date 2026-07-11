/**
 * Fetches real African Storybook Project source text for a given
 * language from the public global-asp/asp-source GitHub repository,
 * and saves each story as a raw Markdown file locally.
 *
 * Source: https://github.com/global-asp/asp-source
 * License: Each story is individually Creative Commons licensed
 * (CC BY or CC BY-NC), stated in the story's own metadata section.
 *
 * Usage: node scripts/fetch-storybook-corpus.js <iso-code> <output-dir>
 * Example: node scripts/fetch-storybook-corpus.js luo languages/dholuo/corpus/raw
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const isoCode = process.argv[2];
const outputDir = process.argv[3];

if (!isoCode || !outputDir) {
  console.error('Usage: node scripts/fetch-storybook-corpus.js <iso-code> <output-dir>');
  process.exit(1);
}

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'sauti-labs-corpus-fetch' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub API returned ${res.statusCode} for ${url}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

function httpsGetText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'sauti-labs-corpus-fetch' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub returned ${res.statusCode} for ${url}`));
          return;
        }
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log(`Fetching file listing for language '${isoCode}' from global-asp/asp-source...`);

  const listingUrl = `https://api.github.com/repos/global-asp/asp-source/contents/${isoCode}`;
  const files = await httpsGetJson(listingUrl);

  if (!Array.isArray(files)) {
    console.error(`Unexpected response for language '${isoCode}'. Does this language folder exist in the repository?`);
    console.error(JSON.stringify(files, null, 2));
    process.exit(1);
  }

  const mdFiles = files.filter((f) => f.name.endsWith('.md') && f.name.toLowerCase() !== 'readme.md');
  console.log(`Found ${mdFiles.length} story Markdown files (excluding README.md).`);

  fs.mkdirSync(outputDir, { recursive: true });

  let downloaded = 0;
  let failed = 0;

  for (const file of mdFiles) {
    try {
      const content = await httpsGetText(file.download_url);
      const outPath = path.join(outputDir, file.name);
      fs.writeFileSync(outPath, content, 'utf8');
      downloaded++;
      if (downloaded % 20 === 0) {
        console.log(`  ...${downloaded}/${mdFiles.length} downloaded`);
      }
    } catch (err) {
      failed++;
      console.error(`  Failed to download ${file.name}: ${err.message}`);
    }
  }

  console.log('');
  console.log(`Done. Downloaded: ${downloaded}. Failed: ${failed}. Saved to: ${outputDir}`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
