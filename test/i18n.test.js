import test from 'node:test';
import assert from 'node:assert/strict';

test('language switch exposes complete Thai and English interface text', async () => {
  const { t, messages } = await import('../public/i18n.js');
  for (const key of Object.keys(messages.th)) {
    assert.equal(typeof messages.en[key], 'string', `missing English: ${key}`);
    assert.notEqual(messages.en[key], '');
  }
  assert.equal(t('th', 'copy'), 'คัดลอกคำสั่ง');
  assert.equal(t('en', 'copy'), 'Copy commands');
  assert.match(t('en', 'decodeSuccess', { version: 4, height: 1080 }), /Version 4.*1080px/);
});
