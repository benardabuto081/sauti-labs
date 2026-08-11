/**
 * Smoke test for the speaker-registry SDK.
 *
 * Exercises registerSpeaker and, most importantly, canUseForPurpose
 * across every case where it must correctly deny use: nonexistent
 * speaker, unresolved consent, withdrawn consent, and out-of-scope
 * purpose. This function is a real safety mechanism per ADR-0002, so
 * it is tested more thoroughly than a typical getter.
 */

const fs = require('fs');
const path = require('path');
const { registerSpeaker, canUseForPurpose } = require('../frameworks/speaker-registry/sdk');

const SPEAKER_REGISTRY = path.join(__dirname, '..', 'frameworks/speaker-registry/registry/speakers.json');

const TEST_IDS = [
  'spk-testsmoke01',
  'spk-testsmoke02',
  'spk-testsmoke03'
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  console.log(`  PASS: ${message}`);
}

function cleanup() {
  const registry = JSON.parse(fs.readFileSync(SPEAKER_REGISTRY, 'utf8'));
  registry.speakers = registry.speakers.filter((s) => !TEST_IDS.includes(s.speaker_id));
  fs.writeFileSync(SPEAKER_REGISTRY, JSON.stringify(registry, null, 2) + '\n', 'utf8');
  console.log('Cleanup complete: test entries removed from registry.');
}

try {
  console.log('Test 1: registerSpeaker() with valid consented data');
  registerSpeaker({
    speaker_id: TEST_IDS[0],
    languages: ['sw'],
    consent: {
      status: 'obtained',
      scope: ['research', 'model_training'],
      consent_agreement_version: 'v1.0',
      consent_date: '2026-07-19'
    }
  });
  console.log('  PASS: consented speaker registered without error');

  console.log('Test 2: registerSpeaker() with unresolved consent');
  registerSpeaker({
    speaker_id: TEST_IDS[1],
    languages: ['luo'],
    consent: {
      status: 'unknown_pending_review',
      scope: []
    }
  });
  console.log('  PASS: unresolved-consent speaker registered without error (registration itself is allowed; usage is not)');

  console.log('Test 3: registerSpeaker() with withdrawn consent');
  registerSpeaker({
    speaker_id: TEST_IDS[2],
    languages: ['sw'],
    consent: {
      status: 'withdrawn',
      scope: ['research']
    }
  });
  console.log('  PASS: withdrawn-consent speaker registered without error');

  console.log('Test 4: canUseForPurpose() returns true for consented speaker, in-scope purpose');
  assert(canUseForPurpose(TEST_IDS[0], 'research') === true, 'consented speaker, research purpose => true');
  assert(canUseForPurpose(TEST_IDS[0], 'model_training') === true, 'consented speaker, model_training purpose => true');

  console.log('Test 5: canUseForPurpose() returns false for consented speaker, OUT-OF-SCOPE purpose');
  assert(canUseForPurpose(TEST_IDS[0], 'redistribution') === false, 'consented speaker but redistribution not in scope => false');
  assert(canUseForPurpose(TEST_IDS[0], 'commercial_use') === false, 'consented speaker but commercial_use not in scope => false');

  console.log('Test 6: canUseForPurpose() returns false for unresolved consent, regardless of purpose');
  assert(canUseForPurpose(TEST_IDS[1], 'research') === false, 'unknown_pending_review => false even for research');

  console.log('Test 7: canUseForPurpose() returns false for withdrawn consent, even if purpose is nominally in scope');
  assert(canUseForPurpose(TEST_IDS[2], 'research') === false, 'withdrawn consent => false even though research is in scope array');

  console.log('Test 8: canUseForPurpose() returns false for nonexistent speaker (never throws)');
  assert(canUseForPurpose('spk-doesnotexist99', 'research') === false, 'nonexistent speaker => false, not an error');

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