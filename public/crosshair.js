const ALPHABET = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789';
const CODE_PATTERN = /^CSGO-(.{5})-(.{5})-(.{5})-(.{5})-(.{5})$/;
const NEW_CODE_PATTERN = /^CS(.{44})$/;

function decodeError(code, message, params = {}) {
  return Object.assign(new Error(message), { code, params });
}

export function decodeCrosshair(input) {
  const code = input.trim();
  if (code.startsWith('CS') && !code.startsWith('CSGO-')) return decodeNewCrosshair(code);
  const match = CODE_PATTERN.exec(code);
  if (!match) throw decodeError('errorFormat', 'รูปแบบรหัสไม่ถูกต้อง');

  const digits = match.slice(1).join('');
  let value = 0n;
  for (const character of [...digits].reverse()) {
    const digit = ALPHABET.indexOf(character);
    if (digit < 0) throw decodeError('errorCharacter', 'รหัสมีอักขระที่ใช้ไม่ได้ กรุณาคัดลอกจากเกมอีกครั้ง');
    value = value * 57n + BigInt(digit);
  }
  if (value >= (1n << 144n)) throw decodeError('errorRange', 'รหัสอยู่นอกช่วงข้อมูล crosshair');

  const bytes = new Uint8Array(18);
  for (let i = 17; i >= 0; i--) {
    bytes[i] = Number(value & 255n);
    value >>= 8n;
  }
  const checksum = bytes.slice(1).reduce((sum, byte) => sum + byte, 0) & 255;
  if (bytes[0] !== checksum) throw decodeError('errorChecksum', 'Checksum ไม่ตรง: รหัสอาจพิมพ์ผิดหรือไม่ใช่ crosshair code');
  if (bytes[1] === 1) throw decodeError('errorOld', 'รหัสนี้เป็นรูปแบบเก่า (v1) เกมรุ่นใหม่ไม่รับโดยตรง ต้องแปลงเป็นรหัสรุ่น 4 ก่อน');
  if (bytes[1] !== 3 && bytes[1] !== 4) throw decodeError('errorVersion', `ยังไม่รองรับรหัสรุ่น ${bytes[1]}`, { version: bytes[1] });

  const packed = (bytes[10] | (bytes[11] << 8) | (bytes[12] << 16) | (bytes[13] << 24)) >>> 0;
  const version = bytes[1];
  const outlineMode = version === 4 ? (packed >>> 28) & 3 : Number(Boolean(bytes[2] & 0x20));
  if (outlineMode > 2) throw decodeError('errorOutline', 'รหัสมีค่า outline ที่ไม่รองรับ');
  const result = {
    code,
    version,
    style: bytes[2] & 15,
    recoil: Boolean(bytes[2] & 0x10),
    dot: Boolean(bytes[2] & 0x40),
    tStyle: Boolean(bytes[2] & 0x80),
    outlineMode,
    red: bytes[3], green: bytes[4], blue: bytes[5], alpha: bytes[6],
    gap: bytes[7], length: bytes[8], spreadLimit: bytes[9],
    splitDistance: packed & 127,
    innerAlpha: ((packed >>> 7) & 31) / 20,
    outerAlpha: (((packed >>> 12) & 15) + 6) / 20,
    splitRatio: ((packed >>> 16) & 127) / 100,
    thickness: (packed >>> 23) & 31,
    screenHeight: bytes[14] | (bytes[15] << 8),
  };
  if (result.style > (version === 4 ? 8 : 7)) throw decodeError('errorStyle', 'รหัสมีค่า style ที่ไม่รองรับ');
  return result;
}

