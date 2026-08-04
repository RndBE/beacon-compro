// @ts-nocheck
/**
 * BE-BL11 Beacon Logger — assembly split into exploded layers.
 * Geometry is a 1:1 port of BL-11 Unit.html; the model is built exactly as in
 * the unit scene, then every top-level part is routed into a wrapper group
 * (identity transform = assembled) that the skeleton animation drives.
 */
export function buildAssembly(THREE) {
  const texLoader = new THREE.TextureLoader();

const W = 0.160, D = 0.080, TOP = 0.028;
const AR = 1;                              // author space == real space
const LT = 0.0060, B = 0, WT = 0.0032, CR = 0.0055;
const TB = 0.0026;                         // top-edge roundover
const WALL_TOP = TOP - TB, FL = 0.0055;
const PLT = 0.0060;                        // mounting plate, y ∈ [-PLT, 0]
const MB = 0.0080;                         // main-board top surface
const FONT = 'Helvetica, Arial, sans-serif';
const NARROW = '"Arial Narrow", "Helvetica Neue", Helvetica, Arial, sans-serif';

const M = {
  case:    new THREE.MeshStandardMaterial({ name:'case_white',     color:0xf6f6f4, roughness:0.58, metalness:0.04 }),
  caseTop: new THREE.MeshStandardMaterial({ name:'case_top',       color:0xfbfbf9, roughness:0.52, metalness:0.04 }),
  dark:    new THREE.MeshStandardMaterial({ name:'bezel_black',    color:0x1b1e23, roughness:0.45, metalness:0.10 }),
  green:   new THREE.MeshStandardMaterial({ name:'terminal_green', color:0x2f8a3a, roughness:0.52, metalness:0.05 }),
  brass:   new THREE.MeshStandardMaterial({ name:'brass',          color:0xcf9c33, roughness:0.33, metalness:0.38 }),
  steel:   new THREE.MeshStandardMaterial({ name:'steel',          color:0xc3c7cb, roughness:0.28, metalness:0.38 }),
  nickel:  new THREE.MeshStandardMaterial({ name:'nickel',         color:0xd2d5d8, roughness:0.24, metalness:0.52 }),
  blue:    new THREE.MeshStandardMaterial({ name:'connector_blue', color:0x4a90c8, roughness:0.42, metalness:0.08 }),
  label:   new THREE.MeshStandardMaterial({ name:'label_grey',     color:0xb9b7b1, roughness:0.70, metalness:0.02 }),
  gold:    new THREE.MeshStandardMaterial({ name:'gold_contact',   color:0xd6ae57, roughness:0.30, metalness:0.60 }),
  ledR:    new THREE.MeshStandardMaterial({ name:'led_red',        color:0xc0453c, emissive:0xa61c12, emissiveIntensity:0.55, roughness:0.32 }),
};
M.caseRim = M.caseTop.clone(); M.caseRim.name = 'case_rim'; M.caseRim.side = THREE.FrontSide;

// ---- primitives ------------------------------------------------------
const box = (name, w, h, d, mat, x, y, z) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.name = name; m.position.set(x, y, z);
  return m;
};
const cyl = (name, r, h, mat, x, y, z, seg = 32) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
  m.name = name; m.position.set(x, y, z);
  return m;
};
function roundedOutline(w, d, r) {
  const s = new THREE.Shape();
  const rx = Math.min(r, w / 2), rz = Math.min(r, d / 2);
  const hw = w / 2 - rx, hd = d / 2 - rz;
  s.moveTo(-hw - rx, -hd);
  s.lineTo(-hw - rx, hd);  s.quadraticCurveTo(-hw - rx, hd + rz, -hw, hd + rz);
  s.lineTo(hw, hd + rz);   s.quadraticCurveTo(hw + rx, hd + rz, hw + rx, hd);
  s.lineTo(hw + rx, -hd);  s.quadraticCurveTo(hw + rx, -hd - rz, hw, -hd - rz);
  s.lineTo(-hw, -hd - rz); s.quadraticCurveTo(-hw - rx, -hd - rz, -hw - rx, -hd);
  return s;
}
// shape-space y maps to world -z, so every world z becomes -z here
const rectPath = (cx, cz, w, d) => {
  const p = new THREE.Path(), cy = -cz;
  p.moveTo(cx - w / 2, cy - d / 2); p.lineTo(cx - w / 2, cy + d / 2);
  p.lineTo(cx + w / 2, cy + d / 2); p.lineTo(cx + w / 2, cy - d / 2);
  p.closePath(); return p;
};
// rounded-end (pill) opening, same shape space as rectPath
const pillPath = (cx, cz, w, d) => {
  const p = new THREE.Path(), r = d / 2, sx = w / 2 - r, cy = -cz;
  p.absarc(cx + sx, cy, r, -Math.PI / 2, Math.PI / 2, false);
  p.absarc(cx - sx, cy, r, Math.PI / 2, Math.PI * 1.5, false);
  p.closePath(); return p;
};
function slab(name, w, d, h, r, mat, y, bevel = 0.0012, holes) {
  const s = roundedOutline(w, d, r);
  if (holes) holes.forEach(p => s.holes.push(p));
  const g = new THREE.ExtrudeGeometry(s, {
    depth: h - bevel * 2, bevelEnabled: bevel > 0, bevelThickness: bevel,
    bevelSize: bevel, bevelSegments: 4, curveSegments: 16,
  });
  g.rotateX(-Math.PI / 2); g.translate(0, y + bevel, 0);
  const m = new THREE.Mesh(g, mat);
  m.name = name; return m;
}
// quarter-round sweep along the shell outline: the top edge roundover,
// separate from the top plate so the port openings stay crisp
function edgeRoundover(name, w, d, r, tb, yTop, mat, seg = 10) {
  const raw = roundedOutline(w, d, r).getPoints(12);
  const P = raw.map(p => new THREE.Vector2(p.x, -p.y));
  if (P.length > 1 && P[0].distanceTo(P[P.length - 1]) < 1e-6) P.pop();
  const n = P.length, pos = [], idx = [], N = [];
  for (let i = 0; i < n; i++) {
    const a = P[(i - 1 + n) % n], b = P[(i + 1) % n];
    let nx = b.y - a.y, nz = -(b.x - a.x);
    const len = Math.hypot(nx, nz) || 1; nx /= len; nz /= len;
    if (nx * P[i].x + nz * P[i].y < 0) { nx = -nx; nz = -nz; }
    N.push([nx, nz]);
  }
  const nor = [];
  for (let i = 0; i < n; i++) for (let j = 0; j <= seg; j++) {
    const t = (j / seg) * Math.PI / 2, ct = Math.cos(t), st = Math.sin(t);
    const off = tb * (1 - ct);
    pos.push(P[i].x - N[i][0] * off, yTop - tb + tb * st, P[i].y - N[i][1] * off);
    nor.push(N[i][0] * ct, st, N[i][1] * ct);
  }
  for (let i = 0; i < n; i++) {
    const i2 = (i + 1) % n;
    for (let j = 0; j < seg; j++) {
      const a = i * (seg + 1) + j, b = i2 * (seg + 1) + j;
      idx.push(a, b + 1, b, a, a + 1, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  const m = new THREE.Mesh(g, mat);
  m.name = name; return m;
}
function pill(name, w, d, hh, mat, x, y, z) {
  const r = d / 2, sx = w / 2 - r;
  const sh = new THREE.Shape();
  sh.absarc(sx, 0, r, -Math.PI / 2, Math.PI / 2, false);
  sh.absarc(-sx, 0, r, Math.PI / 2, Math.PI * 1.5, false);
  const g = new THREE.ExtrudeGeometry(sh, { depth: hh, bevelEnabled: false, curveSegments: 14 });
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.name = name; m.position.set(x, y, z); return m;
}
// trapezoidal D-shell insert; hwRear is the +z (front) half-width
function dShell(name, hwFront, hwRear, hd, thick, mat, y) {
  const p = new THREE.Shape();
  p.moveTo(-hwFront, -hd); p.lineTo(hwFront, -hd);
  p.lineTo(hwRear, hd); p.lineTo(-hwRear, hd); p.closePath();
  const g = new THREE.ExtrudeGeometry(p, { depth: thick, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.name = name; m.position.y = y; return m;
}
function flangePlate(name, w, d, r, thick, mat, x, y, z) {
  const g = new THREE.ExtrudeGeometry(roundedOutline(w, d, r),
    { depth: thick, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.name = name; m.position.set(x, y, z); return m;
}

// ---- decals ----------------------------------------------------------
function decalMat(name, cv, rough) {
  const tex = new THREE.CanvasTexture(cv);
  tex.anisotropy = 16; tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({
    name: name + '_print', map: tex, roughness: rough || 0.62, metalness: 0.03,
    side: THREE.DoubleSide, alphaTest: 0.3,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
}
function topDecal(name, w, d, x, z, draw, cw = 256, ch = 64, lift = 0.0004) {
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
  draw(cv.getContext('2d'), cw, ch);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), decalMat(name, cv));
  m.name = name; m.rotation.x = -Math.PI / 2;
  m.position.set(x, TOP + lift, z);
  return m;
}
function logoDecal(name, file, w, imgW, imgH, x, z, lift = 0.0006, hOverride) {
  const tex = texLoader.load(file);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
  const mat = new THREE.MeshStandardMaterial({
    name: name + '_print', map: tex, roughness: 0.62, metalness: 0.03,
    side: THREE.DoubleSide, alphaTest: 0.18,
    polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hOverride || w * imgH / imgW), mat);
  m.name = name; m.rotation.x = -Math.PI / 2;
  m.position.set(x, TOP + lift, z);
  return m;
}
function fitText(g, t, cx, cy, maxW, capH, color, font, stretch) {
  g.save();
  g.fillStyle = color; g.font = font || ('bold 100px ' + NARROW);
  const m = Math.max(g.measureText(t).width, 1);
  const sy = capH / 71, sx = stretch ? maxW / m : Math.min(sy, maxW / m);
  g.translate(cx, cy); g.scale(sx, sy);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillText(t, 0, 35.5);
  g.restore();
}
const centered = (t, color) => (g, cw, ch) =>
  fitText(g, t, cw / 2, ch / 2, cw * 0.96, ch * 0.80, color || '#3b4046');

// bordered label cells; `cells` = [{t, w, fill, color}]
const cellStrip = (cells, vertical) => (g, cw, ch) => {
  const total = cells.reduce((a, c) => a + c.w, 0);
  const lw = Math.max(2, (vertical ? cw : ch) * 0.055);
  let off = 0;
  cells.forEach(c => {
    const frac = c.w / total;
    if (c.blank) { off += frac; return; }
    const x = vertical ? 0 : off * cw, y = vertical ? off * ch : 0;
    const w = vertical ? cw : frac * cw, h = vertical ? frac * ch : ch;
    if (c.fill) { g.fillStyle = c.fill; g.fillRect(x, y, w, h); }
    g.strokeStyle = '#6a6f75'; g.lineWidth = lw;
    g.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);
    fitText(g, c.t, x + w / 2, y + h / 2, w * 0.74, h * 0.44, c.color || '#26292e');
    off += frac;
  });
};
const db9Holes = (g, cw, ch) => {
  g.fillStyle = '#11202e';
  [[5, ch * 0.32, 0.88], [4, ch * 0.72, 0.70]].forEach(([n, cy, span]) => {
    const w = cw * span, x0 = (cw - w) / 2 + w / (2 * n);
    for (let i = 0; i < n; i++) {
      g.beginPath(); g.arc(x0 + i * (w / n), cy, ch * 0.13, 0, Math.PI * 2); g.fill();
    }
  });
};
const qrGlyph = (g, cw) => {
  const n = 21, c = cw / n;
  g.fillStyle = '#1b1e23';
  let seed = 20260731;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const inF = (fx, fy) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7;
    if (inF(0, 0) || inF(n - 7, 0) || inF(0, n - 7)) continue;
    if (rnd() > 0.5) g.fillRect(x * c, y * c, c * 1.02, c * 1.02);
  }
  [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([fx, fy]) => {
    g.fillRect(fx * c, fy * c, 7 * c, 7 * c);
    g.save(); g.globalCompositeOperation = 'destination-out';
    g.fillRect((fx + 1) * c, (fy + 1) * c, 5 * c, 5 * c); g.restore();
    g.fillRect((fx + 2) * c, (fy + 2) * c, 3 * c, 3 * c);
  });
};

const unit = new THREE.Group(); unit.name = 'bl11_unit';

// ---- panel feature table (traced off the printed top face) -----------
const LCD   = { x: -0.02715, z: -0.0184, w: 0.0575, d: 0.0163 };
const DB9   = { x: -0.0047, z:  0.0040 };
const USBA  = { x: -0.0050, z:  0.0213 };
const SD    = { x:  0.0667, z:  0.0049 };
const SIM   = { x:  0.0667, z:  0.0184 };
const TERM_F = { x: -0.0369, y: 0.0130, poles: 10, pitch: 0.00487 };
const TERM_L = { z: -0.0127, y: 0.0130, poles: 5,  pitch: 0.00500 };
const USBB  = { x: -0.0027, y: 0.0135 };
const NET   = { x:  0.0124, y: 0.0140 };
const SMA   = [{ z: -0.0190, y: 0.0160, tag: 'gsm' }, { z: -0.0070, y: 0.0160, tag: 'gps' }];

// =====================================================================
// 1 — MOUNTING PLATE
// =====================================================================
{
  const pw = W + 0.0020, pd = D + 0.0260;
  const s = roundedOutline(pw, pd, 0.0045);
  const HOLES = [];
  [-1, 1].forEach(sz => [-1, 1].forEach(sx => HOLES.push([sx * 0.0620, sz * (D / 2 + 0.0088)])));
  HOLES.forEach(([hx, hz]) => {
    const p = new THREE.Path();
    p.absellipse(hx, -hz, 0.0025, 0.0025, 0, Math.PI * 2, true);
    s.holes.push(p);
  });
  const g = new THREE.ExtrudeGeometry(s, { depth: PLT, bevelEnabled: false, curveSegments: 16 });
  g.rotateX(-Math.PI / 2); g.translate(0, -PLT, 0);
  const m = new THREE.Mesh(g, M.case);
  m.name = 'mount_plate'; unit.add(m);
  HOLES.forEach(([hx, hz], i) => {
    const cs = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0046, 0.0025, 0.0026, 24, 1, true), M.case);
    cs.name = 'mount_countersink_' + (i + 1);
    cs.position.set(hx, -0.0013, hz);
    unit.add(cs);
  });
}

// =====================================================================
// 2 — UNIBODY SHELL: floor, walls, corner posts (no outside lid seam)
// =====================================================================
unit.add(slab('case_shell_floor', W, D, FL, CR, M.caseTop, 0, 0));

function panel(name, span, y0, y1, holes) {
  const s = new THREE.Shape();
  s.moveTo(-span / 2, y0); s.lineTo(span / 2, y0);
  s.lineTo(span / 2, y1);  s.lineTo(-span / 2, y1); s.closePath();
  (holes || []).forEach(h => {
    const p = new THREE.Path();
    if (h.r) { p.absarc(h.x, h.y, h.r, 0, Math.PI * 2, true); }
    else {
      p.moveTo(h.x - h.w / 2, h.y - h.h / 2); p.lineTo(h.x - h.w / 2, h.y + h.h / 2);
      p.lineTo(h.x + h.w / 2, h.y + h.h / 2); p.lineTo(h.x + h.w / 2, h.y - h.h / 2);
      p.closePath();
    }
    s.holes.push(p);
  });
  const g = new THREE.ExtrudeGeometry(s, { depth: WT, bevelEnabled: false });
  const m = new THREE.Mesh(g, M.caseTop);
  m.name = name; return m;
}
const SPAN_X = W - CR * 2, SPAN_Z = D - CR * 2;

// front wall (+z): field terminal, USB-B, NET indicator
{
  const p = panel('wall_front', SPAN_X, 0, WALL_TOP, [
    { x: TERM_F.x, y: TERM_F.y, w: TERM_F.poles * TERM_F.pitch + 0.0006, h: 0.0106 },
    { x: USBB.x, y: USBB.y, w: 0.0130, h: 0.0136 },
    { x: NET.x,  y: NET.y,  w: 0.0050, h: 0.0060 },
  ]);
  p.position.z = D / 2 - WT; unit.add(p);
}
// rear wall (-z)
{ const p = panel('wall_rear', SPAN_X, 0, WALL_TOP); p.position.z = -D / 2; unit.add(p); }
// left wall (-x): 5-pole power / control terminal (local +x maps to world -z)
{
  const p = panel('wall_left', SPAN_Z, 0, WALL_TOP, [
    { x: -TERM_L.z, y: TERM_L.y, w: TERM_L.poles * TERM_L.pitch + 0.0006, h: 0.0106 },
  ]);
  p.rotation.y = Math.PI / 2; p.position.x = -W / 2; unit.add(p);
}
// right wall (+x): GSM + GPS SMA glands (local +x maps to world +z)
{
  const p = panel('wall_right', SPAN_Z, 0, WALL_TOP,
    SMA.map(s => ({ x: s.z, y: s.y, r: 0.0024 })));
  p.rotation.y = -Math.PI / 2; p.position.x = W / 2; unit.add(p);
}
[[1, 1, -Math.PI / 2], [1, -1, 0], [-1, -1, Math.PI / 2], [-1, 1, Math.PI]]
  .forEach(([sx, sz, a0], i) => {
    const cx = sx * (W / 2 - CR), cz = sz * (D / 2 - CR);
    const s = new THREE.Shape();
    s.moveTo(cx, -cz);
    s.absellipse(cx, -cz, CR, CR, a0, a0 + Math.PI / 2, false);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: WALL_TOP, bevelEnabled: false, curveSegments: 12 });
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, M.caseTop);
    m.name = 'corner_post_' + (i + 1); unit.add(m);
  });

