const OUTLINE_COLOR = '#061014';

function pixelRects(bars, centerX, centerY, zoom) {
  return bars.map((bar) => ({
    x: Math.round(centerX + bar.x * zoom),
    y: Math.round(centerY + bar.y * zoom),
    width: Math.max(1, Math.round(bar.width * zoom)),
    height: Math.max(1, Math.round(bar.height * zoom)),
  }));
}

export function paintBarOutlines(ctx, bars, centerX, centerY, zoom, outlineMode) {
  if (!outlineMode) return;
  ctx.fillStyle = OUTLINE_COLOR;
  for (const { x, y, width, height } of pixelRects(bars, centerX, centerY, zoom)) {
    const extra = outlineMode === 1 ? 2 : 1;
    ctx.fillRect(x - 1, y - 1, width + extra, height + extra);
  }
}

export function paintBarFills(ctx, bars, centerX, centerY, zoom, color) {
  ctx.fillStyle = color;
  for (const { x, y, width, height } of pixelRects(bars, centerX, centerY, zoom)) {
    ctx.fillRect(x, y, width, height);
  }
}

// Complete the outline layer before any colored pixels. Touching pieces then
// cover each other's inner outline while separated pieces retain their border.
export function paintPreviewBars(ctx, bars, centerX, centerY, zoom, outlineMode, color) {
  paintBarOutlines(ctx, bars, centerX, centerY, zoom, outlineMode);
  paintBarFills(ctx, bars, centerX, centerY, zoom, color);
}