function decodeNewCrosshair(code) {
  const match = NEW_CODE_PATTERN.exec(code);
  if (!match) throw decodeError('errorFormat', 'รูปแบบรหัสไม่ถูกต้อง');
  let value = 0n;
  for (const character of [...match[1]].reverse()) {
    const digit = ALPHABET.indexOf(character);
    if (digit < 0) throw decodeError('errorCharacter', 'รหัสมีอักขระที่ใช้ไม่ได้');
    value = value * 57n + BigInt(digit);
  }
  if (value >= (1n << 256n)) throw decodeError('errorRange', 'รหัสอยู่นอกช่วงข้อมูล crosshair');
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(value & 255n);
    value >>= 8n;
  }
  const checksum = bytes.slice(1).reduce((sum, byte) => sum + byte, 0) & 255;
  if (bytes[0] !== checksum) throw decodeError('errorChecksum', 'Checksum ไม่ตรง');
  if (bytes[1] !== 1) throw decodeError('errorVersion', `ยังไม่รองรับรหัสรุ่น ${bytes[1]}`, { version: bytes[1] });

  // The 30 September container stores scope and dynamic settings after byte 18.
  // Their nonzero layout has not been verified. Reject it so copy never emits
  // plausible but incomplete console commands.
  if (bytes[15] !== 0 || bytes.slice(19).some(Boolean)) {
    throw decodeError('errorNewFields', 'รหัสนี้มีค่ารูปแบบใหม่ที่ยังถอดไม่ได้ครบ');
  }
  const style = bytes[4] & 31;
  const outlineMode = bytes[13] >>> 6;
  if (style > 8) throw decodeError('errorStyle', 'รหัสมีค่า style ที่ไม่รองรับ');
  if (outlineMode > 2) throw decodeError('errorOutline', 'รหัสมีค่า outline ที่ไม่รองรับ');
  return {
    code, format: 'CS', version: 1, style, outlineMode,
    recoil: Boolean(bytes[4] & 0x20), dot: Boolean(bytes[4] & 0x40),
    tStyle: Boolean(bytes[4] & 0x80),
    red: bytes[5], green: bytes[6], blue: bytes[7], alpha: bytes[8],
    outlineColor: { red: bytes[9], green: bytes[10], blue: bytes[11], alpha: bytes[12] },
    thickness: bytes[13] & 63, gap: bytes[14], length: bytes[16],
    spreadLimit: bytes[17], splitDistance: bytes[18],
    innerAlpha: 0, outerAlpha: 0.3, splitRatio: 0,
    screenHeight: bytes[2] | (bytes[3] << 8),
  };
}

export function consoleCommands(crosshair) {
  const c = crosshair;
  const rows = [
    ['cl_crosshairstyle', c.style],
    ['cl_crosshair_drawoutline', c.outlineMode],
    ['cl_crosshair_length', c.length],
    ['cl_crosshair_thickness', c.thickness],
    ['cl_crosshair_gap', c.gap],
    ['cl_crosshairdot', Number(c.dot)],
    ['cl_crosshair_t', Number(c.tStyle)],
    ['cl_crosshair_recoil', Number(c.recoil)],
    ['cl_crosshaircolor_r', c.red],
    ['cl_crosshaircolor_g', c.green],
    ['cl_crosshaircolor_b', c.blue],
    ['cl_crosshaircolor_a', c.alpha],
    ...(c.outlineColor ? [
      ['cl_crosshairoutline_r', c.outlineColor.red],
      ['cl_crosshairoutline_g', c.outlineColor.green],
      ['cl_crosshairoutline_b', c.outlineColor.blue],
      ['cl_crosshairoutline_a', c.outlineColor.alpha],
    ] : []),
    ['cl_crosshair_screen_height', c.screenHeight],
    ['cl_crosshair_dynamic_spread_limit', c.spreadLimit],
    ['cl_crosshair_dynamic_splitdist', c.splitDistance],
    ['cl_crosshair_dynamic_splitalpha_innermod', c.innerAlpha],
    ['cl_crosshair_dynamic_splitalpha_outermod', c.outerAlpha],
    ['cl_crosshair_dynamic_maxdist_splitratio', c.splitRatio],
  ];
  return rows.map(([name, setting]) => `${name} ${setting}`).join('; ');
}