// =====================================================================
// 3 — TOP FACE (display window + every panel port opening)
// =====================================================================
const win = (x, z, w, d) => rectPath(x, z, w, d);
unit.add(slab('case_top_face', W - TB * 2, D - TB * 2, LT, CR - TB, M.caseTop, TOP - LT, B, [
  win(LCD.x, LCD.z, LCD.w, LCD.d),
  win(USBA.x, USBA.z, 0.0152, 0.0080),
  pillPath(SD.x, SD.z, 0.0164, 0.0034),
  pillPath(SIM.x, SIM.z, 0.0160, 0.0034),
  win(DB9.x, DB9.z, 0.0180, 0.0078),
]));
unit.add(edgeRoundover('case_top_edge', W, D, CR, TB, TOP, M.caseRim));

// =====================================================================
// 4 — CHARACTER LCD (16×2, olive STN, backlight on, idle screen)
// =====================================================================
const lcdAsm = new THREE.Group(); lcdAsm.name = 'lcd_module_assembly';
{
  lcdAsm.add(box('lcd_module', LCD.w + 0.0010, 0.0100, LCD.d + 0.0010, M.dark,
    LCD.x, TOP - 0.0004 - 0.0050, LCD.z));
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 290;
  const g = cv.getContext('2d');
  g.fillStyle = '#a8b483'; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = 'rgba(70,86,44,0.045)';
  for (let c = 0; c < 16; c++) for (let r = 0; r < 2; r++) {
    const x0 = 22 + c * 62.44, y0 = 22 + r * 136;
    for (let dx = 0; dx < 5; dx++) for (let dy = 0; dy < 8; dy++)
      g.fillRect(x0 + dx * 9.0, y0 + dy * 14.0, 7.4, 12.0);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
  const mat = new THREE.MeshStandardMaterial({
    name: 'lcd_screen', map: tex, emissiveMap: tex, emissive: 0xffffff,
    emissiveIntensity: 0.30, roughness: 0.30, metalness: 0,
  });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(LCD.w, LCD.d), mat);
  scr.name = 'lcd_screen'; scr.rotation.x = -Math.PI / 2;
  scr.position.set(LCD.x, TOP + 0.0001, LCD.z);
  lcdAsm.add(scr);
}

