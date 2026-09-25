import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeCrosshair } from '../public/crosshair.js';

test('every selectable player code decodes with the current decoder', async () => {
  const { exampleCodes } = await import('../public/examples.js');
  const names = ['f0rest', 'donk', 'kyousuke', 'd0cc', 'ohnePixel'];
  assert.deepEqual(Object.keys(exampleCodes), names);
  for (const name of names) {
    const crosshair = decodeCrosshair(exampleCodes[name]);
    assert.ok(crosshair.version === 3 || crosshair.version === 4, name);
  }
});
