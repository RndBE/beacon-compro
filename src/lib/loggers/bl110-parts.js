// @ts-nocheck
/**
 * BE-BL110 Beacon Logger — assembly split into exploded layers.
 * Geometry is a 1:1 port of BL-110 Unit.html; every animated layer lives in
 * its own wrapper group (identity transform = assembled). Root is scaled so
 * the unit occupies the same world envelope as the BL-2000 skeleton scene.
 */
export function buildAssembly(THREE) {
  const texLoader = new THREE.TextureLoader();

  const W = 0.125, D = 0.155, TOP = 0.040;
  // ---- footprint correction -------------------------------------------
  // Real body is 120 × 120 mm (mounting tabs NOT included). The layout below is
  // authored in the original 125 × 155 mm space and squeezed onto the true
  // footprint by the root transform (SX across, SZ front-to-back). Round
  // hardware and printed artwork get their aspect restored (AR) so only the
  // LAYOUT compresses — cylinders stay circular, type stays undistorted.
  const SX = 0.120 / 0.125, SZ = 0.120 / 0.155, AR = SX / SZ;
  const LT = 0.0070, WT = 0.0032, CR = 0.0050;
  const TB = 0.0026, WALL_TOP = TOP - TB;
  const PLT = 0.0052;
  const FONT = 'Helvetica, Arial, sans-serif';
  const NARROW = '"Arial Narrow", "Helvetica Neue", Helvetica, Arial, sans-serif';

  const M = {
    case:    new THREE.MeshStandardMaterial({ name:'case_white',     color:0xffffff, roughness:0.82, metalness:0 }),
    caseTop: new THREE.MeshStandardMaterial({ name:'case_top',       color:0xffffff, roughness:0.80, metalness:0 }),
    dark:    new THREE.MeshStandardMaterial({ name:'bezel_black',    color:0x1b1e23, roughness:0.45, metalness:0.10 }),
    green:   new THREE.MeshStandardMaterial({ name:'terminal_green', color:0x2f8a3a, roughness:0.52, metalness:0.05 }),
    brass:   new THREE.MeshStandardMaterial({ name:'brass',          color:0xcf9c33, roughness:0.33, metalness:0.38 }),
    steel:   new THREE.MeshStandardMaterial({ name:'steel',          color:0xc3c7cb, roughness:0.28, metalness:0.38 }),
    nickel:  new THREE.MeshStandardMaterial({ name:'nickel',         color:0xd2d5d8, roughness:0.24, metalness:0.52 }),
    blue:    new THREE.MeshStandardMaterial({ name:'connector_blue', color:0x4a90c8, roughness:0.42, metalness:0.08 }),
    label:   new THREE.MeshStandardMaterial({ name:'label_grey',     color:0xffffff, roughness:0.68, metalness:0.02 }),
    gold:    new THREE.MeshStandardMaterial({ name:'gold_contact',   color:0xd6ae57, roughness:0.30, metalness:0.60 }),
    ledG:    new THREE.MeshStandardMaterial({ name:'led_green',      color:0xd9cfc0, emissive:0x2f9c4a, emissiveIntensity:0, roughness:0.35 }),
    ledA:    new THREE.MeshStandardMaterial({ name:'led_amber',      color:0xd9cfc0, emissive:0xd08a1c, emissiveIntensity:0, roughness:0.35 }),
  };
  M.caseRim = M.caseTop.clone();
  M.caseRim.name = 'case_rim';
  M.caseRim.side = THREE.FrontSide;
  M.case = M.caseTop;
  M.pcb    = new THREE.MeshStandardMaterial({ name:'pcb_black',       color:0x14171b, roughness:0.62, metalness:0.06 });
  M.pcbG   = new THREE.MeshStandardMaterial({ name:'pcb_black_riser', color:0x1b1f24, roughness:0.58, metalness:0.06 });
  M.alum   = new THREE.MeshStandardMaterial({ name:'cap_alu',    color:0xc9ccd0, roughness:0.30, metalness:0.55 });
  M.blackP = new THREE.MeshStandardMaterial({ name:'black_part', color:0x14161a, roughness:0.55, metalness:0.05 });
  M.red    = new THREE.MeshStandardMaterial({ name:'switch_red', color:0xb02a2a, roughness:0.45, metalness:0.04 });
  M.smd    = new THREE.MeshStandardMaterial({ name:'smd_body',    color:0x201f1d, roughness:0.52, metalness:0.06 });
  M.smdR   = new THREE.MeshStandardMaterial({ name:'smd_resistor',color:0x2b2622, roughness:0.48, metalness:0.06 });
  M.smdC   = new THREE.MeshStandardMaterial({ name:'smd_mlcc',    color:0xa8875f, roughness:0.55, metalness:0.10 });
  M.tin    = new THREE.MeshStandardMaterial({ name:'tin_plating', color:0xcfd3d7, roughness:0.26, metalness:0.62 });
  M.ledRed = new THREE.MeshStandardMaterial({ name:'led_red_smd', color:0xb8483c, emissive:0x8c1a12, emissiveIntensity:0, roughness:0.35 });
  M.ledGrn = new THREE.MeshStandardMaterial({ name:'led_grn_smd', color:0x8fae7a, emissive:0x2c7a3a, emissiveIntensity:0, roughness:0.35 });

  // ---- primitives ------------------------------------------------------
  const box = (name, w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.name = name; m.position.set(x, y, z); return m;
  };
  const cyl = (name, r, h, mat, x, y, z, seg = 32) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
    m.name = name; m.position.set(x, y, z); m.userData.round = 1; return m;
  };
  function roundedOutline(w, d, r) {
    const s = new THREE.Shape();
    const rx = Math.min(r, w / 2), rz = Math.min(r * AR, d / 2);
  const hw = w / 2 - rx, hd = d / 2 - rz;
    s.moveTo(-hw - rx, -hd);
    s.lineTo(-hw - rx, hd);  s.quadraticCurveTo(-hw - rx, hd + rz, -hw, hd + rz);
    s.lineTo(hw, hd + rz);   s.quadraticCurveTo(hw + rx, hd + rz, hw + rx, hd);
    s.lineTo(hw + rx, -hd);  s.quadraticCurveTo(hw + rx, -hd - rz, hw, -hd - rz);
    s.lineTo(-hw, -hd - rz); s.quadraticCurveTo(-hw - rx, -hd - rz, -hw - rx, -hd);
    return s;
  }
  const rectPath = (cx, cz, w, d) => {
    const p = new THREE.Path(), cy = -cz;
    p.moveTo(cx - w / 2, cy - d / 2); p.lineTo(cx - w / 2, cy + d / 2);
    p.lineTo(cx + w / 2, cy + d / 2); p.lineTo(cx + w / 2, cy - d / 2);
    p.closePath(); return p;
  };
  const holeAt = (x, z, r) => {
    const p = new THREE.Path();
    p.absellipse(x, -z, r, r * AR, 0, Math.PI * 2, true);
    return p;
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
    m.userData.noShadow = true;
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
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, (hOverride || w * imgH / imgW) * AR), mat);
    m.name = name; m.rotation.x = -Math.PI / 2;
    m.position.set(x, TOP + lift, z);
    m.userData.noShadow = true;
    return m;
  }
  function fitText(g, t, cx, cy, maxW, capH, color, font, stretch) {
    g.save();
    g.fillStyle = color; g.font = font || ('bold 100px ' + NARROW);
    const m = Math.max(g.measureText(t).width, 1);
    const sy = capH / 71, sx = stretch ? maxW / m : Math.min(sy, maxW / m);
    g.translate(cx, cy); g.scale(sx, sy * AR);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillText(t, 0, 35.5);
    g.restore();
  }
  const centered = (t, color) => (g, cw, ch) =>
    fitText(g, t, cw / 2, ch / 2, cw * 0.96, ch * 0.80, color || '#3b4046');
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
      if (c.circle) {
        const r = Math.min(w, h) * 0.36;
        g.strokeStyle = c.color || '#26292e'; g.lineWidth = lw * 0.8;
        g.beginPath(); g.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2); g.stroke();
        fitText(g, c.t, x + w / 2, y + h / 2, r * 1.4, h * 0.30, c.color || '#26292e');
      } else {
        fitText(g, c.t, x + w / 2, y + h / 2, w * 0.78, h * 0.44, c.color || '#26292e');
      }
      off += frac;
    });
  };
  const usbGlyph = (g, cw, ch) => {
    g.strokeStyle = '#3b4046'; g.fillStyle = '#3b4046';
    g.lineWidth = ch * 0.075; g.lineCap = 'round';
    const y = ch * 0.60, x0 = cw * 0.16, x1 = cw * 0.86;
    g.beginPath(); g.moveTo(x0, y); g.lineTo(x1 - ch * 0.14, y); g.stroke();
    g.beginPath(); g.arc(x0, y, ch * 0.085, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x1, y); g.lineTo(x1 - ch * 0.20, y - ch * 0.13);
    g.lineTo(x1 - ch * 0.20, y + ch * 0.13); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(cw * 0.40, y); g.lineTo(cw * 0.52, y - ch * 0.30); g.stroke();
    g.fillRect(cw * 0.49, y - ch * 0.44, ch * 0.17, ch * 0.17);
    g.beginPath(); g.moveTo(cw * 0.58, y); g.lineTo(cw * 0.68, y + ch * 0.26); g.stroke();
    g.beginPath(); g.arc(cw * 0.70, y + ch * 0.30, ch * 0.10, 0, Math.PI * 2); g.fill();
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

  // ---- part registry ---------------------------------------------------
  const root = new THREE.Group(); root.name = 'bl110_assembly';
  const parts = [];
  const mk = (id, axis) => {
    const g = new THREE.Group(); g.name = 'layer_' + id;
    root.add(g);
    parts.push({ id, group: g, axis: axis || 'y' });
    return g;
  };
  const gPlate = mk('plate');
  const gScrewCov = mk('screw_cover');
  const gBoard = mk('board_lo');
  const gScrew = mk('screw_lo');
  const gIoF   = mk('io_front');
  const gIoL   = mk('io_left');
  const gRiser = mk('risers');
  const gLcd   = mk('lcd');
  const gIface = mk('iface');
  const gLid   = mk('lid');
  const gSma   = mk('sma', 'x');

  // =====================================================================
  // PLATE
  // =====================================================================
  {
    const pw = W + 0.0020, pd = D + 0.0260 / SZ;   // tabs keep their 13 mm reach
    const s = roundedOutline(pw, pd, 0.0040);
    const HOLES = [];
    [-1, 1].forEach(sz => [-1, 1].forEach(sx => HOLES.push([sx * (0.0387 / SX), sz * (D / 2 + 0.0085 / SZ)])));
    HOLES.forEach(([hx, hz]) => {
      const p = new THREE.Path();
      p.absellipse(hx, -hz, 0.0024, 0.0024 * AR, 0, Math.PI * 2, true);
      s.holes.push(p);
    });
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) =>
      s.holes.push(holeAt(sx * (W / 2 - CR), sz * (D / 2 - CR * AR), 0.0014)));
    const g = new THREE.ExtrudeGeometry(s, { depth: PLT, bevelEnabled: false, curveSegments: 16 });
    g.rotateX(-Math.PI / 2); g.translate(0, -PLT, 0);
    const m = new THREE.Mesh(g, M.case);
    m.name = 'mount_plate'; gPlate.add(m);
    HOLES.forEach(([hx, hz], i) => {
      const cs = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0044, 0.0024, 0.0024, 24, 1, true), M.case);
      cs.name = 'mount_countersink_' + (i + 1); cs.userData.round = 1;
      cs.position.set(hx, -0.0012, hz);
      gPlate.add(cs);
    });
  }

  // =====================================================================
  // PLATE also carries the case floor + board bosses; walls + corner posts
  // are unibody with the top face (one cover, BL-2000 construction)
  // =====================================================================
  gPlate.add(slab('case_shell_floor', W, D, 0.0062, CR, M.caseTop, 0, 0,
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz]) =>
      holeAt(sx * (W / 2 - CR), sz * (D / 2 - CR * AR), 0.0014))));
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
  const SPAN_X = W - CR * 2, SPAN_Z = D - CR * AR * 2;
  const TERM_F = { x: -0.0216, y: 0.0150, poles: 12, pitch: 0.00477 };
  const ETH = { x: 0.0181, y: 0.0165 }, USBB = { x: 0.0370, y: 0.0163 };
  {
    const p = panel('wall_front', SPAN_X, 0, WALL_TOP, [
      { x: TERM_F.x, y: TERM_F.y, w: TERM_F.poles * TERM_F.pitch + 0.0006, h: 0.0106 },
      { x: ETH.x,  y: ETH.y,  w: 0.0165, h: 0.0152 },
      { x: USBB.x, y: USBB.y, w: 0.0130, h: 0.0136 },
    ]);
    p.position.z = D / 2 - WT; gLid.add(p);
  }
  { const p = panel('wall_rear', SPAN_X, 0, WALL_TOP); p.position.z = -D / 2; gLid.add(p); }
  const TERM_L = { z: -0.0285, y: 0.0150, poles: 10, pitch: 0.00464 };
  {
    const p = panel('wall_left', SPAN_Z, 0, WALL_TOP, [
      { x: -TERM_L.z, y: TERM_L.y, w: TERM_L.poles * TERM_L.pitch + 0.0006, h: 0.0106 },
    ]);
    p.rotation.y = Math.PI / 2; p.position.x = -W / 2; gLid.add(p);
  }
  const SMA = { z: -0.0340, y: 0.0230 };
  {
    const p = panel('wall_right', SPAN_Z, 0, WALL_TOP, [{ x: SMA.z, y: SMA.y, r: 0.0024 }]);
    p.rotation.y = -Math.PI / 2; p.position.x = W / 2; gLid.add(p);
  }
  [[1, 1, -Math.PI / 2], [1, -1, 0], [-1, -1, Math.PI / 2], [-1, 1, Math.PI]]
    .forEach(([sx, sz, a0], i) => {
      const cx = sx * (W / 2 - CR), cz = sz * (D / 2 - CR * AR);
      const s = new THREE.Shape();
      s.moveTo(cx, -cz);
      s.absellipse(cx, -cz, CR, CR * AR, a0, a0 + Math.PI / 2, false);
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: WALL_TOP, bevelEnabled: false, curveSegments: 12 });
      g.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(g, M.caseTop);
      m.name = 'corner_post_' + (i + 1); gLid.add(m);
    });

  // cover screws — driven UP from under the mounting plate into the corner
  // posts; the finished unit shows no fastener on its top face
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz], i) => {
    const n = 'screw_cover_' + (i + 1);
    const g = new THREE.Group(); g.name = n;
    g.position.set(sx * (W / 2 - CR), 0, sz * (D / 2 - CR * AR));
    g.add(cyl(n + '_head', 0.0026, 0.0013, M.steel, 0, -PLT - 0.0007, 0, 20));
    g.add(box(n + '_slot_a', 0.0038, 0.0004, 0.0009, M.dark, 0, -PLT - 0.0014, 0));
    g.add(box(n + '_slot_b', 0.0009, 0.0004, 0.0038, M.dark, 0, -PLT - 0.0014, 0));
    g.add(cyl(n + '_shank', 0.0012, 0.0135, M.steel, 0, -PLT + 0.00675, 0, 14));
    for (let j = 0; j < 6; j++)
      g.add(cyl(n + '_thread_' + (j + 1), 0.0014, 0.0004, M.steel, 0, -0.0015 + j * 0.0014, 0, 14));
    gScrewCov.add(g);
  });

  // =====================================================================
  // LID — top face + roundover + all panel printing
  // =====================================================================
  const LCD = { x: -0.0007, z: -0.0367, w: 0.0688, d: 0.0106 };
  const USBA = { x: 0.0083, z: -0.0047 };
  const SD   = { x: 0.0404, z: -0.0020 };
  const TYPEC = { x: 0.0252, z: 0.0113 };
  const DB9  = { x: 0.0289, z: 0.0321 };
  const win = (x, z, w, d) => rectPath(x, z, w, d);
  gLid.add(slab('case_top_face', W - TB * 2, D - TB * 2, LT, CR - TB, M.caseTop, TOP - LT, 0, [
    win(LCD.x, LCD.z, LCD.w, LCD.d),
    win(USBA.x, USBA.z, 0.0148, 0.0074),
    win(SD.x, SD.z, 0.0180, 0.0038),
    win(TYPEC.x, TYPEC.z, 0.0098, 0.0038),
    win(DB9.x, DB9.z, 0.0172, 0.0072),
  ]));
  gLid.add(edgeRoundover('case_top_edge', W, D, CR, TB, TOP, M.caseRim));

  const K = '#26292e', R = '#c8202a';
  const FR = { x: -0.0400, w: 0.0787, z: -0.0591, d: 0.0455 };
  gLid.add(topDecal('print_panel_frame', 0.0861, 0.0500, -0.0004, -0.0366, (g, cw, ch) => {
    const PX = 20000;
    const X = u => (FR.x + u * FR.w + 0.0435) * PX;
    const Y = v => (FR.z + v * FR.d + 0.0616) * PX;
    g.strokeStyle = '#7a8086'; g.lineWidth = 7; g.lineJoin = 'miter';
    g.beginPath();
    g.moveTo(X(0), Y(0.008));
    g.lineTo(X(0.680), Y(0.008));
    g.lineTo(X(0.725), Y(0.100));
    g.lineTo(X(1), Y(0.100));
    g.lineTo(X(1), Y(1));
    g.lineTo(X(0.535), Y(1));
    g.lineTo(X(0.495), Y(0.920));
    g.lineTo(X(0), Y(0.920));
    g.closePath(); g.stroke();
    const dx0 = X(0.043), dx1 = X(0.957), dy0 = Y(0.321), dy1 = Y(0.664), r = 16;
    g.beginPath();
    g.moveTo(dx0 + r, dy0);
    g.lineTo(dx1 - r, dy0); g.quadraticCurveTo(dx1, dy0, dx1, dy0 + r);
    g.lineTo(dx1, dy1 - r); g.quadraticCurveTo(dx1, dy1, dx1 - r, dy1);
    g.lineTo(dx0 + r, dy1); g.quadraticCurveTo(dx0, dy1, dx0, dy1 - r);
    g.lineTo(dx0, dy0 + r); g.quadraticCurveTo(dx0, dy0, dx0 + r, dy0);
    g.closePath(); g.stroke();
    fitText(g, 'BEACON LOGGER', (X(0.062) + X(0.622)) / 2, (Y(0.100) + Y(0.193)) / 2,
      0.560 * FR.w * PX, 0.093 * FR.d * PX, '#3a3f45', 'bold 100px ' + FONT, true);
    fitText(g, 'BL - 110', (X(0.720) + X(0.953)) / 2, (Y(0.002) + Y(0.057)) / 2,
      0.260 * FR.w * PX, 0.066 * FR.d * PX, '#3a3f45', 'bold 100px ' + FONT);
  }, 1722, 1000, 0.0004));
  gLid.add(topDecal('print_usb_glyph', 0.0080, 0.0050, USBA.x + 0.0005, 0.0030, usbGlyph, 130, 88));
  gLid.add(topDecal('print_sd_card', 0.0123, 0.0030, SD.x, -0.0057, centered('SD CARD'), 340, 74));
  gLid.add(topDecal('print_type_c', 0.0095, 0.0030, TYPEC.x - 0.0006, 0.0069, centered('TYPE C'), 280, 78));
  gLid.add(topDecal('print_port_io', 0.0123, 0.0030, DB9.x + 0.0004, 0.0247, centered('PORT I/O'), 300, 76));
  gLid.add(topDecal('print_gps', 0.0068, 0.0050, 0.0547, SMA.z - 0.0003,
    cellStrip([{ t: 'GPS', w: 1 }]), 150, 110));
  gLid.add(topDecal('print_rail_left', 0.0055, 0.0464, -0.0553, -0.0285, cellStrip([
    { t: '24V', w: 1, color: R }, { t: '12V', w: 1, color: R }, { t: '5V', w: 1, color: R },
    { t: 'Tx1', w: 1 }, { t: 'Rx1', w: 1 }, { t: 'A', w: 1 }, { t: 'B', w: 1 },
    { t: 'S1', w: 1 }, { t: 'G', w: 1 }, { t: 'RST', w: 1 },
  ], true), 118, 992));
  gLid.add(topDecal('print_rail_front', 0.0940, 0.0067, -0.0035, 0.0689, cellStrip([
    { t: 'A1', w: 4.77 }, { t: 'G', w: 4.77 }, { t: 'A2', w: 4.77 }, { t: 'G', w: 4.77 },
  { t: 'A3', w: 4.77 }, { t: 'G', w: 4.77 },
    { t: 'D1', w: 4.77 }, { t: 'G', w: 4.77 }, { t: 'D2', w: 4.77 },
    { t: 'R1', w: 4.77, circle: true },
    { t: '+', w: 4.77, fill: '#c8202a', color: '#ffffff' },
    { t: '–', w: 4.77, fill: '#22262f', color: '#ffffff' },
    { blank: true, w: 3.1 }, { t: 'ETH', w: 16.5 }, { blank: true, w: 4.2 }, { t: 'USB', w: 13.0 },
  ]), 1880, 134));
  gLid.add(logoDecal('logo_stesy', '/images/logger/logo-stesy.png', 0.0240, 401, 128, 0.0188, -0.0200, 0.0006, 0.0072));
  const STICK = { x: -0.0166, z: 0.0305, w: 0.0432, d: 0.0132 };
  gLid.add(topDecal('label_beacon_sticker', STICK.w, STICK.d, STICK.x, STICK.z, (g, cw, ch) => {
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
    g.save(); g.translate(u(0.812), v(0.242)); g.scale(1, AR);
  qrGlyph(g, 0.148 * 0.972 * cw); g.restore();
    fitText(g, 'made in Indonesia', u(0.805), v(0.905), 0.29 * 0.972 * cw, 32, '#3b4046',
      'italic 100px ' + FONT);
  }, 1296, 396, 0.0004));
  gLid.add(logoDecal('logo_beacon', '/images/logger/logo-beacon.png', 0.0201, 2360, 626,
    STICK.x + 0.0016, STICK.z + 0.0004, 0.0008, 0.0050));

  // =====================================================================
  // LCD — carrier + module + screen
  // =====================================================================
  let lcdMat;
  {
    gLcd.add(box('lcd_module', 0.0684, 0.0120, 0.0102, M.dark,
      LCD.x, TOP - 0.0004 - 0.0060, LCD.z));
    const cv = document.createElement('canvas'); cv.width = 1040; cv.height = 196;
    const g = cv.getContext('2d');
    g.fillStyle = '#a8b483'; g.fillRect(0, 0, 1040, 196);
    g.fillStyle = 'rgba(70,86,44,0.045)';
    for (let c = 0; c < 16; c++) for (let r = 0; r < 2; r++) {
      const x0 = 12 + c * 63.5, y0 = 19 + r * 86;
      for (let dx = 0; dx < 5; dx++) for (let dy = 0; dy < 8; dy++)
        g.fillRect(x0 + dx * 9.0, y0 + dy * 9.0, 7.4, 7.4);
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
    lcdMat = new THREE.MeshStandardMaterial({
      name: 'lcd_screen', map: tex, emissiveMap: tex, emissive: 0xffffff,
      emissiveIntensity: 0, roughness: 0.30, metalness: 0,
    });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.0684, 0.0102), lcdMat);
    scr.name = 'lcd_screen'; scr.rotation.x = -Math.PI / 2;
    scr.position.set(LCD.x, TOP + 0.0001, LCD.z);
    scr.userData.noShadow = true;
    gLcd.add(scr);
  }

  // =====================================================================
  // RISERS — mezzanine cards + their flush top-face ports
  // =====================================================================
  gRiser.add(box('usb_a_shell',  0.0148, 0.0140, 0.0074, M.steel, USBA.x, TOP - 0.0078, USBA.z));
  gRiser.add(box('usb_a_cavity', 0.0126, 0.0120, 0.0054, M.dark,  USBA.x, TOP - 0.0064, USBA.z));
  gRiser.add(topDecal('usb_a_insert', 0.0122, 0.0050, USBA.x, USBA.z, (g, cw, ch) => {
    g.fillStyle = '#dad7d0';
    g.fillRect(0, ch * 0.44, cw, ch * 0.40);
    g.fillStyle = '#c9a95f';
    for (let i = 0; i < 4; i++) g.fillRect(cw * (0.17 + i * 0.185), ch * 0.48, cw * 0.08, ch * 0.30);
    g.fillStyle = '#8d8a84'; g.fillRect(0, ch * 0.84, cw, ch * 0.05);
  }, 244, 100, -0.0003));
  gRiser.add(box('sd_holder', 0.0184, 0.0100, 0.0028, M.steel, SD.x, TOP - 0.0062, SD.z));
  gRiser.add(box('sd_slot',   0.0176, 0.0040, 0.0018, M.dark,  SD.x, TOP - 0.0022, SD.z));
  gRiser.add(box('usb_c_shell',  0.0098, 0.0090, 0.0040, M.steel, TYPEC.x, TOP - 0.0057, TYPEC.z));
  gRiser.add(box('usb_c_throat', 0.0092, 0.0034, 0.0032, M.dark,  TYPEC.x, TOP - 0.0021, TYPEC.z));
  gRiser.add(pill('usb_c_slot',   0.0092, 0.0032, 0.0007, M.dark,  TYPEC.x, TOP - 0.0009, TYPEC.z));
  gRiser.add(pill('usb_c_tongue', 0.0044, 0.0009, 0.0003, M.label, TYPEC.x, TOP - 0.0003, TYPEC.z));

  // =====================================================================
  // IO — wall connectors (pluggable headers + jacks)
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
    gIoF.add(f);
    const l = pinHeader('term_left', TERM_L.poles, TERM_L.pitch);
    l.rotation.y = -Math.PI / 2;
    l.position.set(-W / 2, TERM_L.y, TERM_L.z);
    gIoL.add(l);
  }
  {
    const z = D / 2, g = new THREE.Group(); g.name = 'eth_rj45';
    g.add(box('rj45_housing', 0.0158, 0.0146, 0.0220, M.steel, 0, 0, -0.0110));
    g.add(box('rj45_mouth',   0.0132, 0.0110, 0.0040, M.dark,  0, -0.0012, -0.0010));
    g.add(box('rj45_key',     0.0056, 0.0044, 0.0034, M.dark,  0, 0.0052, -0.0008));
    g.add(box('rj45_contacts', 0.0098, 0.0012, 0.0016, M.gold, 0, 0.0020, -0.0016));
    g.add(box('rj45_led_l', 0.0024, 0.0016, 0.0012, M.ledG, -0.0056, 0.0058, 0.0002));
    g.add(box('rj45_led_r', 0.0024, 0.0016, 0.0012, M.ledA,  0.0056, 0.0058, 0.0002));
    g.position.set(ETH.x, ETH.y, z);
    gIoF.add(g);
  }
  {
    const g = new THREE.Group(); g.name = 'usb_b_port';
    g.add(box('usb_b_shell', 0.0124, 0.0130, 0.0180, M.steel, 0, 0, -0.0090));
    g.add(box('usb_b_mouth', 0.0098, 0.0100, 0.0034, M.dark,  0, 0, -0.0012));
    g.add(box('usb_b_insert', 0.0072, 0.0018, 0.0018, M.label, 0, 0.0026, -0.0018));
    g.position.set(USBB.x, USBB.y, D / 2);
    gIoF.add(g);
  }
  {
    const g = new THREE.Group(); g.name = 'sma_gps_port';
    const barrel = cyl('sma_barrel', 0.0036, 0.0090, M.brass, 0.0045, 0, 0, 24);
    barrel.rotation.z = Math.PI / 2; g.add(barrel);
    const nut = cyl('sma_nut', 0.0046, 0.0036, M.brass, 0.0018, 0, 0, 6);
    nut.rotation.z = Math.PI / 2; g.add(nut);
    const throat = cyl('sma_throat', 0.0020, 0.0090, M.dark, 0.0044, 0, 0, 20);
    throat.rotation.z = Math.PI / 2; g.add(throat);
    const pin = cyl('sma_pin', 0.0008, 0.0042, M.steel, 0.0068, 0, 0, 12);
    pin.rotation.z = Math.PI / 2; g.add(pin);
    g.position.set(W / 2, SMA.y, SMA.z);
    gSma.add(g);
  }

  // =====================================================================
  // INTERNAL BOARDS
  // =====================================================================
  const MB = 0.0092, PCB_T = 0.0016;
  const DGT = 0.0260, LCDT = 0.0260;
  const FL = 0.0062;

  const fr4 = (name, w, d, y, mat, x, z, t = PCB_T, holes) => {
    const m = slab(name, w, d, t, 0.0025, mat, y - t, 0, holes);
    m.position.x = x; m.position.z = z; return m;
  };
  const standoff = (name, x, z, y0, y1, r = 0.0030) =>
    cyl(name, r, y1 - y0, M.brass, x, (y0 + y1) / 2, z, 6);
  const screwHead = (name, x, y, z, r = 0.0026) => {
    const g = new THREE.Group(); g.name = name;
    g.add(cyl(name + '_head', r, 0.0013, M.nickel, 0, y + 0.0006, 0, 20));
    g.add(box(name + '_slot_a', r * 1.3, 0.0004, 0.0006, M.steel, 0, y + 0.0013, 0));
    g.add(box(name + '_slot_b', 0.0006, 0.0004, r * 1.3, M.steel, 0, y + 0.0013, 0));
    const sl = 0.0042;
    g.add(cyl(name + '_shank', r * 0.50, sl, M.nickel, 0, y - sl / 2, 0, 14));
    for (let j = 0; j < 4; j++)
      g.add(cyl(name + '_thread_' + (j + 1), r * 0.60, 0.0004, M.nickel, 0, y - 0.0008 - j * 0.0010, 0, 14));
    g.position.set(x, 0, z); return g;
  };
  function chip(name, x, y, z, code, mat, rot) {
    const S = { 402:[0.0010,0.0005,0.0004], 603:[0.0016,0.0008,0.0005],
                805:[0.0020,0.0013,0.0006], 1206:[0.0032,0.0016,0.0007] }[code];
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
  let MBY = MB;
  function chipRun(group, name, x0, z0, n, step, code, mat, rot, alt) {
    for (let i = 0; i < n; i++) {
      const x = rot ? x0 : x0 + i * step, z = rot ? z0 + i * step : z0;
      group.add(chip(name + '_' + (i + 1), x, MBY, z, alt && i % 2 ? alt : code,
        i % 3 === 2 ? M.smdC : mat, rot));
    }
  }

  // ---- main board (gBoard) --------------------------------------------
  const PCB_HOLES = [[-0.0500, -0.0608], [0.0500, -0.0608], [-0.0500, 0.0608], [0.0500, 0.0608]];
  gBoard.add(fr4('main_pcb', 0.1170, 0.1470, MB, M.pcb, 0, 0, PCB_T,
    PCB_HOLES.map(([x, z]) => holeAt(x, z, 0.0016))));
  PCB_HOLES
    .forEach(([x, z], i) => {
      gPlate.add(cyl('pcb_boss_' + (i + 1), 0.0035, MB - FL, M.caseTop, x, (FL + MB) / 2, z, 18));
      gScrew.add(screwHead('pcb_screw_' + (i + 1), x, MB, z));
    });
  [-0.0397, -0.0181, 0.0036, 0.0252].forEach((x, i) => {
    gBoard.add(cyl('cap_' + (i + 1), 0.0040, 0.0110, M.alum, x, MB + 0.0055, -0.0203, 20));
    gBoard.add(cyl('cap_' + (i + 1) + '_top', 0.0039, 0.0004, M.blackP, x, MB + 0.0112, -0.0203, 20));
  });
  gBoard.add(box('inductor_1', 0.0100, 0.0070, 0.0100, M.blackP, -0.0397, MB + 0.0035, -0.0394));
  gBoard.add(box('inductor_2', 0.0100, 0.0070, 0.0100, M.blackP, -0.0169, MB + 0.0035, -0.0394));
  gBoard.add(box('rf_module_can', 0.0210, 0.0022, 0.0140, M.steel, 0.0397, MB + 0.0011, -0.0449));
  gBoard.add(box('ic_driver_1', 0.0092, 0.0018, 0.0052, M.blackP, -0.0048, MB + 0.0009, -0.0408));
  gBoard.add(box('ic_driver_2', 0.0092, 0.0018, 0.0052, M.blackP, 0.0132, MB + 0.0009, -0.0408));
  gBoard.add(cyl('coin_cell', 0.0098, 0.0032, M.nickel, 0.0444, MB + 0.0016, 0.0149, 28));
  gBoard.add(box('coin_holder', 0.0210, 0.0014, 0.0070, M.blackP, 0.0444, MB + 0.0007, 0.0149));
  gBoard.add(box('tact_reset_main', 0.0060, 0.0035, 0.0060, M.blackP, -0.0072, MB + 0.0017, 0.0449));
  gBoard.add(box('term_front_base', TERM_F.poles * TERM_F.pitch, TERM_F.y - 0.0039 - MB, 0.0090,
    M.green, TERM_F.x, (MB + TERM_F.y - 0.0039) / 2, D / 2 - 0.0055));
  gBoard.add(box('term_left_base', 0.0090, TERM_L.y - 0.0039 - MB, TERM_L.poles * TERM_L.pitch,
    M.green, -W / 2 + 0.0055, (MB + TERM_L.y - 0.0039) / 2, TERM_L.z));

  function mezz(name, w, d, top, x, z) {
    gRiser.add(fr4(name, w, d, top, M.pcbG, x, z, 0.0014));
    [-1, 1].forEach(s => {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.0012, top - 0.0014 - MB, d * 0.72), M.pcbG);
      c.name = name + '_support_' + (s > 0 ? 'r' : 'l');
      c.position.set(x + s * (w / 2 - 0.0018), (MB + top - 0.0014) / 2, z);
      gRiser.add(c);
    });
    const pins = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.0018, 0.0018), M.gold);
    pins.name = name + '_pins'; pins.position.set(x, MB + 0.0009, z);
    gRiser.add(pins);
  }
  mezz('mezz_usb_a', 0.0178, 0.0138, TOP - 0.0148, USBA.x, USBA.z);
  mezz('mezz_sd',    0.0198, 0.0102, TOP - 0.0112, SD.x, SD.z);
  mezz('mezz_type_c', 0.0120, 0.0058, TOP - 0.0102, TYPEC.x, TYPEC.z);

  // ---- LCD carrier (gLcd) ----------------------------------------------
  gLcd.add(fr4('lcd_carrier_pcb', 0.0781, 0.0200, LCDT, M.pcbG, LCD.x, LCD.z, PCB_T,
    [[-0.0366, -0.0078], [0.0366, -0.0078], [-0.0366, 0.0078], [0.0366, 0.0078]]
      .map(([x, z]) => holeAt(x, z, 0.0013))));
  [[-0.0366, -0.0078], [0.0366, -0.0078], [-0.0366, 0.0078], [0.0366, 0.0078]]
    .forEach(([dx, dz], i) => {
      gLcd.add(standoff('lcd_standoff_' + (i + 1), LCD.x + dx, LCD.z + dz, MB, LCDT - PCB_T, 0.0024));
      gLcd.add(screwHead('lcd_screw_' + (i + 1), LCD.x + dx, LCDT, LCD.z + dz, 0.0022));
    });
  gLcd.add(box('lcd_header_16p', 0.0380, 0.0018, 0.0024, M.blackP, LCD.x, LCDT + 0.0009, LCD.z + 0.0084));
  gLcd.add(box('lcd_ribbon_shell', 0.0055, 0.0016, 0.0140, M.label, -0.0397, LCDT - 0.0008, LCD.z + 0.0040));

  // ---- interface daughterboard (gIface) ---------------------------------
  function polyBoard(name, pts, y, t, mat, holes) {
    const s = new THREE.Shape();
    pts.forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z));
    s.closePath();
    (holes || []).forEach(p => s.holes.push(p));
    const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); g.translate(0, y - t, 0);
    const m = new THREE.Mesh(g, mat); m.name = name; return m;
  }
  gIface.add(polyBoard('interface_pcb', [
    [-0.0541, 0.0143], [0.0096, 0.0143], [0.0096, 0.0244],
    [0.0553, 0.0244], [0.0553, 0.0707], [-0.0541, 0.0707],
  ], DGT, PCB_T, M.pcb,
    [[-0.0517, 0.0177], [-0.0517, 0.0652], [0.0505, 0.0279], [0.0505, 0.0449]]
      .map(([x, z]) => holeAt(x, z, 0.0015))));
  [[-0.0517, 0.0177], [-0.0517, 0.0652], [0.0505, 0.0279], [0.0505, 0.0449]]
    .forEach(([x, z], i) => {
      gIface.add(standoff('interface_standoff_' + (i + 1), x, z, MB, DGT - PCB_T));
      gIface.add(screwHead('interface_screw_' + (i + 1), x, DGT, z));
    });
  gIface.add(box('db9_body', 0.0272, (TOP - 0.0084) - DGT, 0.0112, M.steel,
    DB9.x, (DGT + TOP - 0.0084) / 2, DB9.z));
  gIface.add(box('db9_body_shroud', 0.0180, 0.0060, 0.0090, M.blackP, DB9.x, DGT + 0.0030, DB9.z));
  {
    const g = new THREE.Group(); g.name = 'port_io_db9';
    g.add(box('db9_riser', 0.0184, 0.0080, 0.0080, M.steel, 0, TOP - 0.0044, 0));
    g.add(flangePlate('db9_flange', 0.0272, 0.0096, 0.0012, 0.0011, M.nickel, 0, TOP + 0.0001, 0));
    g.add(dShell('db9_insert', 0.0058, 0.0072, 0.0030, 0.0014, M.blue, TOP + 0.0011));
    [-1, 1].forEach((s, i) => {
      g.add(cyl('db9_jackscrew_' + (i + 1), 0.0023, 0.0028, M.brass, s * 0.0119, TOP + 0.0014, 0, 20));
      g.add(cyl('db9_jackscrew_bore_' + (i + 1), 0.0010, 0.0006, M.dark, s * 0.0119, TOP + 0.0027, 0, 14));
    });
    g.position.set(DB9.x, 0, DB9.z);
    gIface.add(g);
    gIface.add(topDecal('print_db9_pins', 0.0104, 0.0048, DB9.x, DB9.z - 0.0003,
      db9Holes, 240, 114, 0.0026));
  }
  [[-0.0505, 'a'], [-0.0481, 'b']].forEach(([x, tag]) => {
    gIface.add(box('hdr_left_' + tag, 0.0026, 0.0026, 0.0152, M.blackP, x, DGT + 0.0013, 0.0340));
    for (let i = 0; i < 6; i++)
      gIface.add(box('hdr_left_' + tag + '_pin_' + (i + 1), 0.0007, 0.0058, 0.0007, M.brass,
        x, DGT + 0.0030, 0.0275 + i * 0.0026));
  });
  for (let i = 0; i < 7; i++) [-0.0495, -0.0464].forEach((x, j) =>
    gIface.add(pad('dg_edge_pad_' + i + '_' + j, x, DGT, 0.0463 + i * 0.0021, 0.0007)));
  gIface.add(box('tact_rst', 0.0060, 0.0032, 0.0060, M.blackP, -0.0348, DGT + 0.0016, 0.0572));
  gIface.add(box('tact_rst_cap', 0.0032, 0.0012, 0.0032, M.red, -0.0348, DGT + 0.0038, 0.0572));
  gIface.add(box('tact_wdt', 0.0060, 0.0032, 0.0060, M.blackP, 0.0156, DGT + 0.0016, 0.0449));
  gIface.add(box('tact_wdt_cap', 0.0032, 0.0012, 0.0032, M.red, 0.0156, DGT + 0.0038, 0.0449));
  gIface.add(sot23('ic2_ldo', -0.0144, DGT, 0.0611));
  const xtal = pill('xtal_16m', 0.0110, 0.0042, 0.0030, M.alum, -0.0042, DGT, 0.0639);
  xtal.rotation.y = Math.PI / 2; gIface.add(xtal);
  gIface.add(qfp('mcu_qfp', 0.0096, DGT, 0.0632, 0.0100, 8));
  gIface.add(sop('rs232_soic16', 0.0270, DGT, 0.0572, 16, 0.0100, 0.0045));
  gIface.add(box('mini_usb_shell', 0.0080, 0.0044, 0.0070, M.steel, 0.0402, DGT + 0.0022, 0.0666));
  gIface.add(box('mini_usb_mouth', 0.0064, 0.0028, 0.0016, M.dark, 0.0402, DGT + 0.0022, 0.0700));
  gIface.add(ledSmd('dg_led_kick', 0.0000, DGT, 0.0687, M.ledGrn));
  gIface.add(ledSmd('dg_led_wdt2', 0.0235, DGT, 0.0652, M.ledGrn));

  // main-board passives + logic
  chipRun(gBoard, 'r_bank_a', -0.0421, 0.0619, 8, 0.0052, 1206, M.smdR);
  chipRun(gBoard, 'r_bank_b', -0.0397, 0.0558, 7, 0.0052, 805, M.smdR);
  chipRun(gBoard, 'c_bank_a', -0.0517, 0.0408, 6, 0.0048, 603, M.smdC);
  chipRun(gBoard, 'c_bank_b', -0.0517, 0.0347, 6, 0.0048, 603, M.smdC, false, 805);
  chipRun(gBoard, 'c_bank_c', -0.0541, -0.0055, 7, 0.0044, 603, M.smdC);
  chipRun(gBoard, 'r_bank_c', -0.0541, 0.0020, 7, 0.0044, 603, M.smdR);
  chipRun(gBoard, 'r_rail_l', -0.0420, -0.0652, 9, 0.0052, 805, M.smdR);
  chipRun(gBoard, 'c_rail_r', 0.0516, -0.0312, 5, 0.0052, 603, M.smdC, true);
  [[-0.0294, -0.0102], [0.0120, -0.0102], [0.0348, 0.0334]].forEach(([x, z], i) =>
    gBoard.add(sop('drv_sop8_' + (i + 1), x, MB, z, 8, 0.0050, 0.0040)));
  [[-0.0481, 0.0312], [-0.0361, 0.0312], [0.0216, 0.0408], [0.0505, -0.0109]].forEach(([x, z], i) =>
    gBoard.add(sot23('q_main_' + (i + 1), x, MB, z, i % 2 === 1)));
  gBoard.add(qfp('mcu_main', -0.0216, MB, 0.0203, 0.0110, 8));
  [['led_pwr', -0.0541, 0.0469, M.ledGrn], ['led_act', -0.0541, 0.0408, M.ledRed],
   ['led_gps', -0.0541, 0.0347, M.ledGrn], ['led_bt', -0.0541, 0.0285, M.ledRed]]
    .forEach(([n, x, z, m]) => gBoard.add(ledSmd(n, x, MB, z, m)));
  for (let i = 0; i < 6; i++) gBoard.add(pad('tp_main_' + (i + 1), -0.0169 + i * 0.0060, MB, 0.0652));
  for (let i = 0; i < 24; i++)
    gBoard.add(via('via_main_' + (i + 1), -0.0505 + (i % 12) * 0.0086, MB,
      -0.0619 + Math.floor(i / 12) * 0.0075));
  for (let i = 0; i < 10; i++)
    gBoard.add(box('hdr_exp_pin_' + (i + 1), 0.0007, 0.0060, 0.0007, M.brass,
      0.0547, MB + 0.0030, -0.0244 + i * 0.0043));

  MBY = DGT;
  chipRun(gIface, 'dg_r_a', -0.0397, 0.0203, 9, 0.0046, 805, M.smdR);
  chipRun(gIface, 'dg_c_a', -0.0397, 0.0340, 8, 0.0046, 603, M.smdC);
  chipRun(gIface, 'dg_r_b', -0.0324, 0.0679, 4, 0.0046, 603, M.smdR);
  chipRun(gIface, 'dg_c_b', 0.0348, 0.0584, 3, 0.0044, 603, M.smdC);
  chipRun(gIface, 'dg_r_c', 0.0132, 0.0503, 4, 0.0046, 603, M.smdR);
  [[-0.0252, 0.0544], [-0.0072, 0.0687]].forEach(([x, z], i) =>
    gIface.add(sot23('dg_q_' + (i + 1), x, DGT, z, true)));
  for (let i = 0; i < 4; i++)
    gIface.add(pad('dg_pad_lusb_' + (i + 1), -0.0235 + i * 0.0026, DGT, 0.0544, 0.0007));
  for (let i = 0; i < 7; i++)
    gIface.add(via('dg_via_' + (i + 1), -0.0361 + i * 0.0055, DGT, 0.0394));
  MBY = MB;

  // ---- runtime ----------------------------------------------------------
  const glow = [[M.ledG, 0.55], [M.ledA, 0.55], [M.ledRed, 0.35], [M.ledGrn, 0.35], [lcdMat, 0.30]];
  function setPower(v) {
    glow.forEach(([m, b]) => { m.emissiveIntensity = b * v; });
    lcdMat.color.setScalar(0.30 + 0.70 * Math.min(1, v));
  }
  setPower(0);

  root.scale.set(2.0 * SX, 2.0, 2.0 * SZ);
  // only structural parts cast shadows — sub-mm SMD detail (chips, vias, pads,
  // leads, threads, pins) would double the draw-call count in the shadow pass
  const NO_CAST = /^(chip|via|pad|led|tp_|dg_|r_bank|c_bank|r_rail|c_rail|hdr_|q_main|drv_|mcu_|rs232|xtal|ic2_|sot|smd)/;
  root.traverse(o => {
    if (!o.isMesh) return;
    // squeezed layout, undistorted parts: pre-stretch round meshes in z
    if (o.userData.round && !o.rotation.x && !o.rotation.y) o.scale.z = AR;
    o.receiveShadow = true;
    o.castShadow = !o.userData.noShadow && !NO_CAST.test(o.name) &&
      !/_lead|_thread_|_end_|_pin_|_slot_[ab]$/.test(o.name);
  });
  return { root, parts, setPower, dims: { W: 0.120, D: 0.120, TOP } };
}