// =====================================================================
// 5 — TOP-FACE PORTS
// =====================================================================
// board-mounted ports live in this group so they appear both inside the
// enclosure and on the standalone board stack.
const boardPorts = new THREE.Group(); boardPorts.name = 'board_ports';
boardPorts.add(box('usb_a_shell',  0.0150, 0.0140, 0.0078, M.steel, USBA.x, TOP - 0.0078, USBA.z));
boardPorts.add(box('usb_a_cavity', 0.0128, 0.0120, 0.0058, M.dark,  USBA.x, TOP - 0.0064, USBA.z));
boardPorts.add(topDecal('usb_a_insert', 0.0124, 0.0054, USBA.x, USBA.z, (g, cw, ch) => {
  g.fillStyle = '#dad7d0';
  g.fillRect(0, ch * 0.44, cw, ch * 0.40);
  g.fillStyle = '#c9a95f';
  for (let i = 0; i < 4; i++) g.fillRect(cw * (0.17 + i * 0.185), ch * 0.48, cw * 0.08, ch * 0.30);
  g.fillStyle = '#8d8a84'; g.fillRect(0, ch * 0.84, cw, ch * 0.05);
}, 244, 100, -0.0003));
// micro-SD and SIM push-push slots — rounded-end holders and slot mouths
[['sd', SD, 0.0158], ['sim', SIM, 0.0154]].forEach(([tag, P, w]) => {
  boardPorts.add(pill(tag + '_holder', w + 0.0014, 0.0040, 0.0090, M.steel, P.x, TOP - 0.0103, P.z));
  boardPorts.add(pill(tag + '_slot',   w, 0.0022, 0.0040, M.dark,  P.x, TOP - 0.0042, P.z));
});
// PORT I/O — DE-9 female, nickel flange, brass jack screws
{
  const g = new THREE.Group(); g.name = 'port_io_db9';
  g.add(box('db9_riser', 0.0190, 0.0080, 0.0084, M.steel, 0, TOP - 0.0044, 0));
  g.add(flangePlate('db9_flange', 0.0291, 0.0092, 0.0012, 0.0011, M.nickel, 0, TOP + 0.0001, 0));
  g.add(dShell('db9_insert', 0.0062, 0.0078, 0.0031, 0.0014, M.blue, TOP + 0.0011));
  [-1, 1].forEach((s, i) => {
    g.add(cyl('db9_jackscrew_' + (i + 1), 0.0024, 0.0028, M.brass, s * 0.0121, TOP + 0.0014, 0, 20));
    g.add(cyl('db9_jackscrew_bore_' + (i + 1), 0.0010, 0.0006, M.dark, s * 0.0121, TOP + 0.0027, 0, 14));
  });
  g.position.set(DB9.x, 0, DB9.z);
  unit.add(g);
  unit.add(topDecal('print_db9_pins', 0.0108, 0.0050, DB9.x, DB9.z - 0.0003,
    db9Holes, 240, 114, 0.0026));
}

