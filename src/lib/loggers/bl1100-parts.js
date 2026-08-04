// @ts-nocheck
/**
 * BE-BL1100V2 Beacon Logger — assembly split into exploded layers.
 * Geometry is a 1:1 port of "BL-1100 Unit.html" (body 120 × 170 mm, 40 mm tall,
 * true scale, no squeeze). Every animated layer lives in its own wrapper group
 * so identity transform == fully assembled.
 */
export function buildAssembly(THREE) {
  const texLoader = new THREE.TextureLoader();

  const W = 0.120, D = 0.170, TOP = 0.040;
  const LT = 0.0070, WT = 0.0032, CR = 0.0050;
  const TB = 0.0026, WALL_TOP = TOP - TB;
  const PLT = 0.0052;
  const PITCH = 0.00508;
  const FONT = 'Helvetica, Arial, sans-serif';
  const NARROW = '"Arial Narrow", "Helvetica Neue", Helvetica, Arial, sans-serif';

  const M = {
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
  M.case = M.caseTop;
  M.caseRim = M.caseTop.clone();
  M.caseRim.name = 'case_rim';
  M.caseRim.side = THREE.FrontSide;
  M.pcb    = new THREE.MeshStandardMaterial({ name:'pcb_black',   color:0x0f1114, roughness:0.60, metalness:0.06 });
  M.pcbB   = new THREE.MeshStandardMaterial({ name:'pcb_black_2', color:0x15181c, roughness:0.52, metalness:0.06 });
  M.pcbG   = new THREE.MeshStandardMaterial({ name:'pcb_green',   color:0x1f6b34, roughness:0.55, metalness:0.06 });
  M.alum   = new THREE.MeshStandardMaterial({ name:'cap_alu',     color:0xc9ccd0, roughness:0.30, metalness:0.55 });
  M.blackP = new THREE.MeshStandardMaterial({ name:'black_part',  color:0x14161a, roughness:0.55, metalness:0.05 });
  M.red    = new THREE.MeshStandardMaterial({ name:'switch_red',  color:0xb02a2a, roughness:0.45, metalness:0.04 });
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
    m.name = name; m.position.set(x, y, z); return m;
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
  // shape-space y maps to world -z
  const rectPath = (cx, cz, w, d) => {
    const p = new THREE.Path(), cy = -cz;
    p.moveTo(cx - w / 2, cy - d / 2); p.lineTo(cx - w / 2, cy + d / 2);
    p.lineTo(cx + w / 2, cy + d / 2); p.lineTo(cx + w / 2, cy - d / 2);
    p.closePath(); return p;
  };
  const holeAt = (x, z, r) => {
    const p = new THREE.Path();
    p.absellipse(x, -z, r, r, 0, Math.PI * 2, true);
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
    const n = P.length, pos = [], idx = [], N = [], nor = [];
    for (let i = 0; i < n; i++) {
      const a = P[(i - 1 + n) % n], b = P[(i + 1) % n];
      let nx = b.y - a.y, nz = -(b.x - a.x);
      const len = Math.hypot(nx, nz) || 1; nx /= len; nz /= len;
      if (nx * P[i].x + nz * P[i].y < 0) { nx = -nx; nz = -nz; }
      N.push([nx, nz]);
    }
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
  function logoDecal(name, file, w, h, x, z, lift = 0.0006) {
    const tex = texLoader.load(file);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
    const mat = new THREE.MeshStandardMaterial({
      name: name + '_print', map: tex, roughness: 0.62, metalness: 0.03,
      side: THREE.DoubleSide, alphaTest: 0.18,
      polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.name = name; m.rotation.x = -Math.PI / 2;
    m.position.set(x, TOP + lift, z);
    m.userData.noShadow = true;
    return m;
  }
  // solid-white silkscreen lockup: PNG supplies the shape, opaque pixels forced white
  function whiteLogoDecal(name, file, w, h, x, y, z) {
    const cv = document.createElement('canvas'); cv.width = 8; cv.height = 8;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
    const mat = new THREE.MeshStandardMaterial({
      name: name + '_print', map: tex, transparent: true, roughness: 0.55, metalness: 0.04,
      side: THREE.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
    });
    const img = new Image();
    img.onload = () => {
      cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      const g = cv.getContext('2d');
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, cv.width, cv.height);
      for (let i = 0; i < d.data.length; i += 4) {
        if (d.data[i + 3] > 24) { d.data[i] = 255; d.data[i + 1] = 255; d.data[i + 2] = 255; d.data[i + 3] = 255; }
        else d.data[i + 3] = 0;
      }
      g.putImageData(d, 0, 0);
      tex.needsUpdate = true;
    };
    img.src = file;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.name = name; m.rotation.x = -Math.PI / 2; m.position.set(x, y, z);
    m.userData.noShadow = true;
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
  const centered = (t, color, font) => (g, cw, ch) =>
    fitText(g, t, cw / 2, ch / 2, cw * 0.96, ch * 0.80, color || '#3b4046', font);
  function groundGlyph(g, cx, cy, s, color) {
    g.strokeStyle = color; g.lineWidth = Math.max(2, s * 0.10); g.lineCap = 'butt';
    g.beginPath(); g.arc(cx, cy, s, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(cx, cy - s * 0.62); g.lineTo(cx, cy - s * 0.06); g.stroke();
    [[0.66, -0.06], [0.42, 0.22], [0.18, 0.50]].forEach(([hw, dy]) => {
      g.beginPath(); g.moveTo(cx - s * hw, cy + s * dy); g.lineTo(cx + s * hw, cy + s * dy); g.stroke();
    });
  }
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
      if (c.ground) {
        groundGlyph(g, x + w / 2, y + h / 2, Math.min(w, h) * 0.30, c.color || '#26292e');
      } else if (c.circle) {
        const r = Math.min(w, h) * 0.36;
        g.strokeStyle = c.color || '#26292e'; g.lineWidth = lw * 0.8;
        g.beginPath(); g.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2); g.stroke();
        fitText(g, c.t, x + w / 2, y + h / 2, r * 1.4, h * 0.30, c.color || '#26292e');
      } else {
        fitText(g, c.t, x + w / 2, y + h / 2, w * 0.76, h * 0.42, c.color || '#26292e');
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

  // ---- layer registry --------------------------------------------------
  const root = new THREE.Group(); root.name = 'bl1100_assembly';
  const parts = [];
  const mk = (id, axis) => {
    const g = new THREE.Group(); g.name = 'layer_' + id;
    root.add(g);
    parts.push({ id, group: g, axis: axis || 'y' });
    return g;
  };
  const gPlate    = mk('plate');
  const gScrewCov = mk('screw_cover');
  const gBoard    = mk('board_lo');
  const gScrew    = mk('screw_lo');
  const gIoF      = mk('io_front');
  const gIoL      = mk('io_left');
  const gIoR      = mk('io_right');
  const gRiser    = mk('risers');
  const gLcd      = mk('lcd');
  const gIface    = mk('iface');
  const gLid      = mk('lid');
  const gSma      = mk('sma', 'x');

  // =====================================================================
  // PLATE — mounting plate, case floor, board bosses
  // =====================================================================
  const POSTS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  {
    const pw = W + 0.0020, pd = D + 0.0270;
    const s = roundedOutline(pw, pd, 0.0045);
    const HOLES = [];
    [-1, 1].forEach(sz => [-1, 1].forEach(sx => HOLES.push([sx * 0.0400, sz * (D / 2 + 0.0088)])));
    HOLES.forEach(([hx, hz]) => s.holes.push(holeAt(hx, hz, 0.0024)));
    POSTS.forEach(([sx, sz]) =>
      s.holes.push(holeAt(sx * (W / 2 - CR), sz * (D / 2 - CR), 0.0014)));
    const g = new THREE.ExtrudeGeometry(s, { depth: PLT, bevelEnabled: false, curveSegments: 16 });
    g.rotateX(-Math.PI / 2); g.translate(0, -PLT, 0);
    const m = new THREE.Mesh(g, M.case);
    m.name = 'mount_plate'; gPlate.add(m);
    HOLES.forEach(([hx, hz], i) => {
      const cs = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0046, 0.0024, 0.0024, 24, 1, true), M.case);
      cs.name = 'mount_countersink_' + (i + 1);
      cs.position.set(hx, -0.0012, hz);
      gPlate.add(cs);
    });
  }
  gPlate.add(slab('case_shell_floor', W, D, 0.0062, CR, M.caseTop, 0, 0,
    POSTS.map(([sx, sz]) => holeAt(sx * (W / 2 - CR), sz * (D / 2 - CR), 0.0014))));

  // =====================================================================
  // LID — unibody shell: walls, corner posts, top face, all panel printing
  // =====================================================================
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
  const TERM_F = { x: -0.0149, y: 0.0150, poles: 10 };
  const ETH = { x: 0.0215, y: 0.0165 }, USBB = { x: 0.0373, y: 0.0163 };
  const TERM_L = { z: -0.0320, y: 0.0150, poles: 10 };
  const TERM_G = { z: 0.0217, y: 0.0150, poles: 2 };
  const TERM_R = { z: 0.0407, y: 0.0150, poles: 6 };
  const SMA = { z: -0.0374, y: 0.0210 };
  {
    const p = panel('wall_front', SPAN_X, 0, WALL_TOP, [
      { x: TERM_F.x, y: TERM_F.y, w: TERM_F.poles * PITCH + 0.0006, h: 0.0106 },
      { x: ETH.x,  y: ETH.y,  w: 0.0168, h: 0.0152 },
      { x: USBB.x, y: USBB.y, w: 0.0132, h: 0.0136 },
    ]);
    p.position.z = D / 2 - WT; gLid.add(p);
  }
  { const p = panel('wall_rear', SPAN_X, 0, WALL_TOP); p.position.z = -D / 2; gLid.add(p); }
  {
    const p = panel('wall_left', SPAN_Z, 0, WALL_TOP, [
      { x: -TERM_L.z, y: TERM_L.y, w: TERM_L.poles * PITCH + 0.0006, h: 0.0106 },
      { x: -TERM_G.z, y: TERM_G.y, w: TERM_G.poles * PITCH + 0.0006, h: 0.0106 },
    ]);
    p.rotation.y = Math.PI / 2; p.position.x = -W / 2; gLid.add(p);
  }
  {
    const p = panel('wall_right', SPAN_Z, 0, WALL_TOP, [
      { x: TERM_R.z, y: TERM_R.y, w: TERM_R.poles * PITCH + 0.0006, h: 0.0106 },
      { x: SMA.z, y: SMA.y, r: 0.0024 },
    ]);
    p.rotation.y = -Math.PI / 2; p.position.x = W / 2; gLid.add(p);
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
      m.name = 'corner_post_' + (i + 1); gLid.add(m);
    });

  // cover screws — driven UP from under the plate into the corner posts,
  // so the finished top face shows no fastener
  POSTS.forEach(([sx, sz], i) => {
    const n = 'screw_cover_' + (i + 1);
    const g = new THREE.Group(); g.name = n;
    g.position.set(sx * (W / 2 - CR), 0, sz * (D / 2 - CR));
    g.add(cyl(n + '_head', 0.0026, 0.0013, M.steel, 0, -PLT - 0.0007, 0, 20));
    g.add(box(n + '_slot_a', 0.0038, 0.0004, 0.0009, M.dark, 0, -PLT - 0.0014, 0));
    g.add(box(n + '_slot_b', 0.0009, 0.0004, 0.0038, M.dark, 0, -PLT - 0.0014, 0));
    g.add(cyl(n + '_shank', 0.0012, 0.0135, M.steel, 0, -PLT + 0.00675, 0, 14));
    for (let j = 0; j < 6; j++)
      g.add(cyl(n + '_thread_' + (j + 1), 0.0014, 0.0004, M.steel, 0, -0.0015 + j * 0.0014, 0, 14));
    gScrewCov.add(g);
  });

  const LCD   = { x: -0.0010, z: -0.0354, w: 0.0759, d: 0.0217 };
  const USBA  = { x: 0.0187, z: 0.0178 };
  const SD    = { x: 0.0442, z: 0.0190 };
  const TYPEC = { x: 0.0323, z: 0.0338 };
  const DB9   = { x: 0.0343, z: 0.0486 };
  const win = (x, z, w, d) => rectPath(x, z, w, d);
  gLid.add(slab('case_top_face', W - TB * 2, D - TB * 2, LT, CR - TB, M.caseTop, TOP - LT, 0, [
    win(LCD.x, LCD.z, LCD.w, LCD.d),
    win(USBA.x, USBA.z, 0.0148, 0.0080),
    win(SD.x, SD.z, 0.0152, 0.0026),
    win(TYPEC.x, TYPEC.z, 0.0092, 0.0034),
    win(DB9.x, DB9.z, 0.0172, 0.0072),
  ]));
  gLid.add(edgeRoundover('case_top_edge', W, D, CR, TB, TOP, M.caseRim));

  const R = '#c8202a';
  const FRD = { x: -0.00115, z: -0.02815, w: 0.0880, d: 0.0700 };
  gLid.add(topDecal('print_panel_frame', FRD.w, FRD.d, FRD.x, FRD.z, (g, cw) => {
    const PXM = cw / FRD.w;
    const X0 = FRD.x - FRD.w / 2, Z0 = FRD.z - FRD.d / 2;
    const X = mx => (mx - X0) * PXM, Y = mz => (mz - Z0) * PXM, S = v => v * PXM;
    g.strokeStyle = '#7a8086'; g.lineWidth = S(0.00045); g.lineJoin = 'miter';
    g.beginPath();
    g.moveTo(X(-0.0429), Y(-0.0608));
    g.lineTo(X(0.0129), Y(-0.0608));
    g.lineTo(X(0.0201), Y(-0.0542));
    g.lineTo(X(0.0406), Y(-0.0542));
    g.lineTo(X(0.0406), Y(0.0022));
    g.lineTo(X(0.0017), Y(0.0022));
    g.lineTo(X(-0.0043), Y(0.0045));
    g.lineTo(X(-0.0429), Y(0.0045));
    g.closePath(); g.stroke();
    const dx0 = X(-0.04035), dx1 = X(0.03835), dy0 = Y(-0.0499), dy1 = Y(-0.0209), r = S(0.0020);
    g.beginPath();
    g.moveTo(dx0 + r, dy0);
    g.lineTo(dx1 - r, dy0); g.quadraticCurveTo(dx1, dy0, dx1, dy0 + r);
    g.lineTo(dx1, dy1 - r); g.quadraticCurveTo(dx1, dy1, dx1 - r, dy1);
    g.lineTo(dx0 + r, dy1); g.quadraticCurveTo(dx0, dy1, dx0, dy1 - r);
    g.lineTo(dx0, dy0 + r); g.quadraticCurveTo(dx0, dy0, dx0 + r, dy0);
    g.closePath(); g.stroke();
    fitText(g, 'BEACON LOGGER', X(-0.0195), Y(-0.0559), S(0.0340), S(0.0043),
      '#3a3f45', 'bold 100px ' + FONT);
    fitText(g, 'BL-1100V2', X(0.0287), Y(-0.0577), S(0.0155), S(0.0035),
      '#3a3f45', 'bold 100px ' + FONT);
  }, 1257, 1000, 0.0004));

  gLid.add(topDecal('print_usb_glyph', 0.0080, 0.0050, USBA.x, 0.0096, usbGlyph, 130, 88));
  gLid.add(topDecal('print_sd_card', 0.0158, 0.0030, SD.x, 0.0144, centered('SD CARD'), 400, 76));
  gLid.add(topDecal('print_type_c', 0.0112, 0.0030, TYPEC.x, 0.0288, centered('TYPE C'), 300, 80));
  gLid.add(topDecal('print_port_io', 0.0128, 0.0030, 0.0348, 0.0418, centered('PORT I/O'), 320, 76));
  gLid.add(topDecal('print_gps', 0.0055, 0.0028, -0.0534, 0.0217, centered('GPS'), 150, 76));
  gLid.add(topDecal('print_rail_left', 0.0065, 0.0529, -0.0541, -0.0320, cellStrip([
    { t: '24V', w: 1, color: R }, { t: '12V', w: 1, color: R }, { t: '5V', w: 1, color: R },
    { t: 'Tx2', w: 1 }, { t: 'Rx2', w: 1 }, { t: 'Tx1', w: 1 }, { t: 'Rx1', w: 1 },
    { t: 'A', w: 1 }, { t: 'B', w: 1 }, { t: '', w: 1, ground: true },
  ], true), 132, 1074));
  gLid.add(topDecal('print_rail_right', 0.0059, 0.0311, 0.0528, 0.0407, cellStrip([
    { t: 'R1', w: 1 }, { t: 'D4', w: 1 }, { t: 'D3', w: 1 },
    { t: 'D2', w: 1 }, { t: 'D1', w: 1 }, { t: 'RST', w: 1 },
  ], true), 124, 654));
  gLid.add(topDecal('print_rail_front', 0.0829, 0.0053, 0.0018, 0.0797, cellStrip([
    { t: 'A1', w: 4.96 }, { t: 'A2', w: 4.96 }, { t: 'A3', w: 4.96 }, { t: 'A4', w: 4.96 },
    { t: 'A5', w: 4.96 }, { t: 'A6', w: 4.96 }, { t: 'A7', w: 4.96 }, { t: 'A8', w: 4.96 },
    { t: 'Vin', w: 4.96, color: R }, { t: '', w: 4.96, ground: true },
    { blank: true, w: 3.0 }, { t: 'ETH', w: 17.1 },
    { blank: true, w: 1.3 }, { t: 'USB', w: 11.9 },
  ]), 1660, 106));
  gLid.add(logoDecal('logo_stesy', '/images/logger/logo-stesy.png', 0.0488, 0.0140, -0.0003, -0.0083, 0.0006));
  const STICK = { x: -0.0131, z: 0.0367, w: 0.0537, d: 0.0147 };
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
  g.save(); g.translate(u(0.812), v(0.242));
  qrGlyph(g, 0.148 * 0.972 * cw); g.restore();
  fitText(g, 'made in Indonesia', u(0.805), v(0.905), 0.29 * 0.972 * cw, 32, '#3b4046',
    'italic 100px ' + FONT);
}, 1610, 441, 0.0004));
gLid.add(logoDecal('logo_beacon', '/images/logger/logo-beacon.png', 0.0250, 0.0066,
  STICK.x + 0.0020, STICK.z + 0.0005, 0.0008));

  // =====================================================================
  // LCD — carrier board, module, 20 × 4 STN screen
  // =====================================================================
  const MB = 0.0092, PCB_T = 0.0016;
  const DGT = 0.0260, LCDT = 0.0260;
  const FL = 0.0062;
  const fr4 = (name, w, d, y, mat, x, z, t = PCB_T, holes) => {
    const m = slab(name, w, d, t, 0.0025, mat, y - t, 0, holes);
    m.position.x = x; m.position.z = z; return m;
  };
  let lcdMat;
  {
    gLcd.add(box('lcd_module', 0.0770, 0.0125, 0.0273, M.dark,
      LCD.x, TOP - 0.0004 - 0.0062, LCD.z));
    const cv = document.createElement('canvas'); cv.width = 1000; cv.height = 267;
    const g = cv.getContext('2d');
    g.fillStyle = '#dbe23f'; g.fillRect(0, 0, 1000, 267);
    const cols = 20, rows = 4, cw = 47.2, chh = 53.0, x0 = 28, y0 = 28;
    g.fillStyle = 'rgba(72,84,20,0.055)';
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const bx = x0 + c * cw, by = y0 + r * chh;
      for (let dx = 0; dx < 5; dx++) for (let dy = 0; dy < 8; dy++)
        g.fillRect(bx + dx * 8.0, by + dy * 6.0, 6.6, 5.0);
    }
    const line = (t, row) => t.slice(0, cols).split('').forEach((ch, i) => {
      if (ch === ' ') return;
      fitText(g, ch, x0 + i * cw + cw * 0.44, y0 + row * chh + 31, cw * 0.66, 28,
        '#2a3410', 'bold 100px ' + FONT);
    });
    line('BE DATA LOGGER', 0);
    line('2026-07-31 15:06:19', 1);
    line('  12.1  > No MAP', 2);
    line('  24.3  > WRITE SENT', 3);
    g.fillStyle = '#2a3410';
    g.fillRect(x0 + 6, y0 + 2 * chh + 11, 16, 24);
    g.fillRect(x0 + 6, y0 + 3 * chh + 11, 16, 24);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
    lcdMat = new THREE.MeshStandardMaterial({
      name: 'lcd_screen', map: tex, emissiveMap: tex, emissive: 0xffffff,
      emissiveIntensity: 0, roughness: 0.30, metalness: 0,
    });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.0739, 0.0197), lcdMat);
    scr.name = 'lcd_screen'; scr.rotation.x = -Math.PI / 2;
    scr.position.set(LCD.x, TOP - 0.0002, LCD.z);
    scr.userData.noShadow = true;
    gLcd.add(scr);
  }
  const LCD_MNT = [[-0.0400, -0.0142], [0.0400, -0.0142], [-0.0400, 0.0142], [0.0400, 0.0142]];
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
  gLcd.add(fr4('lcd_carrier_pcb', 0.0900, 0.0356, LCDT, M.pcbG, LCD.x, LCD.z, PCB_T,
    LCD_MNT.map(([x, z]) => holeAt(x, z, 0.0013))));
  LCD_MNT.forEach(([dx, dz], i) => {
    gLcd.add(standoff('lcd_standoff_' + (i + 1), LCD.x + dx, LCD.z + dz, MB, LCDT - PCB_T, 0.0024));
    gLcd.add(screwHead('lcd_screw_' + (i + 1), LCD.x + dx, LCDT, LCD.z + dz, 0.0022));
  });
  gLcd.add(box('lcd_header_16p', 0.0420, 0.0018, 0.0026, M.blackP, LCD.x, LCDT + 0.0009, LCD.z + 0.0148));
  gLcd.add(box('lcd_ribbon_shell', 0.0055, 0.0016, 0.0120, M.label, -0.0400, LCDT - 0.0008, LCD.z + 0.0090));

  // =====================================================================
  // RISERS — mezzanine cards + their flush top-face ports
  // =====================================================================
  gRiser.add(box('usb_a_shell',  0.0148, 0.0140, 0.0080, M.steel, USBA.x, TOP - 0.0078, USBA.z));
  gRiser.add(box('usb_a_cavity', 0.0126, 0.0120, 0.0058, M.dark,  USBA.x, TOP - 0.0064, USBA.z));
  gRiser.add(topDecal('usb_a_insert', 0.0122, 0.0054, USBA.x, USBA.z, (g, cw, ch) => {
    g.fillStyle = '#dad7d0';
    g.fillRect(0, ch * 0.44, cw, ch * 0.40);
    g.fillStyle = '#c9a95f';
    for (let i = 0; i < 4; i++) g.fillRect(cw * (0.17 + i * 0.185), ch * 0.48, cw * 0.08, ch * 0.30);
    g.fillStyle = '#8d8a84'; g.fillRect(0, ch * 0.84, cw, ch * 0.05);
  }, 244, 108, -0.0003));
  gRiser.add(box('sd_holder', 0.0158, 0.0100, 0.0030, M.steel, SD.x, TOP - 0.0062, SD.z));
  gRiser.add(box('sd_slot',   0.0150, 0.0040, 0.0018, M.dark,  SD.x, TOP - 0.0022, SD.z));
  gRiser.add(box('usb_c_shell',  0.0092, 0.0090, 0.0036, M.steel, TYPEC.x, TOP - 0.0057, TYPEC.z));
  gRiser.add(box('usb_c_throat', 0.0086, 0.0034, 0.0030, M.dark,  TYPEC.x, TOP - 0.0021, TYPEC.z));
  gRiser.add(pill('usb_c_slot',   0.0086, 0.0030, 0.0007, M.dark,  TYPEC.x, TOP - 0.0009, TYPEC.z));
  gRiser.add(pill('usb_c_tongue', 0.0042, 0.0009, 0.0003, M.label, TYPEC.x, TOP - 0.0003, TYPEC.z));
  function mezz(name, w, d, top, x, z) {
    gRiser.add(fr4(name, w, d, top, M.pcbB, x, z, 0.0014));
    [-1, 1].forEach(s => {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.0012, top - 0.0014 - MB, d * 0.72), M.pcbB);
      c.name = name + '_support_' + (s > 0 ? 'r' : 'l');
      c.position.set(x + s * (w / 2 - 0.0018), (MB + top - 0.0014) / 2, z);
      gRiser.add(c);
    });
    const pins = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.0018, 0.0018), M.gold);
    pins.name = name + '_pins'; pins.position.set(x, MB + 0.0009, z);
    gRiser.add(pins);
  }
  mezz('mezz_usb_a',  0.0178, 0.0144, TOP - 0.0148, USBA.x, USBA.z);
  mezz('mezz_sd',     0.0176, 0.0106, TOP - 0.0112, SD.x, SD.z);
  mezz('mezz_type_c', 0.0116, 0.0058, TOP - 0.0102, TYPEC.x, TYPEC.z);

  // =====================================================================
  // IO — pluggable wall terminals and jacks
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
    const f = pinHeader('term_front', TERM_F.poles, PITCH);
    f.position.set(TERM_F.x, TERM_F.y, D / 2);
    gIoF.add(f);
    const l = pinHeader('term_left', TERM_L.poles, PITCH);
    l.rotation.y = -Math.PI / 2;
    l.position.set(-W / 2, TERM_L.y, TERM_L.z);
    gIoL.add(l);
    const gp = pinHeader('term_gps_feed', TERM_G.poles, PITCH);
    gp.rotation.y = -Math.PI / 2;
    gp.position.set(-W / 2, TERM_G.y, TERM_G.z);
    gIoL.add(gp);
    const r = pinHeader('term_right', TERM_R.poles, PITCH);
    r.rotation.y = Math.PI / 2;
    r.position.set(W / 2, TERM_R.y, TERM_R.z);
    gIoR.add(r);
  }
  {
    const g = new THREE.Group(); g.name = 'eth_rj45';
    g.add(box('rj45_housing', 0.0160, 0.0146, 0.0220, M.steel, 0, 0, -0.0110));
    g.add(box('rj45_mouth',   0.0132, 0.0110, 0.0040, M.dark,  0, -0.0012, -0.0010));
    g.add(box('rj45_key',     0.0056, 0.0044, 0.0034, M.dark,  0, 0.0052, -0.0008));
    g.add(box('rj45_contacts', 0.0098, 0.0012, 0.0016, M.gold, 0, 0.0020, -0.0016));
    g.add(box('rj45_led_l', 0.0024, 0.0016, 0.0012, M.ledG, -0.0056, 0.0058, 0.0002));
    g.add(box('rj45_led_r', 0.0024, 0.0016, 0.0012, M.ledA,  0.0056, 0.0058, 0.0002));
    g.position.set(ETH.x, ETH.y, D / 2);
    gIoF.add(g);
  }
  {
    const g = new THREE.Group(); g.name = 'usb_b_port';
    g.add(box('usb_b_shell', 0.0126, 0.0130, 0.0180, M.steel, 0, 0, -0.0090));
    g.add(box('usb_b_mouth', 0.0100, 0.0100, 0.0034, M.dark,  0, 0, -0.0012));
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
  // SMD helpers
  // =====================================================================
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

  // =====================================================================
  // MAIN BOARD (gBoard) + its fasteners (gScrew) + bosses (gPlate)
  // =====================================================================
  const PCB_HOLES = [[-0.0470, -0.0700], [0.0470, -0.0700], [-0.0470, 0.0700], [0.0470, 0.0700]];
  gBoard.add(fr4('main_pcb', 0.1120, 0.1620, MB, M.pcb, 0, 0, PCB_T,
    PCB_HOLES.map(([x, z]) => holeAt(x, z, 0.0016))));
  PCB_HOLES.forEach(([x, z], i) => {
    gPlate.add(cyl('pcb_boss_' + (i + 1), 0.0035, MB - FL, M.caseTop, x, (FL + MB) / 2, z, 18));
    gScrew.add(screwHead('pcb_screw_' + (i + 1), x, MB, z));
  });
  [-0.0380, -0.0170, 0.0040, 0.0250].forEach((x, i) => {
    gBoard.add(cyl('cap_' + (i + 1), 0.0040, 0.0110, M.alum, x, MB + 0.0055, -0.0640, 20));
    gBoard.add(cyl('cap_' + (i + 1) + '_top', 0.0039, 0.0004, M.blackP, x, MB + 0.0112, -0.0640, 20));
  });
  gBoard.add(box('inductor_1', 0.0100, 0.0070, 0.0100, M.blackP, -0.0380, MB + 0.0035, -0.0490));
  gBoard.add(box('inductor_2', 0.0100, 0.0070, 0.0100, M.blackP, -0.0160, MB + 0.0035, -0.0490));
  gBoard.add(box('ic_driver_1', 0.0092, 0.0018, 0.0052, M.blackP, -0.0040, MB + 0.0009, -0.0520));
  gBoard.add(box('ic_driver_2', 0.0092, 0.0018, 0.0052, M.blackP, 0.0140, MB + 0.0009, -0.0520));
  gBoard.add(cyl('coin_cell', 0.0098, 0.0032, M.nickel, 0.0400, MB + 0.0016, 0.0620, 28));
  gBoard.add(box('coin_holder', 0.0210, 0.0014, 0.0070, M.blackP, 0.0400, MB + 0.0007, 0.0620));
  gBoard.add(box('relay_r1', 0.0190, 0.0152, 0.0152, M.blackP, 0.0400, MB + 0.0076, 0.0330));
  // green terminal skirts: board up to the wall-port headers
  gBoard.add(box('term_front_base', TERM_F.poles * PITCH, TERM_F.y - 0.0039 - MB, 0.0090,
    M.green, TERM_F.x, (MB + TERM_F.y - 0.0039) / 2, D / 2 - 0.0055));
  gBoard.add(box('term_left_base', 0.0090, TERM_L.y - 0.0039 - MB, TERM_L.poles * PITCH,
    M.green, -W / 2 + 0.0055, (MB + TERM_L.y - 0.0039) / 2, TERM_L.z));
  gBoard.add(box('term_gps_base', 0.0090, TERM_G.y - 0.0039 - MB, TERM_G.poles * PITCH,
    M.green, -W / 2 + 0.0055, (MB + TERM_G.y - 0.0039) / 2, TERM_G.z));
  gBoard.add(box('term_right_base', 0.0090, TERM_R.y - 0.0039 - MB, TERM_R.poles * PITCH,
    M.green, W / 2 - 0.0055, (MB + TERM_R.y - 0.0039) / 2, TERM_R.z));

  chipRun(gBoard, 'r_bank_a', -0.0400, 0.0700, 8, 0.0052, 1206, M.smdR);
  chipRun(gBoard, 'r_bank_b', -0.0380, 0.0630, 7, 0.0052, 805, M.smdR);
  chipRun(gBoard, 'c_bank_a', -0.0490, 0.0450, 6, 0.0048, 603, M.smdC);
  chipRun(gBoard, 'c_bank_b', -0.0490, 0.0390, 6, 0.0048, 603, M.smdC, false, 805);
  chipRun(gBoard, 'c_bank_c', -0.0510, -0.0060, 7, 0.0044, 603, M.smdC);
  chipRun(gBoard, 'r_bank_c', -0.0510, 0.0020, 7, 0.0044, 603, M.smdR);
  chipRun(gBoard, 'r_rail_l', -0.0400, -0.0740, 9, 0.0052, 805, M.smdR);
  chipRun(gBoard, 'c_rail_r', 0.0500, -0.0340, 5, 0.0052, 603, M.smdC, true);
  [[-0.0290, -0.0110], [0.0120, -0.0110], [0.0330, 0.0140]].forEach(([x, z], i) =>
    gBoard.add(sop('drv_sop8_' + (i + 1), x, MB, z, 8, 0.0050, 0.0040)));
  [[-0.0470, 0.0330], [-0.0350, 0.0330], [0.0210, 0.0450], [0.0500, -0.0120]].forEach(([x, z], i) =>
    gBoard.add(sot23('q_main_' + (i + 1), x, MB, z, i % 2 === 1)));
  gBoard.add(qfp('mcu_main', -0.0210, MB, 0.0230, 0.0110, 8));
  [['led_pwr', -0.0510, 0.0500, M.ledGrn], ['led_act', -0.0510, 0.0440, M.ledRed],
   ['led_gps', -0.0510, 0.0380, M.ledGrn], ['led_bt', -0.0510, 0.0320, M.ledRed]]
    .forEach(([n, x, z, m]) => gBoard.add(ledSmd(n, x, MB, z, m)));
  for (let i = 0; i < 6; i++) gBoard.add(pad('tp_main_' + (i + 1), -0.0170 + i * 0.0060, MB, 0.0700));
  for (let i = 0; i < 24; i++)
    gBoard.add(via('via_main_' + (i + 1), -0.0500 + (i % 12) * 0.0086, MB,
      -0.0700 + Math.floor(i / 12) * 0.0075));
  for (let i = 0; i < 10; i++)
    gBoard.add(pad('hdr_exp_pad_' + (i + 1), 0.0500, MB, -0.0260 + i * 0.0043, 0.0008));

  // =====================================================================
  // INTERFACE DAUGHTERBOARD (gIface)
  // =====================================================================
  function polyBoard(name, pts, y, t, mat, holes) {
    const s = new THREE.Shape();
    pts.forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z));
    s.closePath();
    (holes || []).forEach(p => s.holes.push(p));
    const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
    g.rotateX(-Math.PI / 2); g.translate(0, y - t, 0);
    const m = new THREE.Mesh(g, mat); m.name = name; return m;
  }
  const IF = { x0: -0.0530, x1: 0.0530, z0: -0.0110, z1: 0.0760 };
  const IF_MNT = [[-0.0455, -0.0040], [-0.0498, 0.0716], [0.0490, 0.0060], [0.0490, 0.0716]];
  gIface.add(polyBoard('interface_pcb', [
    [IF.x0, IF.z0], [IF.x1, IF.z0], [IF.x1, IF.z1], [IF.x0, IF.z1],
  ], DGT, PCB_T, M.pcbB, [
    rectPath(USBA.x, USBA.z, 0.0192, 0.0158),
    rectPath(SD.x, SD.z, 0.0190, 0.0120),
    rectPath(TYPEC.x, TYPEC.z, 0.0130, 0.0072),
    rectPath(DB9.x, DB9.z, 0.0298, 0.0130),
    ...IF_MNT.map(([x, z]) => holeAt(x, z, 0.0015)),
  ]));
  IF_MNT.forEach(([x, z], i) => {
    gIface.add(standoff('interface_standoff_' + (i + 1), x, z, MB, DGT - PCB_T));
    gIface.add(screwHead('interface_screw_' + (i + 1), x, DGT, z));
  });
  gIface.add(whiteLogoDecal('interface_logo_white', '/images/logger/logo-beacon.png',
    0.0250, 0.0066, 0.0300, DGT + 0.0003, -0.0038));

  // DE-9 body bridging board to the top face
  gIface.add(box('db9_body', 0.0284, (TOP - 0.0084) - DGT, 0.0116, M.steel,
    DB9.x, (DGT + TOP - 0.0084) / 2, DB9.z));
  gIface.add(box('db9_body_shroud', 0.0180, 0.0060, 0.0092, M.blackP, DB9.x, DGT + 0.0030, DB9.z));
  {
    const g = new THREE.Group(); g.name = 'port_io_db9';
    g.add(box('db9_riser', 0.0184, 0.0080, 0.0080, M.steel, 0, TOP - 0.0044, 0));
    g.add(flangePlate('db9_flange', 0.0284, 0.0100, 0.0012, 0.0011, M.nickel, 0, TOP + 0.0001, 0));
    g.add(dShell('db9_insert', 0.0058, 0.0074, 0.0031, 0.0014, M.blue, TOP + 0.0011));
    [-1, 1].forEach((s, i) => {
      g.add(cyl('db9_jackscrew_' + (i + 1), 0.0024, 0.0028, M.brass, s * 0.0123, TOP + 0.0014, 0, 20));
      g.add(cyl('db9_jackscrew_bore_' + (i + 1), 0.0010, 0.0006, M.dark, s * 0.0123, TOP + 0.0027, 0, 14));
    });
    g.position.set(DB9.x, 0, DB9.z);
    gIface.add(g);
    gIface.add(topDecal('print_db9_pins', 0.0106, 0.0050, DB9.x, DB9.z - 0.0003,
      db9Holes, 240, 114, 0.0026));
  }
  [[-0.0505, 'a'], [-0.0481, 'b']].forEach(([x, tag]) => {
    gIface.add(box('hdr_left_' + tag, 0.0026, 0.0026, 0.0170, M.blackP, x, DGT + 0.0013, 0.0400));
    for (let i = 0; i < 6; i++)
      gIface.add(box('hdr_left_' + tag + '_pin_' + (i + 1), 0.0007, 0.0058, 0.0007, M.brass,
        x, DGT + 0.0030, 0.0330 + i * 0.0026));
  });
  gIface.add(box('tact_rst', 0.0060, 0.0032, 0.0060, M.blackP, -0.0330, DGT + 0.0016, 0.0700));
  gIface.add(box('tact_rst_cap', 0.0032, 0.0012, 0.0032, M.red, -0.0330, DGT + 0.0038, 0.0700));
  gIface.add(box('tact_wdt', 0.0060, 0.0032, 0.0060, M.blackP, 0.0150, DGT + 0.0016, 0.0560));
  gIface.add(box('tact_wdt_cap', 0.0032, 0.0012, 0.0032, M.red, 0.0150, DGT + 0.0038, 0.0560));
  gIface.add(sop('rs232_soic16', 0.0270, DGT, 0.0650, 16, 0.0100, 0.0045));
  gIface.add(box('mini_usb_shell', 0.0080, 0.0044, 0.0070, M.steel, 0.0400, DGT + 0.0022, 0.0712));
  gIface.add(box('mini_usb_mouth', 0.0064, 0.0028, 0.0016, M.dark, 0.0400, DGT + 0.0022, 0.0748));
  for (let i = 0; i < 5; i++)
    gIface.add(ledSmd('dg_led_' + i, -0.0512, DGT, 0.0620 + i * 0.0032, i % 2 ? M.ledRed : M.ledGrn));

  MBY = DGT;
  chipRun(gIface, 'dg_r_a', 0.0130, 0.0035, 6, 0.0046, 805, M.smdR);
  chipRun(gIface, 'dg_c_a', 0.0110, 0.0620, 7, 0.0046, 603, M.smdC);
  chipRun(gIface, 'dg_r_b', -0.0320, 0.0752, 4, 0.0046, 603, M.smdR);
  chipRun(gIface, 'dg_c_b', 0.0340, 0.0684, 3, 0.0044, 603, M.smdC);
  chipRun(gIface, 'dg_r_c', -0.0150, 0.0640, 4, 0.0046, 603, M.smdR);
  gIface.add(sot23('dg_q_1', -0.0430, DGT, 0.0700, true));
  for (let i = 0; i < 4; i++)
    gIface.add(pad('dg_pad_jp1_' + (i + 1), -0.0290 + i * 0.0026, DGT, 0.0748, 0.0007));
  for (let i = 0; i < 7; i++)
    gIface.add(via('dg_via_' + (i + 1), 0.0140 + i * 0.0055, DGT, 0.0068));
  [[-0.0250, -0.0020], [-0.0100, -0.0020]].forEach(([x, z], i) =>
    gIface.add(sop('dg_opto_' + (i + 1), x, DGT, z, 8, 0.0056, 0.0044)));
  gIface.add(sop('dg_buffer_a', -0.0330, DGT, 0.0130, 16, 0.0100, 0.0046));
  gIface.add(sop('dg_buffer_b', -0.0100, DGT, 0.0130, 16, 0.0100, 0.0046));
  gIface.add(qfp('dg_expander', -0.0330, DGT, 0.0300, 0.0090, 7));
  gIface.add(sop('dg_driver_x2', -0.0110, DGT, 0.0300, 16, 0.0100, 0.0046));
  gIface.add(sop('dg_reg_x3', -0.0330, DGT, 0.0470, 8, 0.0060, 0.0044));
  [[-0.0140, 0.0470], [0.0020, 0.0470]].forEach(([x, z], i) =>
    gIface.add(cyl('dg_cap_el_' + (i + 1), 0.0032, 0.0070, M.alum, x, DGT + 0.0035, z, 18)));
  [[-0.0430, 0.0100], [-0.0430, 0.0330], [-0.0430, 0.0470], [-0.0200, 0.0400]]
    .forEach(([x, z], i) => gIface.add(box('dg_ind_' + (i + 1), 0.0060, 0.0034, 0.0060,
      M.blackP, x, DGT + 0.0017, z)));
  chipRun(gIface, 'dg_r_d', -0.0440, 0.0055, 8, 0.0046, 603, M.smdR);
  chipRun(gIface, 'dg_r_e', -0.0440, 0.0210, 8, 0.0046, 805, M.smdR);
  chipRun(gIface, 'dg_c_d', -0.0440, 0.0250, 8, 0.0046, 603, M.smdC);
  chipRun(gIface, 'dg_r_f', -0.0440, 0.0390, 8, 0.0046, 603, M.smdR);
  chipRun(gIface, 'dg_c_e', -0.0440, 0.0530, 8, 0.0046, 603, M.smdC);
  chipRun(gIface, 'dg_c_f', -0.0060, 0.0055, 4, 0.0046, 805, M.smdC);
  chipRun(gIface, 'dg_r_g', -0.0060, 0.0390, 4, 0.0046, 603, M.smdR);
  chipRun(gIface, 'dg_c_g', 0.0040, 0.0250, 3, 0.0046, 603, M.smdC);
  [[-0.0470, 0.0170], [-0.0470, 0.0430], [-0.0060, 0.0170], [0.0040, 0.0330]]
    .forEach(([x, z], i) => gIface.add(sot23('dg_q_x_' + (i + 1), x, DGT, z, i % 2 === 0)));
  for (let i = 0; i < 14; i++)
    gIface.add(via('dg_via_grid_' + (i + 1), -0.0430 + (i % 7) * 0.0070, DGT,
      0.0175 + Math.floor(i / 7) * 0.0245));
  for (let i = 0; i < 6; i++)
    gIface.add(pad('dg_tp_' + (i + 1), -0.0430 + i * 0.0090, DGT, 0.0560, 0.0008));
  MBY = MB;

  // ---- runtime ---------------------------------------------------------
  const glow = [[M.ledG, 0.55], [M.ledA, 0.55], [M.ledRed, 0.35], [M.ledGrn, 0.35], [lcdMat, 0.42]];
  function setPower(v) {
    glow.forEach(([m, b]) => { m.emissiveIntensity = b * v; });
    lcdMat.color.setScalar(0.30 + 0.70 * Math.min(1, v));
  }
  setPower(0);

  root.scale.setScalar(1.72);
  // only structural parts cast shadows — sub-mm SMD detail would double the
  // draw-call count in the shadow pass for nothing
  const NO_CAST = /^(chip|via|pad|led|tp_|dg_|r_bank|c_bank|r_rail|c_rail|hdr_|q_main|drv_|mcu_|rs232|xtal|ic2_|sot|smd)/;
  root.traverse(o => {
    if (!o.isMesh) return;
    o.receiveShadow = true;
    o.castShadow = !o.userData.noShadow && !NO_CAST.test(o.name) &&
      !/_lead|_thread_|_end_|_pin_|_slot_[ab]$/.test(o.name);
  });
  return { root, parts, setPower, dims: { W, D, TOP } };
}
