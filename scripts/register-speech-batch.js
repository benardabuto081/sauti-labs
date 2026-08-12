/**
 * Computes real aggregate statistics for a batch of Common Voice
 * clips: total duration, demographic distribution, and registers
 * every clip as a real speech-registry recording via the SDK.
 *
 * Usage: node scripts/register-speech-batch.js <tsv-metadata-path> <duration-tsv-path> <clips-dir> <source-id> <limit>
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { registerRecording } = require('../frameworks/speech-registry/sdk');

const [, , metadataPath, durationPath, clipsDir, sourceId, limitArg] = process.argv;
const limit = parseInt(limitArg, 10);

function parseTsv(filePath, hasHeader = true) {
  const content = fs.readFileSync(filePath, 'utf8').trim();
  const lines = content.split('\n');
  const header = hasHeader ? lines[0].split('\t') : null;
  const dataLines = hasHeader ? lines.slice(1) : lines;
  return dataLines.map((line) => {
    const cols = line.split('\t');
    if (hasHeader) {
      const obj = {};
      header.forEach((h, i) => { obj[h] = cols[i]; });
      return obj;
    }
    return cols;
  });
}

const metadataRows = parseTsv(metadataPath, true).slice(0, limit);
const durationRows = parseTsv(durationPath, false);
const durationMap = new Map(durationRows.map(([p, ms]) => [p, parseInt(ms, 10)]));

let totalDurationMs = 0;
let registered = 0;
let failed = 0;
const ageCount = {};
const genderCount = {};

for (const row of metadataRows) {
  const clipPath = path.join(clipsDir, row.path);
  if (!fs.existsSync(clipPath)) {
    console.error(`  SKIP: ${row.path} not found on disk`);
    failed++;
    continue;
  }

  const durationMs = durationMap.get(row.path);
  if (!durationMs) {
    console.error(`  SKIP: ${row.path} has no duration entry`);
    failed++;
    continue;
  }

  const fileBuffer = fs.readFileSync(clipPath);
  const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex').toUpperCase();
  const recordingId = `kiswahili-common-voice-26-clip-${row.path.replace('common_voice_sw_', '').replace('.mp3', '')}`;

  try {
    registerRecording({
      recording_id: recordingId,
      source_id: sourceId,
      language: 'sw',
      duration_seconds: durationMs / 1000,
      sample_rate_hz: 48000,
      channel_count: 1,
      audio_format: 'mp3',
      checksum_sha256: checksum,
      version: '1.0.0',
      transcription_available: true,
      status: 'validated',
      notes: `Sentence: ${row.sentence}. Self-reported (Common Voice metadata, no speaker-registry entry - anonymous contributor): age ${row.age || 'undisclosed'}, gender ${row.gender || 'undisclosed'}, accent ${row.accents || 'undisclosed'}.`
    });
    registered++;
    totalDurationMs += durationMs;
    ageCount[row.age || 'undisclosed'] = (ageCount[row.age || 'undisclosed'] || 0) + 1;
    genderCount[row.gender || 'undisclosed'] = (genderCount[row.gender || 'undisclosed'] || 0) + 1;
  } catch (err) {
    console.error(`  FAIL: ${row.path}: ${err.message}`);
    failed++;
  }
}

console.log('');
console.log(`Registered: ${registered}, Failed/Skipped: ${failed}`);
console.log(`Total duration: ${(totalDurationMs / 1000).toFixed(1)}s (${(totalDurationMs / 60000).toFixed(2)} minutes)`);
console.log('Age distribution:', JSON.stringify(ageCount, null, 2));
console.log('Gender distribution:', JSON.stringify(genderCount, null, 2));