// =====================================================================
// 6 — WALL PORTS
// =====================================================================
function pinHeader(name, poles, pitch) {
  const g = new THREE.Group(); g.name = name;
  const L = poles * pitch, HH = 0.0078, DP = 0.0062;
  g.add(box(name + '_body', L, HH, DP, M.green, 0, 0, -DP / 2 + 0.0008));
  for (let i = 0; i < poles; i++) {
    const px = -L / 2 + pitch / 2 + i * pitch;
    g.add(box(name + '_channel_' + (i + 1), pitch * 0.66, 0.0042, 0.0018, M.dark, px, -0.0008, 0.0002));
    g.add(box(name + '_pin_' + (i + 1), 0.0008, 0.0008, 0.0034, M.steel, px, -0.0008, -0.0014));
  }
  [-1, 1].forEach((s, i) => {
    g.add(box(name + '_latch_' + (i + 1), 0.0020, 0.0022, 0.0044, M.green,
      s * (L / 2 - 0.0010), HH / 2 + 0.0010, -0.0016));
  });
  return g;
}
{
  const f = pinHeader('term_front', TERM_F.poles, TERM_F.pitch);
  f.position.set(TERM_F.x, TERM_F.y, D / 2);
  unit.add(f);
  const l = pinHeader('term_left', TERM_L.poles, TERM_L.pitch);
  l.rotation.y = -Math.PI / 2;
  l.position.set(-W / 2, TERM_L.y, TERM_L.z);
  unit.add(l);
}
// USB type-B device port
{
  const g = new THREE.Group(); g.name = 'usb_b_port';
  g.add(box('usb_b_shell', 0.0124, 0.0130, 0.0180, M.steel, 0, 0, -0.0090));
  g.add(box('usb_b_mouth', 0.0098, 0.0100, 0.0034, M.dark,  0, 0, -0.0012));
  g.add(box('usb_b_insert', 0.0072, 0.0018, 0.0018, M.label, 0, 0.0026, -0.0018));
  g.position.set(USBB.x, USBB.y, D / 2);
  unit.add(g);
}
// NET status LED in a rectangular panel bezel
{
  const g = new THREE.Group(); g.name = 'net_led';
  g.add(box('net_bezel', 0.0050, 0.0060, 0.0060, M.dark, 0, 0, -0.0030));
  const lens = cyl('net_lens', 0.0014, 0.0016, M.ledR, 0, 0, -0.0004, 18);
  lens.rotation.x = Math.PI / 2; g.add(lens);
  g.position.set(NET.x, NET.y, D / 2);
  unit.add(g);
}
// SMA antenna bulkheads (GSM, GPS)
SMA.forEach(({ z, y, tag }) => {
  const g = new THREE.Group(); g.name = 'sma_' + tag + '_port';
  const barrel = cyl('sma_' + tag + '_barrel', 0.0036, 0.0092, M.brass, 0.0046, 0, 0, 24);
  barrel.rotation.z = Math.PI / 2; g.add(barrel);
  const nut = cyl('sma_' + tag + '_nut', 0.0047, 0.0036, M.brass, 0.0018, 0, 0, 6);
  nut.rotation.z = Math.PI / 2; g.add(nut);
  const throat = cyl('sma_' + tag + '_throat', 0.0020, 0.0092, M.dark, 0.0045, 0, 0, 20);
  throat.rotation.z = Math.PI / 2; g.add(throat);
  const pin = cyl('sma_' + tag + '_pin', 0.0008, 0.0042, M.steel, 0.0070, 0, 0, 12);
  pin.rotation.z = Math.PI / 2; g.add(pin);
  g.position.set(W / 2, y, z);
  unit.add(g);
});

// =====================================================================
// 7 — PANEL PRINTING
// =====================================================================
const R = '#c8202a';

// engraved panel frame: Z-stepped ribbon around the display, wordmark and
// model code sitting in its notches, rounded display surround inside
const FR = { x: -0.0599, w: 0.0655, z: -0.0355, d: 0.0377 };
unit.add(topDecal('print_panel_frame', 0.0700, 0.0420, FR.x + FR.w / 2, FR.z + FR.d / 2,
  (g, cw, ch) => {
    const X = t => (0.0321 + t * 0.9357) * cw;
    const Y = t => (0.0512 + t * 0.8976) * ch;
    g.strokeStyle = '#7a8086'; g.lineWidth = 6; g.lineJoin = 'miter';
    g.beginPath();
    g.moveTo(X(0), Y(0));
    g.lineTo(X(0.745), Y(0));
    g.lineTo(X(0.824), Y(0.150));
    g.lineTo(X(1), Y(0.150));
    g.lineTo(X(1), Y(0.775));
    g.lineTo(X(0.640), Y(0.775));
    g.lineTo(X(0.582), Y(1));
    g.lineTo(X(0), Y(1));
    g.closePath(); g.stroke();
    const dx0 = X(0.0275), dx1 = X(0.9725), dy0 = Y(0.179), dy1 = Y(0.728), r = 14;
    g.beginPath();
    g.moveTo(dx0 + r, dy0);
    g.lineTo(dx1 - r, dy0); g.quadraticCurveTo(dx1, dy0, dx1, dy0 + r);
    g.lineTo(dx1, dy1 - r); g.quadraticCurveTo(dx1, dy1, dx1 - r, dy1);
    g.lineTo(dx0 + r, dy1); g.quadraticCurveTo(dx0, dy1, dx0, dy1 - r);
    g.lineTo(dx0, dy0 + r); g.quadraticCurveTo(dx0, dy0, dx0 + r, dy0);
    g.closePath(); g.stroke();
    fitText(g, 'BEACON LOGGER', X(0.0275 + 0.44 / 2), Y(0.083), 0.44 * 0.9357 * cw,
      0.075 * 0.8976 * ch, '#3a3f45', '100px ' + FONT, true);
    fitText(g, 'BL-11', X(0.882), Y(0.086), 0.131 * 0.9357 * cw,
      0.067 * 0.8976 * ch, '#3a3f45', 'bold 100px ' + FONT);
  }, 1400, 840, 0.0004));

// port legends
unit.add(topDecal('print_port_io', 0.0118, 0.0032, DB9.x, -0.0035, centered('PORT I/O'), 300, 82));
unit.add(topDecal('print_type_a', 0.0105, 0.0032, -0.0060, 0.0139, centered('TYPE A'), 270, 82));
unit.add(topDecal('print_sd_card', 0.0115, 0.0030, 0.0646, 0.0004, centered('SD CARD'), 300, 78));
unit.add(topDecal('print_sim_card', 0.0128, 0.0030, 0.0654, 0.0139, centered('SIM CARD'), 330, 78));
unit.add(topDecal('print_gsm', 0.0064, 0.0050, 0.0678, -0.0214, cellStrip([{ t: 'GSM', w: 1 }]), 150, 116));
unit.add(topDecal('print_gps', 0.0064, 0.0050, 0.0678, -0.0094, cellStrip([{ t: 'GPS', w: 1 }]), 150, 116));

// left-hand power / control rail — cells run rear (24V) to front (RST)
unit.add(topDecal('print_rail_left', 0.0055, 0.0260, -0.0731, TERM_L.z, cellStrip([
  { t: '24V', w: 1, color: R }, { t: '5V', w: 1, color: R },
  { t: 'S1', w: 1 }, { t: 'G', w: 1 }, { t: 'RST', w: 1 },
], true), 122, 576));

// front rail — 10 field poles, then the USB cell
unit.add(topDecal('print_rail_front', 0.0687, 0.0049, -0.0271, 0.0339, cellStrip([
  { t: 'A1', w: 57 }, { t: 'A2', w: 57 }, { t: 'D1', w: 57 }, { t: 'D2', w: 57 },
  { t: 'Tx', w: 57 }, { t: 'Rx', w: 57 }, { t: 'A', w: 57 }, { t: 'B', w: 57 },
  { t: '+', w: 57, fill: '#c8202a', color: '#ffffff' },
  { t: '–', w: 60, fill: '#22262f', color: '#ffffff' },
  { t: 'USB', w: 232 },
]), 1880, 134));
unit.add(topDecal('print_net', 0.0055, 0.0049, NET.x, 0.0339, cellStrip([{ t: 'NET', w: 1 }]), 150, 134));

// STESY co-brand and the Beacon Engineering asset label
unit.add(logoDecal('logo_stesy', '/images/logger/logo-stesy.png', 0.0242, 401, 128,
  -0.0402, -0.0033, 0.0006, 0.0073));
