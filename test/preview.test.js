import test from 'node:test';
import assert from 'node:assert/strict';

test('native preview keeps horizontal and vertical bars equally sized', async () => {
  const { previewBars } = await import('../public/preview-geometry.js');
  const bars = previewBars({ length: 8, thickness: 2, gap: 4, dot: false, tStyle: false, style: 4 }, '16:9');
  assert.deepEqual(bars.right, { x: 5, y: -1, width: 8, height: 2 });
  assert.deepEqual(bars.bottom, { x: -1, y: 5, width: 2, height: 8 });
});

test('stretched ratios change horizontal dimensions only', async () => {
  const { previewBars } = await import('../public/preview-geometry.js');
  const c = { length: 9, thickness: 3, gap: 3, dot: false, tStyle: false, style: 4 };
  const native = previewBars(c, '16:9');
  const fourThree = previewBars(c, '4:3');
  const sixteenTen = previewBars(c, '16:10');
  assert.equal(fourThree.right.width, 12);
  assert.equal(fourThree.bottom.height, 9);
  assert.equal(sixteenTen.right.width, 10);
  assert.equal(sixteenTen.bottom.height, 9);
  assert.equal(native.right.width, 9);
});
