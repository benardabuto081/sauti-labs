/**
 * Smoke test for the speech-registry SDK.
 *
 * Exercises registerSource, registerRecording (including its
 * cross-checks against both speech-registry sources and
 * speaker-registry speakers, plus auto-linking), and
 * getRecordingsBySource.
 */

const fs = require('fs');
const path = require('path');
const { registerSource, registerRecording, getRecordingsBySource } = require('../frameworks/speech-registry/sdk');
const { registerSpeaker } = require('../frameworks/speaker-registry/sdk');

const SOURCE_REGISTRY = path.join(__dirname, '..', 'frameworks/speech-registry/registry/sources.json');
const RECORDING_REGISTRY = path.join(__dirname, '..', 'frameworks/speech-registry/registry/recordings.json');
const SPEAKER_REGISTRY = path.join(__dirname, '..', 'frameworks/speaker-registry/registry/speakers.json');

const TEST_SOURCE_ID = 'test-sdk-smoke-speech-source-DELETE-ME';
const TEST_RECORDING_ID = 'test-sdk-smoke-speech-recording-DELETE-ME';
const TEST_ORPHAN_RECORDING_ID = 'test-sdk-smoke-orphan-recording-DELETE-ME';
const TEST_SPEAKER_ID = 'spk-testsmokesp1';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

function cleanup() {
  const sourceRegistry = JSON.parse(fs.readFileSync(SOURCE_REGISTRY, 'utf8'));
  sourceRegistry.sources = sourceRegistry.sources.filter((s) => s.source_id !== TEST_SOURCE_ID);
  fs.writeFileSync(SOURCE_REGISTRY, JSON.stringify(sourceRegistry, null, 2) + '\n', 'utf8');

  const recordingRegistry = JSON.parse(fs.readFileSync(RECORDING_REGISTRY, 'utf8'));
  recordingRegistry.recordings = recordingRegistry.recordings.filter(
    (r) => ![TEST_RECORDING_ID, TEST_ORPHAN_RECORDING_ID].includes(r.recording_id)
  );
  fs.writeFileSync(RECORDING_REGISTRY, JSON.stringify(recordingRegistry, null, 2) + '\n', 'utf8');

  const speakerRegistry = JSON.parse(fs.readFileSync(SPEAKER_REGISTRY, 'utf8'));
  speakerRegistry.speakers = speakerRegistry.speakers.filter((s) => s.speaker_id !== TEST_SPEAKER_ID);
  fs.writeFileSync(SPEAKER_REGISTRY, JSON.stringify(speakerRegistry, null, 2) + '\n', 'utf8');

  console.log('Cleanup complete: test entries removed from all three registries.');
}

try {
  console.log('Test 1: registerSource() with valid data');
  registerSource({
    source_id: TEST_SOURCE_ID,
    title: 'Test Smoke Speech Source',
    languages: ['sw'],
    collection_method: 'field_recording',
    copyright_status: 'licensed',
    status: 'identified'
  });
  console.log('  PASS: source registered without error');

  console.log('Test 2: registerRecording() rejects a recording referencing a nonexistent source');
  let missingSourceRejected = false;
  try {
    registerRecording({
      recording_id: TEST_ORPHAN_RECORDING_ID,
      source_id: 'this-source-does-not-exist',
      language: 'sw',
      duration_seconds: 5,
      sample_rate_hz: 16000,
      audio_format: 'wav',
      status: 'identified'
    });
  } catch (err) {
    missingSourceRejected = true;
  }
  assert(missingSourceRejected, 'recording referencing nonexistent source correctly rejected');

  console.log('Test 3: registerSpeaker() to set up a real speaker for the next test');
  registerSpeaker({
    speaker_id: TEST_SPEAKER_ID,
    languages: ['sw'],
    consent: { status: 'obtained', scope: ['research'] }
  });
  console.log('  PASS: test speaker registered');

  console.log('Test 4: registerRecording() rejects a recording referencing a nonexistent speaker_id');
  let missingSpeakerRejected = false;
  try {
    registerRecording({
      recording_id: TEST_ORPHAN_RECORDING_ID,
      source_id: TEST_SOURCE_ID,
      speaker_id: 'spk-doesnotexist99',
      language: 'sw',
      duration_seconds: 5,
      sample_rate_hz: 16000,
      audio_format: 'wav',
      status: 'identified'
    });
  } catch (err) {
    missingSpeakerRejected = true;
  }
  assert(missingSpeakerRejected, 'recording referencing nonexistent speaker_id correctly rejected');

  console.log('Test 5: registerRecording() succeeds with valid source_id and valid speaker_id');
  registerRecording({
    recording_id: TEST_RECORDING_ID,
    source_id: TEST_SOURCE_ID,
    speaker_id: TEST_SPEAKER_ID,
    language: 'sw',
    duration_seconds: 4.2,
    sample_rate_hz: 16000,
    audio_format: 'wav',
    status: 'identified'
  });
  console.log('  PASS: recording registered without error');

  console.log('Test 6: registerRecording() auto-links the recording to its source');
  const sourceRegistryAfter = JSON.parse(fs.readFileSync(SOURCE_REGISTRY, 'utf8'));
  const updatedSource = sourceRegistryAfter.sources.find((s) => s.source_id === TEST_SOURCE_ID);
  assert(
    updatedSource.linked_recording_ids.includes(TEST_RECORDING_ID),
    'source linked_recording_ids automatically includes the new recording_id'
  );

  console.log('Test 7: getRecordingsBySource() finds the recording');
  const recordings = getRecordingsBySource(TEST_SOURCE_ID);
  assert(recordings.length === 1, 'exactly 1 recording found for test source');
  assert(recordings[0].recording_id === TEST_RECORDING_ID, 'found recording has correct recording_id');

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