const STICK = { x: 0.0511, z: 0.0294, w: 0.0475, d: 0.0130 };
unit.add(topDecal('label_beacon_sticker', STICK.w, STICK.d, STICK.x, STICK.z, (g, cw, ch) => {
  const u = t => (0.014 + t * 0.972) * cw, v = t => (0.045 + t * 0.910) * ch;
  g.fillStyle = '#fcfcfa'; g.fillRect(0, 0, cw, ch);
  g.strokeStyle = '#4a4f55'; g.lineWidth = 8; g.lineJoin = 'miter';
  g.beginPath();
  g.moveTo(u(0), v(0.009));
  g.lineTo(u(0.446), v(0.009));
  g.lineTo(u(0.476), v(0.104));
  g.lineTo(u(1), v(0.104));
  g.lineTo(u(1), v(1));
  g.lineTo(u(0.283), v(1));
  g.lineTo(u(0.253), v(0.887));
  g.lineTo(u(0), v(0.874));
  g.closePath(); g.stroke();
  g.strokeStyle = '#3d5c9c'; g.lineWidth = 7;
  g.lineJoin = 'round'; g.lineCap = 'round';
  const spikes = [0.10, -0.26, 0.42, -0.60, 0.86, -1.00, 0.92, -0.70, 0.54, -0.34, 0.20, -0.11, 0.05];
  g.beginPath();
  g.moveTo(u(0.056), v(0.42));
  g.lineTo(u(0.078), v(0.42));
  spikes.forEach((a, i) => g.lineTo(u(0.082 + i * 0.0128), v(0.42 - a * 0.26)));
  g.lineTo(u(0.252), v(0.42));
  g.lineTo(u(0.258), v(0.42));
  g.stroke();
  g.strokeStyle = '#4a4f55'; g.lineWidth = 7;
  g.beginPath(); g.moveTo(u(0.790), v(0.160)); g.lineTo(u(0.790), v(0.800)); g.stroke();
  g.save(); g.translate(u(0.812), v(0.242));
  qrGlyph(g, 0.148 * 0.972 * cw); g.restore();
  fitText(g, 'made in Indonesia', u(0.805), v(0.905), 0.29 * 0.972 * cw, 32, '#3b4046',
    'italic 100px ' + FONT);
}, 1425, 390, 0.0004));
unit.add(logoDecal('logo_beacon', '/images/logger/logo-beacon.png', 0.0221, 2360, 626,
  STICK.x + 0.0018, STICK.z + 0.0004, 0.0008, 0.0055));

// =====================================================================
// 8 — INTERNALS (single main board + LCD carrier + port mezzanines)
// Entry-level stack: everything rides one board, no interface daughtercard.
// =====================================================================
const PCB_T = 0.0016, LCDT = 0.0176;

M.pcb     = new THREE.MeshStandardMaterial({ name:'pcb_black', color:0x14171b, roughness:0.62, metalness:0.06 });
M.pcbK    = new THREE.MeshStandardMaterial({ name:'pcb_black', color:0x15181c, roughness:0.58, metalness:0.06 });
M.pcbGrn  = new THREE.MeshStandardMaterial({ name:'pcb_green', color:0x1c6a34, roughness:0.52, metalness:0.05 });
M.pcbTeal = new THREE.MeshStandardMaterial({ name:'pcb_teal',  color:0x1c5f77, roughness:0.52, metalness:0.06 });
M.alum   = new THREE.MeshStandardMaterial({ name:'cap_alu',   color:0xc9ccd0, roughness:0.30, metalness:0.55 });
M.blackP = new THREE.MeshStandardMaterial({ name:'black_part', color:0x14161a, roughness:0.55, metalness:0.05 });
M.red    = new THREE.MeshStandardMaterial({ name:'switch_red', color:0xb02a2a, roughness:0.45, metalness:0.04 });
M.smd    = new THREE.MeshStandardMaterial({ name:'smd_body',     color:0x201f1d, roughness:0.52, metalness:0.06 });
M.smdR   = new THREE.MeshStandardMaterial({ name:'smd_resistor', color:0x2b2622, roughness:0.48, metalness:0.06 });
M.smdC   = new THREE.MeshStandardMaterial({ name:'smd_mlcc',     color:0xa8875f, roughness:0.55, metalness:0.10 });
M.tin    = new THREE.MeshStandardMaterial({ name:'tin_plating',  color:0xcfd3d7, roughness:0.26, metalness:0.62 });
M.ledRed = new THREE.MeshStandardMaterial({ name:'led_red_smd', color:0xb8483c, emissive:0x8c1a12, emissiveIntensity:0.35, roughness:0.35 });
M.ledGrn = new THREE.MeshStandardMaterial({ name:'led_grn_smd', color:0x8fae7a, emissive:0x2c7a3a, emissiveIntensity:0.35, roughness:0.35 });

const inner = new THREE.Group(); inner.name = 'internals';
const holeAt = (x, z, r) => {
  const p = new THREE.Path();
  p.absellipse(x, -z, r, r, 0, Math.PI * 2, true);
  return p;
};
const fr4 = (name, w, d, y, mat, x, z, t = PCB_T, holes) => {
  const m = slab(name, w, d, t, 0.0025, mat, y - t, 0, holes);
  m.position.x = x; m.position.z = z; return m;
};
const standoff = (name, x, z, y0, y1, r = 0.0028) =>
  cyl(name, r, y1 - y0, M.brass, x, (y0 + y1) / 2, z, 6);
const screwHead = (name, x, y, z, r = 0.0024, sl = 0.0052) => {
  const g = new THREE.Group(); g.name = name;
  g.add(cyl(name + '_head', r, 0.0013, M.nickel, 0, y + 0.0006, 0, 20));
  g.add(box(name + '_slot_a', r * 1.3, 0.0004, 0.0006, M.steel, 0, y + 0.0013, 0));
  g.add(box(name + '_slot_b', 0.0006, 0.0004, r * 1.3, M.steel, 0, y + 0.0013, 0));
  // threaded shank below the head — visible once the layer lifts off
  g.add(cyl(name + '_shank', r * 0.50, sl, M.nickel, 0, y - sl / 2, 0, 14));
  const n = Math.max(2, Math.round(sl / 0.0011));
  for (let j = 0; j < n; j++)
    g.add(cyl(name + '_thread_' + (j + 1), r * 0.62, 0.00035, M.nickel,
      0, y - 0.0007 - j * 0.0011, 0, 14));
  g.position.set(x, 0, z); return g;
};
function chip(name, x, y, z, code, mat, rot) {
  const S = { 603:[0.0016,0.0008,0.0005], 805:[0.0020,0.0013,0.0006], 1206:[0.0032,0.0016,0.0007] }[code];
  const g = new THREE.Group(); g.name = name;
  g.add(box(name + '_body', S[0] * 0.62, S[2], S[1], mat, 0, S[2] / 2, 0));
  [-1, 1].forEach((s, i) => g.add(box(name + '_end_' + (i + 1), S[0] * 0.19, S[2] * 0.98, S[1],
    M.tin, s * S[0] * 0.405, S[2] / 2, 0)));
  g.position.set(x, y, z); if (rot) g.rotation.y = Math.PI / 2;
  return g;
}
function sot23(name, x, y, z, rot) {
  const g = new THREE.Group(); g.name = name;
  g.add(box(name + '_body', 0.0029, 0.0011, 0.0013, M.smd, 0, 0.0008, 0));
  [[-0.0009, -1], [0.0009, -1], [0, 1]].forEach(([lx, sz], i) =>
    g.add(box(name + '_lead_' + (i + 1), 0.0005, 0.0002, 0.0009, M.tin, lx, 0.0002, sz * 0.0010)));
  g.position.set(x, y, z); if (rot) g.rotation.y = Math.PI / 2;
  return g;
}
function sop(name, x, y, z, pins, w, d, rot) {
  const g = new THREE.Group(); g.name = name;
  const h = 0.0014;
  g.add(box(name + '_body', w, h, d, M.smd, 0, h / 2, 0));
  const n = pins / 2, step = d / n;
  for (let i = 0; i < n; i++) [-1, 1].forEach((s, j) =>
    g.add(box(name + '_lead_' + (i * 2 + j + 1), 0.0007, 0.0002, 0.0004, M.tin,
      s * (w / 2 + 0.0004), 0.0001, -d / 2 + step / 2 + i * step)));
  g.position.set(x, y, z); if (rot) g.rotation.y = Math.PI / 2;
  return g;
}
function qfp(name, x, y, z, side, pinsPerSide) {
  const g = new THREE.Group(); g.name = name;
  g.add(box(name + '_body', side, 0.0014, side, M.smd, 0, 0.0007, 0));
  const step = side / pinsPerSide;
  for (let i = 0; i < pinsPerSide; i++) {
    const o = -side / 2 + step / 2 + i * step;
    [-1, 1].forEach((s, j) => {
      g.add(box(name + '_lead_x' + (i * 2 + j), 0.0006, 0.0002, 0.0003, M.tin,
        s * (side / 2 + 0.0004), 0.0001, o));
      g.add(box(name + '_lead_z' + (i * 2 + j), 0.0003, 0.0002, 0.0006, M.tin,
        o, 0.0001, s * (side / 2 + 0.0004)));
    });
  }
  g.position.set(x, y, z); return g;
}
const ledSmd = (name, x, y, z, mat) => box(name, 0.0016, 0.0006, 0.0008, mat, x, y + 0.0003, z);
const via = (name, x, y, z) => cyl(name, 0.0004, 0.0002, M.gold, x, y + 0.0001, z, 10);
const pad = (name, x, y, z, r) => cyl(name, r || 0.0009, 0.00016, M.tin, x, y + 0.00008, z, 14);
function chipRun(group, name, x0, z0, n, step, code, mat, rot, y) {
  for (let i = 0; i < n; i++) {
    const x = rot ? x0 : x0 + i * step, z = rot ? z0 + i * step : z0;
    group.add(chip(name + '_' + (i + 1), x, y || MB, z, code, i % 3 === 2 ? M.smdC : mat, rot));
  }
}

