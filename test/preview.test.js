import test from 'node:test';
import assert from 'node:assert/strict';

test('native preview keeps horizontal and vertical bars equally sized', async () => {
  const { previewBars } = await import('../public/preview-geometry.js');
  const bars = previewBars({ length: 8, thickness: 2, gap: 4, dot: false, tStyle: false, style: 4 }, '16:9');
  assert.deepEqual(bars.right, { x: 4, y: -1, width: 8, height: 2 });
  assert.deepEqual(bars.bottom, { x: -1, y: 4, width: 2, height: 8 });
});

test('d0cc gap starts one pixel from the center even with three-pixel thickness', async () => {
  const { decodeCrosshair } = await import('../public/crosshair.js');
  const { exampleCodes } = await import('../public/examples.js');
  const { previewBars } = await import('../public/preview-geometry.js');
  const c = decodeCrosshair(exampleCodes.d0cc);
  assert.equal(c.gap, 1);
  assert.equal(c.thickness, 3);
  const bars = previewBars(c, '16:9');
  assert.deepEqual(bars.right, { x: 1, y: -1.5, width: 2, height: 3 });
  assert.deepEqual(bars.left, { x: -3, y: -1.5, width: 2, height: 3 });
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

test('touching outlined bars and dot have no black seam inside the crosshair', async () => {
  const { paintPreviewBars } = await import('../public/preview-paint.js');
  const { previewBars } = await import('../public/preview-geometry.js');
  const pixels = new Map();
  const ctx = {
    fillStyle: '',
    fillRect(x, y, width, height) {
      for (let row = y; row < y + height; row++) {
        for (let col = x; col < x + width; col++) pixels.set(`${col},${row}`, this.fillStyle);
      }
    },
  };
  const bars = Object.values(previewBars({ length: 2, thickness: 1, gap: 0, dot: true, tStyle: false, style: 4 }));
  paintPreviewBars(ctx, bars, 15, 15, 1.5, 1, 'green');
  assert.equal(pixels.get('16,15'), 'green'); // Join between dot and right bar.
  assert.equal(pixels.get('18,15'), '#061014'); // Only the outer edge is black.
});

test('separated bars retain their own outline around the gap', async () => {
  const { paintPreviewBars } = await import('../public/preview-paint.js');
  const { previewBars } = await import('../public/preview-geometry.js');
  const pixels = new Map();
  const ctx = {
    fillStyle: '',
    fillRect(x, y, width, height) {
      for (let row = y; row < y + height; row++) {
        for (let col = x; col < x + width; col++) pixels.set(`${col},${row}`, this.fillStyle);
      }
    },
  };
  const bars = Object.values(previewBars({ length: 2, thickness: 1, gap: 4, dot: true, tStyle: false, style: 4 }));
  paintPreviewBars(ctx, bars, 15, 15, 1.5, 1, 'green');
  assert.equal(pixels.get('20,15'), '#061014'); // Bar's inner outline.
  assert.equal(pixels.get('18,15'), undefined); // A visible gap remains.
});

test('preview zoom is smaller than the old three-times scale', async () => {
  const { previewZoom } = await import('../public/preview-geometry.js');
  assert.equal(previewZoom(1080), 1.5);
  assert.equal(previewZoom(960), 1.6875);
});
