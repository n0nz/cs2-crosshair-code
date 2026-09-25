import { decodeCrosshair, consoleCommands } from './crosshair.js';
import { previewBars, previewModes } from './preview-geometry.js';
import { t } from './i18n.js';

const exampleCode = 'CSGO-uQPmY-jAqPO-O4O2C-Gj299-BzuKG';
const input = document.querySelector('#share-code');
const message = document.querySelector('#code-message');
const commands = document.querySelector('#commands');
const copy = document.querySelector('#copy');
const badge = document.querySelector('#version-badge');
const details = document.querySelector('#details');
const count = document.querySelector('#command-count');
const canvas = document.querySelector('#preview');
const aspect = document.querySelector('#aspect-ratio');
let language = 'th';
let currentCrosshair = null;
let copyTimer;

try {
  language = localStorage.getItem('crosshair-language') === 'en' ? 'en' : 'th';
  const savedAspect = localStorage.getItem('crosshair-aspect');
  if (savedAspect in previewModes) aspect.value = savedAspect;
} catch { /* Storage may be unavailable in private browsing. */ }

function saveSetting(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Keep the current session usable. */ }
}

function clearPreview() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return null;
  const dpr = window.devicePixelRatio || 1;
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, centerX: width / 2, centerY: height / 2 };
}

function renderPreview(c) {
  const surface = clearPreview();
  if (!surface || !c) return;
  const { ctx, centerX, centerY } = surface;
  const zoom = Math.min(5, Math.max(1, 3 * 1080 / Math.max(1, c.screenHeight)));
  const stretch = previewModes[aspect.value] ?? 1;
  const color = `rgba(${c.red}, ${c.green}, ${c.blue}, ${c.alpha / 255})`;

  if (c.style === 3 || c.style === 8) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoom * stretch, zoom);
    const radius = Math.max(2, c.gap + c.length);
    ctx.beginPath();
    if (c.style === 3) ctx.arc(0, 0, radius, 0, Math.PI * 2);
    else ctx.rect(-radius, -radius, radius * 2, radius * 2);
    if (c.outlineMode) {
      ctx.strokeStyle = '#061014';
      ctx.lineWidth = Math.max(1, c.thickness) + 2;
      ctx.stroke();
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, c.thickness);
    ctx.stroke();
    ctx.restore();
  }

  if (c.style === 3 || c.style === 8) {
    if (!c.dot) return;
    const dot = previewBars({ ...c, style: 6 }, aspect.value).dot;
    drawBar(ctx, dot, centerX, centerY, zoom, c.outlineMode, color);
    return;
  }
  for (const bar of Object.values(previewBars(c, aspect.value))) {
    drawBar(ctx, bar, centerX, centerY, zoom, c.outlineMode, color);
  }
}

function drawBar(ctx, bar, centerX, centerY, zoom, outlineMode, color) {
  const x = Math.round(centerX + bar.x * zoom);
  const y = Math.round(centerY + bar.y * zoom);
  const width = Math.max(1, Math.round(bar.width * zoom));
  const height = Math.max(1, Math.round(bar.height * zoom));
  if (outlineMode === 1) {
    ctx.fillStyle = '#061014';
    ctx.fillRect(x - 1, y - 1, width + 2, height + 2);
  } else if (outlineMode === 2) {
    ctx.fillStyle = '#061014';
    ctx.fillRect(x - 1, y - 1, width + 1, height + 1);
  }
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function renderDetails(c) {
  const state = (value) => t(language, value ? 'on' : 'off');
  const items = [
    ['detailStyle', c.style], ['detailLength', `${c.length} px`], ['detailThickness', `${c.thickness} px`],
    ['detailGap', `${c.gap} px`], ['detailOutline', t(language, ['off', 'full', 'half'][c.outlineMode])],
    ['detailDot', state(c.dot)], ['detailTStyle', state(c.tStyle)],
    ['detailRecoil', state(c.recoil)], ['detailColor', `rgb(${c.red}, ${c.green}, ${c.blue})`],
    ['detailAlpha', c.alpha], ['detailScreenHeight', `${c.screenHeight} px`], ['detailSpreadLimit', c.spreadLimit],
  ];
  details.replaceChildren(...items.map(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'detail';
    const name = document.createElement('span');
    name.textContent = t(language, label);
    const data = document.createElement('strong');
    data.textContent = value;
    item.append(name, data);
    return item;
  }));
}

function emptyDetails(key) {
  const node = document.createElement('p');
  node.className = 'empty-details';
  node.textContent = t(language, key);
  details.replaceChildren(node);
}

function update() {
  const value = input.value.trim();
  if (!value) {
    currentCrosshair = null;
    message.textContent = t(language, 'inputHint');
    message.classList.remove('error', 'success');
    commands.value = '';
    copy.disabled = true;
    badge.textContent = t(language, 'waiting');
    count.textContent = t(language, 'commandCount', { count: 0 });
    emptyDetails('detailsEmpty');
    renderPreview(null);
    return;
  }
  try {
    const c = decodeCrosshair(value);
    currentCrosshair = c;
    commands.value = consoleCommands(c);
    copy.disabled = false;
    badge.textContent = t(language, 'codeVersion', { version: c.version });
    count.textContent = t(language, 'commandCount', { count: commands.value.split(';').length });
    message.textContent = t(language, 'decodeSuccess', { version: c.version, height: c.screenHeight });
    message.classList.remove('error');
    message.classList.add('success');
    renderPreview(c);
    renderDetails(c);
  } catch (error) {
    currentCrosshair = null;
    commands.value = '';
    copy.disabled = true;
    badge.textContent = t(language, 'invalid');
    count.textContent = t(language, 'commandCount', { count: 0 });
    message.textContent = error.code ? t(language, error.code, error.params) : error.message;
    message.classList.remove('success');
    message.classList.add('error');
    emptyDetails('detailsInvalid');
    renderPreview(null);
  }
}

function setLanguage(next) {
  language = next;
  document.documentElement.lang = next;
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(next, node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((node) => { node.innerHTML = t(next, node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(next, node.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => { node.setAttribute('aria-label', t(next, node.dataset.i18nAria)); });
  document.querySelector('#lang-th').setAttribute('aria-pressed', String(next === 'th'));
  document.querySelector('#lang-en').setAttribute('aria-pressed', String(next === 'en'));
  copy.textContent = t(next, 'copy');
  saveSetting('crosshair-language', next);
  update();
}

input.addEventListener('input', update);
document.querySelector('#example').addEventListener('click', () => { input.value = exampleCode; update(); input.focus(); });
document.querySelector('#lang-th').addEventListener('click', () => setLanguage('th'));
document.querySelector('#lang-en').addEventListener('click', () => setLanguage('en'));
aspect.addEventListener('change', () => {
  saveSetting('crosshair-aspect', aspect.value);
  renderPreview(currentCrosshair);
});
copy.addEventListener('click', async () => {
  let copied = false;
  try {
    await navigator.clipboard.writeText(commands.value);
    copied = true;
  } catch {
    commands.select();
    copied = document.execCommand('copy');
  }
  copy.textContent = t(language, copied ? 'copied' : 'copyFailed');
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { copy.textContent = t(language, 'copy'); }, 1800);
});

if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(() => renderPreview(currentCrosshair)).observe(canvas);
} else {
  window.addEventListener('resize', () => renderPreview(currentCrosshair));
}
const queryCode = new URLSearchParams(location.search).get('code');
if (queryCode) input.value = queryCode;
setLanguage(language);
