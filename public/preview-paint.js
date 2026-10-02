const OUTLINE_COLOR = '#061014';

function pixelAnchor(coordinate, bars, zoom) {
  // previewBars puts a horizontal arm first (or a dot alone), so its height
  // gives the line thickness used by both axes.
  const lineWidth = Math.max(1, Math.round((bars[0]?.height ?? 1) * zoom));
  return Math.floor(coordinate) + (lineWidth % 2 ? 0.5 : 0);
}

function snappedStart(anchor, midpoint, size, zoom) {
  const positiveStart = Math.round(anchor + Math.abs(midpoint * zoom) - size / 2);
  return midpoint < 0 ? 2 * anchor - positiveStart - size : positiveStart;
}

function fillDisplayRect(ctx, x, y, width, height, centerX, stretch) {
  ctx.fillRect(centerX + (x - centerX) * stretch, y, width * stretch, height);
}

function pixelRects(bars, centerX, centerY, zoom) {
  // Round each dimension once. Rounding both edges of a one-pixel line
  // centered on the crosshair makes it two pixels thick.
  const anchorX = pixelAnchor(centerX, bars, zoom);
  const anchorY = pixelAnchor(centerY, bars, zoom);
  return bars.map((bar) => {
    const width = Math.max(1, Math.round(bar.width * zoom));
    const height = Math.max(1, Math.round(bar.height * zoom));
    return {
      x: snappedStart(anchorX, bar.x + bar.width / 2, width, zoom),
      y: snappedStart(anchorY, bar.y + bar.height / 2, height, zoom),
      width,
      height,
    };
  });
}

export function paintBarOutlines(ctx, bars, centerX, centerY, zoom, outlineMode, stretch = 1, outlineColor = OUTLINE_COLOR) {
  if (!outlineMode) return;
  ctx.fillStyle = outlineColor;
  for (const { x, y, width, height } of pixelRects(bars, centerX, centerY, zoom)) {
    const extra = outlineMode === 1 ? 2 : 1;
    fillDisplayRect(ctx, x - 1, y - 1, width + extra, height + extra, pixelAnchor(centerX, bars, zoom), stretch);
  }
}

export function paintBarFills(ctx, bars, centerX, centerY, zoom, color, stretch = 1) {
  ctx.fillStyle = color;
  for (const { x, y, width, height } of pixelRects(bars, centerX, centerY, zoom)) {
    fillDisplayRect(ctx, x, y, width, height, pixelAnchor(centerX, bars, zoom), stretch);
  }
}

// Complete the outline layer before any colored pixels. Touching pieces then
// cover each other's inner outline while separated pieces retain their border.
export function paintPreviewBars(ctx, bars, centerX, centerY, zoom, outlineMode, color, stretch = 1, outlineColor = OUTLINE_COLOR) {
  paintBarOutlines(ctx, bars, centerX, centerY, zoom, outlineMode, stretch, outlineColor);
  paintBarFills(ctx, bars, centerX, centerY, zoom, color, stretch);
}
