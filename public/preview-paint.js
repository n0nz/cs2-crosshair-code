const OUTLINE_COLOR = '#061014';

function fillDisplayRect(ctx, x, y, width, height, centerX, stretch) {
  ctx.fillRect(centerX + (x - centerX) * stretch, y, width * stretch, height);
}

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

export function paintBarOutlines(ctx, bars, centerX, centerY, zoom, outlineMode, stretch = 1) {
  if (!outlineMode) return;
  ctx.fillStyle = OUTLINE_COLOR;
  for (const { x, y, width, height } of pixelRects(bars, centerX, centerY, zoom)) {
    const extra = outlineMode === 1 ? 2 : 1;
    fillDisplayRect(ctx, x - 1, y - 1, width + extra, height + extra, Math.round(centerX), stretch);
  }
}

export function paintBarFills(ctx, bars, centerX, centerY, zoom, color, stretch = 1) {
  ctx.fillStyle = color;
  for (const { x, y, width, height } of pixelRects(bars, centerX, centerY, zoom)) {
    fillDisplayRect(ctx, x, y, width, height, Math.round(centerX), stretch);
  }
}

// Complete the outline layer before any colored pixels. Touching pieces then
// cover each other's inner outline while separated pieces retain their border.
export function paintPreviewBars(ctx, bars, centerX, centerY, zoom, outlineMode, color, stretch = 1) {
  paintBarOutlines(ctx, bars, centerX, centerY, zoom, outlineMode, stretch);
  paintBarFills(ctx, bars, centerX, centerY, zoom, color, stretch);
}