// ---- board-plane silk / print decals ---------------------------------
function boardDecal(name, w, d, x, y, z, draw, cw = 256, ch = 64) {
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
  draw(cv.getContext('2d'), cw, ch);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), decalMat(name, cv));
  m.name = name; m.rotation.x = -Math.PI / 2; m.position.set(x, y, z);
  return m;
}
const silk = t => (g, cw, ch) =>
  fitText(g, t, cw / 2, ch / 2, cw * 0.96, ch * 0.70, '#dcdad3', '100px ' + NARROW);
const capVent = (g, cw, ch) => {
  g.fillStyle = '#b7bbbf';
  g.beginPath(); g.arc(cw / 2, ch / 2, cw * 0.47, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#6e7276'; g.lineWidth = cw * 0.045; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 3;
    g.beginPath(); g.moveTo(cw / 2, ch / 2);
    g.lineTo(cw / 2 + Math.cos(a) * cw * 0.40, ch / 2 + Math.sin(a) * cw * 0.40); g.stroke();
  }
  g.fillStyle = '#5c6064';
  g.beginPath(); g.arc(cw / 2, ch / 2, cw * 0.05, 0, Math.PI * 2); g.fill();
};
// radial electrolytic: printed sleeve (value + polarity stripe), vented alu top
function electrolytic(ref, val, volt, x, z, r = 0.0040, h = 0.0100) {
  const g = new THREE.Group(); g.name = ref + '_electrolytic';
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256;
  const c = cv.getContext('2d');
  c.fillStyle = '#d2d5d9'; c.fillRect(0, 0, 512, 256);
  c.fillStyle = '#22252a'; c.fillRect(396, 0, 86, 256);
  c.fillStyle = '#e9ebed';
  for (let i = 0; i < 3; i++) c.fillRect(424, 46 + i * 74, 30, 12);
  c.save(); c.translate(150, 128); c.rotate(-Math.PI / 2);
  fitText(c, val, 0, -36, 190, 62, '#191c20', 'bold 100px ' + FONT);
  fitText(c, volt, 0, 40, 168, 46, '#191c20', '100px ' + FONT);
  c.restore();
  const side = decalMat(ref + '_sleeve', cv, 0.34); side.metalness = 0.24;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28, 1),
    [side, M.alum, M.blackP]);
  body.name = ref + '_body'; body.position.set(x, MB + h / 2, z); g.add(body);
  g.add(cyl(ref + '_seat', r + 0.0003, 0.0014, M.blackP, x, MB + 0.0007, z, 28));
  g.add(boardDecal(ref + '_vent', r * 1.9, r * 1.9, x, MB + h + 0.0001, z, capVent, 128, 128));
  return g;
}
// 4-element chip array: black body, white element bars
function resArray(name, x, y, z, n = 4, rot) {
  const g = new THREE.Group(); g.name = name;
  const L = n * 0.0011 + 0.0008;
  g.add(box(name + '_body', L, 0.0009, 0.0018, M.blackP, 0, 0.00045, 0));
  for (let i = 0; i < n; i++) {
    const px = -L / 2 + 0.0006 + i * 0.0011;
    g.add(box(name + '_el_' + (i + 1), 0.0006, 0.0002, 0.0014, M.caseTop, px, 0.0010, 0));
    g.add(box(name + '_t_' + (i + 1), 0.0006, 0.0004, 0.0003, M.tin, px, 0.0002, 0.0009));
    g.add(box(name + '_b_' + (i + 1), 0.0006, 0.0004, 0.0003, M.tin, px, 0.0002, -0.0009));
  }
  g.position.set(x, y, z); if (rot) g.rotation.y = Math.PI / 2;
  return g;
}
// through-hole pin row: gold pins in plated pads
function pinRow(group, name, x0, z0, n, step, y, rot) {
  for (let i = 0; i < n; i++) {
    const x = rot ? x0 : x0 + i * step, z = rot ? z0 + i * step : z0;
    group.add(pad(name + '_pad_' + (i + 1), x, y, z, 0.0006));
    group.add(cyl(name + '_pin_' + (i + 1), 0.0003, 0.0008, M.gold, x, y + 0.0004, z, 8));
  }
}
const canPrint = (g, cw, ch) => {
  g.fillStyle = '#ccd0d3'; g.fillRect(0, 0, cw, ch);
  g.strokeStyle = '#a4a8ac'; g.lineWidth = cw * 0.016;
  g.strokeRect(cw * 0.03, ch * 0.03, cw * 0.94, ch * 0.94);
  fitText(g, 'GSM MODULE', cw * 0.44, ch * 0.20, cw * 0.62, ch * 0.10, '#292c30', 'bold 100px ' + FONT);
  g.fillStyle = '#7c8085';
  for (let i = 0; i < 7; i++) g.fillRect(cw * 0.14, ch * (0.34 + i * 0.052), cw * 0.42, ch * 0.014);
  g.save(); g.translate(cw * 0.60, ch * 0.52); qrGlyph(g, cw * 0.30); g.restore();
};

// ---- main board: blue FR4, "BL-11 GSM LTE MODULE V8" ------------------
inner.add(fr4('main_pcb', 0.1520, 0.0720, MB, M.pcb, 0, 0, PCB_T,
  [[-0.0680, -0.0300], [0.0680, -0.0300], [-0.0680, 0.0300], [0.0680, 0.0300]]
    .map(([x, z]) => holeAt(x, z, 0.0015))));
[[-0.0680, -0.0300], [0.0680, -0.0300], [-0.0680, 0.0300], [0.0680, 0.0300]]
  .forEach(([x, z], i) => {
    inner.add(cyl('pcb_boss_' + (i + 1), 0.0034, MB - FL, M.caseTop, x, (FL + MB) / 2, z, 18));
    inner.add(screwHead('pcb_screw_' + (i + 1), x, MB, z));
  });

// ---- power input stage: 24 V / 5 V buck pair, left third -------------
[['c1', '220', '35 G', -0.0700, 0.0062], ['c2', '100', '50 G', -0.0700, 0.0230],
 ['c3', '100', '50 G', -0.0330, 0.0040], ['c4', '220', '35 G', -0.0330, 0.0235]]
  .forEach(([ref, val, volt, x, z]) => inner.add(electrolytic(ref, val, volt, x, z)));
inner.add(resArray('rn1_array', -0.0596, MB, -0.0120, 4));
inner.add(resArray('rn2_array', -0.0448, MB, 0.0082, 4));
inner.add(resArray('rn3_array', -0.0330, MB, -0.0300, 4));
[['l1', -0.0552, 0.0030], ['l2', -0.0538, 0.0235]].forEach(([ref, x, z]) =>
  inner.add(box(ref + '_choke', 0.0112, 0.0058, 0.0112, M.blackP, x, MB + 0.0029, z)));
