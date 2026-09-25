import { decodeCrosshair, consoleCommands } from './crosshair.js';

const exampleCode = 'CSGO-uQPmY-jAqPO-O4O2C-Gj299-BzuKG';
const input = document.querySelector('#share-code');
const message = document.querySelector('#code-message');
const commands = document.querySelector('#commands');
const copy = document.querySelector('#copy');
const badge = document.querySelector('#version-badge');
const details = document.querySelector('#details');
const count = document.querySelector('#command-count');
const canvas = document.querySelector('#preview');

function renderPreview(c) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!c) return;

  const scale = Math.min(3, 960 / Math.max(1, c.screenHeight));
  const length = Math.max(0, c.length * scale);
  const thickness = Math.max(1, c.thickness * scale);
  const gap = c.gap * scale;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const color = `rgba(${c.red}, ${c.green}, ${c.blue}, ${c.alpha / 255})`;
  const bars = [];
  const start = gap + thickness / 2;
  if (c.style === 6) {
    bars.push([centerX - thickness / 2, centerY - thickness / 2, thickness, thickness]);
  } else if (c.style === 3) {
    // Static circle: approximate the in-game shape with a pixel-scaled ring.
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.max(2, gap + length), 0, Math.PI * 2);
    ctx.lineWidth = thickness;
    if (c.outlineMode) { ctx.strokeStyle = '#061014'; ctx.lineWidth = thickness + 2; ctx.stroke(); ctx.lineWidth = thickness; }
    ctx.strokeStyle = color;
    ctx.stroke();
  } else if (c.style === 8) {
    const side = Math.max(2, 2 * (gap + length));
    ctx.strokeStyle = c.outlineMode ? '#061014' : color;
    ctx.lineWidth = thickness + (c.outlineMode ? 2 : 0);
    ctx.strokeRect(centerX - side / 2, centerY - side / 2, side, side);
    if (c.outlineMode) { ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.strokeRect(centerX - side / 2, centerY - side / 2, side, side); }
  } else {
    bars.push([centerX - thickness / 2, centerY + start, thickness, length]);
    if (!c.tStyle) bars.push([centerX - thickness / 2, centerY - start - length, thickness, length]);
    bars.push([centerX + start, centerY - thickness / 2, length, thickness]);
    bars.push([centerX - start - length, centerY - thickness / 2, length, thickness]);
  }
  if (c.dot && c.style !== 6) bars.push([centerX - thickness / 2, centerY - thickness / 2, thickness, thickness]);

  for (const [x, y, width, height] of bars) {
    if (c.outlineMode === 1) {
      ctx.fillStyle = '#061014';
      ctx.fillRect(Math.round(x - 1), Math.round(y - 1), Math.ceil(width + 2), Math.ceil(height + 2));
    } else if (c.outlineMode === 2) {
      ctx.fillStyle = '#061014';
      ctx.fillRect(Math.round(x - 1), Math.round(y - 1), Math.ceil(width + 1), Math.ceil(height + 1));
    }
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.ceil(width)), Math.max(1, Math.ceil(height)));
  }
}

function renderDetails(c) {
  const items = [
    ['STYLE', c.style], ['LENGTH', `${c.length} px`], ['THICKNESS', `${c.thickness} px`],
    ['GAP', `${c.gap} px`], ['OUTLINE', ['ปิด', 'เต็ม', 'ครึ่ง'][c.outlineMode]],
    ['CENTER DOT', c.dot ? 'เปิด' : 'ปิด'], ['T STYLE', c.tStyle ? 'เปิด' : 'ปิด'],
    ['RECOIL', c.recoil ? 'เปิด' : 'ปิด'], ['COLOR', `rgb(${c.red}, ${c.green}, ${c.blue})`],
    ['ALPHA', c.alpha], ['SCREEN HEIGHT', `${c.screenHeight} px`], ['SPREAD LIMIT', c.spreadLimit],
  ];
  details.replaceChildren(...items.map(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'detail';
    const name = document.createElement('span');
    name.textContent = label;
    const data = document.createElement('strong');
    data.textContent = value;
    item.append(name, data);
    return item;
  }));
}

function update() {
  const value = input.value.trim();
  if (!value) {
    message.textContent = 'วางรหัสที่คัดลอกจาก Settings → Crosshair/Scopes → Share';
    message.classList.remove('error', 'success');
    commands.value = '';
    copy.disabled = true;
    badge.textContent = 'รอรหัส';
    count.textContent = '0 COMMANDS';
    details.innerHTML = '<p class="empty-details">รายละเอียดจะปรากฏหลังใส่รหัส</p>';
    renderPreview(null);
    return;
  }
  try {
    const c = decodeCrosshair(value);
    commands.value = consoleCommands(c);
    copy.disabled = false;
    badge.textContent = `CODE V${c.version}`;
    count.textContent = `${commands.value.split(';').length} COMMANDS`;
    message.textContent = `ถอดรหัสสำเร็จ · รุ่น ${c.version} · ความสูงจอที่บันทึกในรหัส ${c.screenHeight}px`;
    message.classList.remove('error');
    message.classList.add('success');
    renderPreview(c);
    renderDetails(c);
  } catch (error) {
    commands.value = '';
    copy.disabled = true;
    badge.textContent = 'รหัสไม่พร้อม';
    count.textContent = '0 COMMANDS';
    message.textContent = error.message;
    message.classList.remove('success');
    message.classList.add('error');
    details.innerHTML = '<p class="empty-details">ตรวจสอบรหัสแล้วลองอีกครั้ง</p>';
    renderPreview(null);
  }
}

input.addEventListener('input', update);
document.querySelector('#example').addEventListener('click', () => { input.value = exampleCode; update(); input.focus(); });
copy.addEventListener('click', async () => {
  let copied = false;
  try {
    await navigator.clipboard.writeText(commands.value);
    copied = true;
  } catch {
    commands.select();
    copied = document.execCommand('copy');
  }
  copy.textContent = copied ? 'คัดลอกแล้ว ✓' : 'คัดลอกไม่สำเร็จ';
  setTimeout(() => { copy.textContent = 'คัดลอกคำสั่ง'; }, 1800);
});

const queryCode = new URLSearchParams(location.search).get('code');
if (queryCode) input.value = queryCode;
update();
