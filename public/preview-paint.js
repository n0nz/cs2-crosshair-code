const OUTLINE_COLOR = '#061014';
const pixelCenter = (coordinate) => Math.floor(coordinate) + 0.5;

function fillDisplayRect(ctx, x, y, width, height, centerX, stretch) {
  ctx.fillRect(centerX + (x - centerX) * stretch, y, width * stretch, height);
}

function pixelRects(bars, centerX, centerY, zoom) {
  // Round each dimension once. Rounding both edges of a one-pixel line
  // centered on the crosshair makes it two pixels thick.
  return bars.map((bar) => {
    const width = Math.max(1, Math.round(bar.width * zoom));
    const height = Math.max(1, Math.round(bar.height * zoom));
    return {
      x: Math.round(pixelCenter(centerX) + (bar.x + bar.width / 2) * zoom - width / 2),
      y: Math.round(pixelCenter(centerY) + (bar.y + bar.height / 2) * zoom - height / 2),
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
    fillDisplayRect(ctx, x - 1, y - 1, width + extra, height + extra, pixelCenter(centerX), stretch);
  }
}

export function paintBarFills(ctx, bars, centerX, centerY, zoom, color, stretch = 1) {
  ctx.fillStyle = color;
  for (const { x, y, width, height } of pixelRects(bars, centerX, centerY, zoom)) {
    fillDisplayRect(ctx, x, y, width, height, pixelCenter(centerX), stretch);
  }
}

// Complete the outline layer before any colored pixels. Touching pieces then
// cover each other's inner outline while separated pieces retain their border.
export function paintPreviewBars(ctx, bars, centerX, centerY, zoom, outlineMode, color, stretch = 1, outlineColor = OUTLINE_COLOR) {
  paintBarOutlines(ctx, bars, centerX, centerY, zoom, outlineMode, stretch, outlineColor);
  paintBarFills(ctx, bars, centerX, centerY, zoom, color, stretch);
}