inner.add(sop('u1_buck_24v', -0.0440, MB, -0.0022, 8, 0.0054, 0.0044));
inner.add(sop('u2_buck_5v', -0.0452, MB, 0.0148, 8, 0.0054, 0.0044));
inner.add(box('sw_reset', 0.0058, 0.0032, 0.0058, M.blackP, -0.0665, MB + 0.0016, -0.0130));
inner.add(box('sw_reset_cap', 0.0030, 0.0012, 0.0030, M.red, -0.0665, MB + 0.0038, -0.0130));
inner.add(box('lcd_cable_jst', 0.0092, 0.0058, 0.0050, M.label, -0.0470, MB + 0.0029, -0.0135));
for (let i = 0; i < 4; i++)
  inner.add(box('lcd_cable_pin_' + (i + 1), 0.0006, 0.0026, 0.0006, M.tin,
    -0.0480 + i * 0.0020, MB + 0.0043, -0.0113));

// ---- digital core: MCU, crystal, line drivers, RTC coin cell ---------
inner.add(qfp('u5_mcu', 0.0075, MB, -0.0215, 0.0112, 8));
const xtal = pill('y1_xtal_16m', 0.0106, 0.0040, 0.0028, M.alum, 0.0168, MB, -0.0072);
xtal.rotation.y = Math.PI / 2; inner.add(xtal);
inner.add(sop('u6_rs232_soic16', -0.0105, MB, -0.0100, 16, 0.0100, 0.0046));
inner.add(sop('u7_rs485_soic8', 0.0215, MB, -0.0250, 8, 0.0052, 0.0042));
inner.add(sop('u8_rtc_soic8', 0.0075, MB, 0.0075, 8, 0.0052, 0.0042));
inner.add(box('bt1_holder', 0.0200, 0.0014, 0.0070, M.blackP, -0.0270, MB + 0.0007, -0.0120));
inner.add(cyl('bt1_coin_cell', 0.0098, 0.0032, M.nickel, -0.0270, MB + 0.0030, -0.0120, 28));
// 2-pin config jumper + red status LED at the front edge, right of the USB-B
inner.add(box('jp1_shroud', 0.0034, 0.0058, 0.0060, M.blackP, 0.0332, MB + 0.0029, 0.0300));
[-1, 1].forEach((s, i) =>
  inner.add(box('jp1_pin_' + (i + 1), 0.0006, 0.0072, 0.0006, M.gold,
    0.0332, MB + 0.0036, 0.0300 + s * 0.0013)));
inner.add(ledSmd('led_net_front', 0.0288, MB, 0.0306, M.ledRed));
// terminal-block skirts from the board up to the wall headers
inner.add(box('term_front_base', TERM_F.poles * TERM_F.pitch, TERM_F.y - 0.0039 - MB, 0.0090,
  M.green, TERM_F.x, (MB + TERM_F.y - 0.0039) / 2, D / 2 - 0.0055));
inner.add(box('term_left_base', 0.0090, TERM_L.y - 0.0039 - MB, TERM_L.poles * TERM_L.pitch,
  M.green, -W / 2 + 0.0055, (MB + TERM_L.y - 0.0039) / 2, TERM_L.z));
// per-pole detail: wire mouths and solder tails, plus the board pin rows
for (let i = 0; i < TERM_F.poles; i++) {
  const px = TERM_F.x + (i - (TERM_F.poles - 1) / 2) * TERM_F.pitch;
  inner.add(box('term_front_mouth_' + (i + 1), TERM_F.pitch * 0.46, 0.0026, 0.0016, M.dark,
    px, TERM_F.y - 0.0058, D / 2 - 0.0102));
  inner.add(box('term_front_rib_' + (i + 1), 0.0006, TERM_F.y - 0.0044 - MB, 0.0092,
    M.blackP, px + TERM_F.pitch / 2, (MB + TERM_F.y - 0.0044) / 2, D / 2 - 0.0055));
}
pinRow(inner, 'term_front_pins', TERM_F.x - (TERM_F.poles - 1) * TERM_F.pitch / 2,
  D / 2 - 0.0055, TERM_F.poles, TERM_F.pitch, MB);
for (let i = 0; i < TERM_L.poles; i++) {
  const pz = TERM_L.z + (i - (TERM_L.poles - 1) / 2) * TERM_L.pitch;
  inner.add(box('term_left_mouth_' + (i + 1), 0.0016, 0.0026, TERM_L.pitch * 0.46, M.dark,
    -W / 2 + 0.0102, TERM_L.y - 0.0058, pz));
  inner.add(box('term_left_rib_' + (i + 1), 0.0092, TERM_L.y - 0.0044 - MB, 0.0006,
    M.blackP, -W / 2 + 0.0055, (MB + TERM_L.y - 0.0044) / 2, pz + TERM_L.pitch / 2));
}
pinRow(inner, 'term_left_pins', -W / 2 + 0.0055,
  TERM_L.z - (TERM_L.poles - 1) * TERM_L.pitch / 2, TERM_L.poles, TERM_L.pitch, MB, true);
// LEDs / test pads / passive banks
[['led_pwr', -0.0752, 0.0115, M.ledGrn], ['led_act', -0.0752, 0.0140, M.ledRed]]
  .forEach(([n, x, z, m]) => inner.add(ledSmd(n, x, MB, z, m)));
chipRun(inner, 'r_bank_a', -0.0210, -0.0325, 8, 0.0044, 805, M.smdR);
chipRun(inner, 'r_bank_b', 0.0160, -0.0300, 5, 0.0042, 603, M.smdR);
chipRun(inner, 'c_bank_a', 0.0150, -0.0165, 4, 0.0042, 603, M.smdC);
chipRun(inner, 'c_bank_b', 0.0210, 0.0140, 4, 0.0044, 603, M.smdC);
chipRun(inner, 'r_rail_r', 0.0602, -0.0290, 4, 0.0046, 805, M.smdR, true);
chipRun(inner, 'c_rail_l', -0.0754, 0.0248, 3, 0.0044, 603, M.smdC, true);
[[0.0460, -0.0300], [0.0130, 0.0050], [-0.0080, 0.0300]].forEach(([x, z], i) =>
  inner.add(sot23('q_main_' + (i + 1), x, MB, z, i % 2 === 1)));
for (let i = 0; i < 5; i++) inner.add(pad('tp_main_' + (i + 1), 0.0050 + i * 0.0055, MB, 0.0305));
for (let i = 0; i < 8; i++)
  inner.add(via('via_main_' + (i + 1), 0.0420 + (i % 4) * 0.0070, MB,
    -0.0338 + Math.floor(i / 4) * 0.0676));

// ---- interface mezzanine (black board carrying PORT I/O + USB type A) -
const IFM = { x: -0.0045, z: 0.0092, w: 0.0300, d: 0.0334, y: MB + 0.0112 };
inner.add(fr4('interface_pcb', IFM.w, IFM.d, IFM.y, M.pcbK, IFM.x, IFM.z, 0.0016));
[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) =>
  inner.add(box('interface_standoff_' + (i + 1), 0.0034, IFM.y - 0.0016 - MB, 0.0034, M.blackP,
    IFM.x + sx * 0.0122, (MB + IFM.y - 0.0016) / 2, IFM.z + sz * 0.0142)));
for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++)
  inner.add(pad('interface_pad_' + (r * 4 + c + 1), IFM.x - 0.0058 + c * 0.0032, IFM.y,
    IFM.z - 0.0110 + r * 0.0032, 0.0008));
inner.add(box('db9_body', 0.0291, (TOP - 0.0084) - IFM.y, 0.0112, M.steel,
  DB9.x, (IFM.y + TOP - 0.0084) / 2, DB9.z));
inner.add(box('db9_body_shroud', 0.0186, 0.0050, 0.0092, M.blackP, DB9.x, IFM.y + 0.0025, DB9.z));

// ---- LTE carrier: GSM module on stacking headers, right half ---------
const LTE = { x: 0.0440, z: -0.0040, y: MB + 0.0090, w: 0.0270, d: 0.0300 };
inner.add(fr4('lte_carrier_pcb', LTE.w, LTE.d, LTE.y, M.pcbTeal, LTE.x, LTE.z, 0.0016));
[-1, 1].forEach((s, i) => {
  inner.add(box('lte_socket_' + (i + 1), 0.0026, LTE.y - 0.0016 - MB, 0.0250, M.blackP,
    LTE.x + s * 0.0116, (MB + LTE.y - 0.0016) / 2, LTE.z));
  for (let k = 0; k < 12; k++)
    inner.add(box('lte_pin_' + (i * 12 + k + 1), 0.0006, 0.0018, 0.0006, M.gold,
      LTE.x + s * 0.0116, LTE.y - 0.0025, LTE.z - 0.0110 + k * 0.0020));
});
inner.add(box('lte_shield_can', 0.0222, 0.0026, 0.0222, M.nickel,
  LTE.x + 0.0008, LTE.y + 0.0013, LTE.z + 0.0012));
