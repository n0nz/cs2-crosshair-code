export const previewModes = Object.freeze({
  '16:9': 1,
  '4:3': 4 / 3,
  '16:10': 10 / 9,
});

export function previewZoom(screenHeight) {
  return Math.min(2, Math.max(0.75, 1.5 * 1080 / Math.max(1, screenHeight)));
}

// Native-resolution rectangles relative to the center. Display stretching
// happens only after these have been rasterized to pixels.
export function previewBars(c) {
  const length = Math.max(0, c.length);
  const thickness = Math.max(1, c.thickness);
  // CS2's current gap is the distance from the center to each bar's inner edge.
  // Adding half the bar thickness here makes thick crosshairs (e.g. d0cc) too open.
  const start = c.gap;
  const rect = (x, y, width, height) => ({ x, y, width, height });
  const bars = {};

  if (c.style === 6) {
    bars.dot = rect(-thickness / 2, -thickness / 2, thickness, thickness);
    return bars;
  }
  bars.right = rect(start, -thickness / 2, length, thickness);
  bars.left = rect(-start - length, -thickness / 2, length, thickness);
  bars.bottom = rect(-thickness / 2, start, thickness, length);
  if (!c.tStyle) bars.top = rect(-thickness / 2, -start - length, thickness, length);
  if (c.dot) bars.dot = rect(-thickness / 2, -thickness / 2, thickness, thickness);
  return bars;
}
