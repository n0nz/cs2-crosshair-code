const OUTLINE_COLOR = '#061014';

function pixelRects(bars, centerX, centerY, zoom) {
  // Round offsets symmetrically: Math.round(-4.5) and Math.round(4.5)
  // otherwise produce arms with different lengths in stretched modes.
  const edge = (center, offset) => Math.round(center) + Math.sign(offset) * Math.round(Math.abs(offset * zoom));
  return bars.map((bar) => {
    const x = edge(centerX, bar.x);
    const y = edge(centerY, bar.y);
    return {
      x,
      y,
      width: Math.max(1, edge(centerX, bar.x + bar.width) - x),
      height: Math.max(1, edge(centerY, bar.y + bar.height) - y),
    };
  });
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