pinRow(inner, 'lte_pads_l', LTE.x - 0.0122, LTE.z - 0.0128, 20, 0.0013, LTE.y, true);
pinRow(inner, 'lte_pads_r', LTE.x + 0.0126, LTE.z - 0.0128, 20, 0.0013, LTE.y, true);
pinRow(inner, 'lte_pads_b', LTE.x - 0.0100, LTE.z + 0.0134, 16, 0.0013, LTE.y);
inner.add(boardDecal('lte_can_print', 0.0214, 0.0214, LTE.x + 0.0008, LTE.y + 0.0027,
  LTE.z + 0.0012, canPrint, 300, 300));
['aux', 'main', 'gnss'].forEach((tag, i) => {
  const x = LTE.x - 0.0084 + i * 0.0084;
  inner.add(box('ufl_' + tag + '_body', 0.0028, 0.0012, 0.0028, M.tin, x, LTE.y + 0.0006, LTE.z - 0.0130));
  inner.add(cyl('ufl_' + tag + '_pin', 0.0006, 0.0014, M.gold, x, LTE.y + 0.0013, LTE.z - 0.0130, 12));
});
inner.add(ledSmd('lte_led_pwr', LTE.x - 0.0042, LTE.y, LTE.z - 0.0118, M.ledGrn));
inner.add(ledSmd('lte_led_net', LTE.x + 0.0044, LTE.y, LTE.z - 0.0118, M.ledRed));

// ---- GNSS / BLE antenna module, right rear corner --------------------
inner.add(fr4('gnss_module_pcb', 0.0118, 0.0158, MB + 0.0012, M.pcbGrn, 0.0700, -0.0200, 0.0012));
inner.add(box('gnss_module_can', 0.0088, 0.0016, 0.0112, M.nickel, 0.0700, MB + 0.0020, -0.0212));
inner.add(box('gnss_module_mark', 0.0026, 0.0002, 0.0026, M.blue, 0.0700, MB + 0.0029, -0.0212));
inner.add(cyl('ufl_gnss_aux', 0.0012, 0.0012, M.gold, 0.0700, MB + 0.0018, -0.0140, 12));

// ---- risers for the card holders; USB-A rides the interface board ----
function mezz(name, w, d, top, x, z) {
  inner.add(fr4(name, w, d, top, M.pcbK, x, z, 0.0014));
  [-1, 1].forEach(s => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.0012, top - 0.0014 - MB, d * 0.72), M.pcbK);
    c.name = name + '_support_' + (s > 0 ? 'r' : 'l');
    c.position.set(x + s * (w / 2 - 0.0018), (MB + top - 0.0014) / 2, z);
    inner.add(c);
  });
  const pins = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.0018, 0.0018), M.gold);
  pins.name = name + '_pins'; pins.position.set(x, MB + 0.0009, z);
  inner.add(pins);
}
mezz('mezz_sd',  0.0176, 0.0100, TOP - 0.0104, SD.x, SD.z);
mezz('mezz_sim', 0.0172, 0.0100, TOP - 0.0104, SIM.x, SIM.z);
inner.add(boardPorts);

// ---- LCD carrier -----------------------------------------------------
inner.add(fr4('lcd_carrier_pcb', LCD.w + 0.0130, LCD.d + 0.0090, LCDT, M.pcbGrn,
  LCD.x, LCD.z, PCB_T,
  [[-0.0330, -0.0110], [0.0330, -0.0110], [-0.0330, 0.0110], [0.0330, 0.0110]]
    .map(([x, z]) => holeAt(x, z, 0.0013))));
[[-0.0330, -0.0110], [0.0330, -0.0110], [-0.0330, 0.0110], [0.0330, 0.0110]]
  .forEach(([dx, dz], i) => {
    inner.add(standoff('lcd_standoff_' + (i + 1), LCD.x + dx, LCD.z + dz, MB, LCDT - PCB_T, 0.0022));
    inner.add(screwHead('lcd_screw_' + (i + 1), LCD.x + dx, LCDT, LCD.z + dz, 0.0020));
  });
inner.add(box('lcd_header_16p', 0.0380, 0.0018, 0.0024, M.blackP, LCD.x, LCDT + 0.0009, LCD.z + 0.0112));
chipRun(inner, 'lcd_r', LCD.x - 0.0240, LCD.z - 0.0108, 4, 0.0050, 603, M.smdR, false, LCDT);
inner.add(lcdAsm);

unit.add(inner);

  // ---- exploded layers -------------------------------------------------
  const root = new THREE.Group(); root.name = 'bl11_assembly';
  const parts = [];
  const layer = {};
  ['plate', 'board_lo', 'screw_lo', 'lte', 'iface', 'risers', 'lcd',
   'io_front', 'io_left', 'sma', 'lid'].forEach(id => {
    const g = new THREE.Group(); g.name = 'layer_' + id;
    root.add(g);
    parts.push({ id, group: g, axis: id === 'sma' ? 'x' : 'y' });
    layer[id] = g;
  });

  const routeOf = n =>
    /^(mount_plate|mount_countersink|case_shell_floor|pcb_boss)/.test(n) ? 'plate' :
    /^pcb_screw/.test(n) ? 'screw_lo' :
    /^(wall_|corner_post|case_top_)/.test(n) ? 'lid' :
    n === 'print_db9_pins' ? 'iface' :
    /^(print_|logo_|label_)/.test(n) ? 'lid' :
    /^(term_front|usb_b_port|net_led)/.test(n) ? 'io_front' :
    /^term_left/.test(n) ? 'io_left' :
    /^sma_/.test(n) ? 'sma' :
    /^(port_io_db9|interface_|db9_body)/.test(n) ? 'iface' :
    /^(mezz_sd|mezz_sim)/.test(n) ? 'risers' :
    /^(lcd_carrier|lcd_standoff|lcd_screw|lcd_header|lcd_r_|lcd_module)/.test(n) ? 'lcd' :
    n === 'ufl_gnss_aux' ? 'board_lo' :
    /^(lte_|ufl_)/.test(n) ? 'lte' : 'board_lo';

  // top-face ports split by the board that actually carries them
  boardPorts.children.slice().forEach(o =>
    (/^usb_a/.test(o.name) ? layer.iface : layer.risers).add(o));
  inner.remove(boardPorts);
  inner.children.slice().forEach(o => layer[routeOf(o.name)].add(o));
  unit.remove(inner);
  unit.children.slice().forEach(o => layer[routeOf(o.name)].add(o));

  // ---- runtime ---------------------------------------------------------
  const lcdMat = root.getObjectByName('lcd_screen').material;
  const glow = [[M.ledR, 0.55], [M.ledRed, 0.35], [M.ledGrn, 0.35]];
  function setPower(v) {
    glow.forEach(([m, b]) => { m.emissiveIntensity = b * v; });
    lcdMat.emissiveIntensity = 0.30 * v;
    lcdMat.color.setScalar(0.30 + 0.70 * Math.min(1, v));
  }
  setPower(0);

  root.scale.setScalar(1.5);
  // only structural parts cast shadows — sub-mm SMD detail would double the
  // draw calls in the shadow pass for no visible gain
  const NO_CAST = /^(chip|via|pad|led|tp_|r_bank|c_bank|r_rail|c_rail|q_main|u[0-9]_|y1_|rn[0-9]_|lcd_r_|interface_pad|term_(front|left)_pins|lte_pads|print_|logo_|label_)/;
  root.traverse(o => {
    if (!o.isMesh) return;
    o.receiveShadow = true;
    o.castShadow = !NO_CAST.test(o.name) &&
      !/_lead|_end_|_pin_|_slot_[ab]$/.test(o.name);
  });
  return { root, parts, setPower, dims: { W, D, TOP } };
}
