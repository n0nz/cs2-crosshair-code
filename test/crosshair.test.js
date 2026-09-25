import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeCrosshair, consoleCommands } from '../public/crosshair.js';

test('decodes the supplied version 4 code and emits new commands', () => {
  const c = decodeCrosshair('CSGO-uQPmY-jAqPO-O4O2C-Gj299-BzuKG');
  assert.equal(c.version, 4);
  assert.equal(c.style, 5);
  assert.equal(c.outlineMode, 1);
  assert.equal(c.length, 2);
  assert.equal(c.thickness, 1);
  assert.equal(c.screenHeight, 1080);
  const line = consoleCommands(c);
  assert.match(line, /cl_crosshair_length 2;/);
  assert.match(line, /cl_crosshair_screen_height 1080;/);
  assert.doesNotMatch(line, /cl_crosshairsize|cl_crosshairgap /);
});

test('rejects changed checksum and old version', () => {
  assert.throws(() => decodeCrosshair('CSGO-uQPmY-jAqPO-O4O2C-Gj299-BzuKH'), /Checksum/);
  assert.throws(() => decodeCrosshair('CSGO-WsnnD-eHaMw-QNDf9-oxuDh-ydOUD'), /รูปแบบเก่า/);
});

test('decodes published version 3 and version 4 fixtures', () => {
  const v3 = decodeCrosshair('CSGO-frCAy-PRXin-PY8Kj-wDTUo-TWAwO');
  assert.equal(v3.version, 3);
  assert.equal(v3.screenHeight, 1440);
  assert.equal(v3.outlineMode, 1);

  const v4 = decodeCrosshair('CSGO-sP6xU-TSyN9-sZcO5-2D48M-UppkP');
  assert.equal(v4.version, 4);
  assert.equal(v4.style, 2);
  assert.equal(v4.red, 255);
  assert.equal(v4.length, 5);
  assert.equal(v4.screenHeight, 768);
  assert.equal(v4.outlineMode, 0);
});
