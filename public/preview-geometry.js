export const previewModes = Object.freeze({
  '16:9': 1,
  '4:3': 4 / 3,
  '16:10': 10 / 9,
});

// Rectangles are relative to the center; only x coordinates and widths stretch.
export function previewBars(c, mode = '16:9') {
  const stretch = previewModes[mode] ?? 1;
  const length = Math.max(0, c.length);
  const thickness = Math.max(1, c.thickness);
  const start = c.gap + thickness / 2;
  const rect = (x, y, width, height) => ({ x: x * stretch, y, width: width * stretch, height });
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
