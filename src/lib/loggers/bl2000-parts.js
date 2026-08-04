// @ts-nocheck
/**
 * BL-2000 Data Logger — canonical assembly tree.
 *
 * Every physical part exists exactly once, positioned at its ASSEMBLED pose.
 * Each animated part lives in its own wrapper group whose transform is
 * identity when assembled; the animator offsets/rotates the wrapper to
 * explode it. Nothing here knows about time — see the .dc.html for that.
 */

export function buildAssembly(THREE) {
  const texLoader = new THREE.TextureLoader();

  // ---- materials -----------------------------------------------------
  const M = {
    case:   new THREE.MeshStandardMaterial({ name:'case_white',      color:0xf7f7f6, roughness:0.55, metalness:0.04 }),
    caseTop:new THREE.MeshStandardMaterial({ name:'case_top',        color:0xfbfbfa, roughness:0.50, metalness:0.04 }),
    dark:   new THREE.MeshStandardMaterial({ name:'bezel_black',     color:0x1b1e23, roughness:0.45, metalness:0.10 }),
    glass:  new THREE.MeshStandardMaterial({ name:'screen_glass',    color:0x0c1014, roughness:0.14, metalness:0.15 }),
    green:  new THREE.MeshStandardMaterial({ name:'terminal_green',  color:0x2f7d34, roughness:0.55, metalness:0.05 }),
    brass:  new THREE.MeshStandardMaterial({ name:'brass',           color:0xcf9c33, roughness:0.33, metalness:0.38 }),
    steel:  new THREE.MeshStandardMaterial({ name:'steel',           color:0xc3c7cb, roughness:0.28, metalness:0.38 }),
    blue:   new THREE.MeshStandardMaterial({ name:'connector_blue',  color:0x4a90c8, roughness:0.42, metalness:0.08 }),
    label:  new THREE.MeshStandardMaterial({ name:'label_grey',      color:0xb9b7b1, roughness:0.70, metalness:0.02 }),
    pcb:    new THREE.MeshStandardMaterial({ name:'pcb_black',       color:0x171a1f, roughness:0.60, metalness:0.06 }),
    pcbG:   new THREE.MeshStandardMaterial({ name:'pcb_green',       color:0x1d6b33, roughness:0.50, metalness:0.05 }),
    gold:   new THREE.MeshStandardMaterial({ name:'gold_pad',        color:0xd6ae57, roughness:0.30, metalness:0.60 }),
    ic:     new THREE.MeshStandardMaterial({ name:'ic_body',         color:0x232629, roughness:0.40, metalness:0.08 }),
    res:    new THREE.MeshStandardMaterial({ name:'smd_resistor',    color:0x2c2219, roughness:0.52, metalness:0.05 }),
    cap:    new THREE.MeshStandardMaterial({ name:'smd_capacitor',   color:0xa98a5e, roughness:0.60, metalness:0.04 }),
    choke:  new THREE.MeshStandardMaterial({ name:'ferrite_choke',   color:0x0e1012, roughness:0.82, metalness:0.02 }),
  };
  const mkLed = (name, hex) => new THREE.MeshStandardMaterial({
    name, color:0xd9cfc0, emissive:hex, emissiveIntensity:0.0, roughness:0.35,
  });
  M.ledR = mkLed('led_red', 0xb52a22);
  M.ledG = mkLed('led_green', 0x2f9c4a);
  const leds = [M.ledR, M.ledG];

  // ---- primitives ----------------------------------------------------
  const box = (name, w, h, d, mat, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.name = name; m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  };
  const cyl = (name, r, h, mat, x, y, z, seg = 32) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
    m.name = name; m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  };
  const part = (name, w, d, h, mat, x, z, surf) => box(name, w, h, d, mat, x, surf + h / 2, z);

  // ---- dimensions ----------------------------------------------------
  const W = 0.262, D = 0.146;
  const TOP = 0.049;                       // outer top surface
  const PLT = 0.0035, LIDT = 0.0045, WALLT = 0.0035;
  const WALLH = TOP - LIDT - PLT;
  const PT = 0.0016;                       // pcb thickness
  const BW = W - 0.006, BD = D - 0.006;    // board footprint
  const STAND_LO = 0.0060;                 // base plate -> lower board

  const YB = PLT + STAND_LO, S0 = YB + PT;         // lower board / its surface
  const YT = YB + 0.0269,    S1 = YT + PT;         // upper board / its surface
                                                   // 0.0269 puts the panel connectors
                                                   // flush with the cover cutouts
  const HOLES = [[-0.1080, -0.0605], [-0.1080, 0.0400], [0.1080, -0.0605], [0.1080, 0.0400]];

  // ---- part registry -------------------------------------------------
  const root = new THREE.Group(); root.name = 'bl2000_assembly';
  const parts = [];
  const byId = {};
  function mkPart(id, label, from, spin, axis) {
    const g = new THREE.Group(); g.name = id;
    root.add(g);
    const rec = { id, label, group: g, from, spin: spin || 0, axis: axis || 'y' };
    parts.push(rec); byId[id] = rec;
    return g;
  }

  // =====================================================================
  // shared shape helpers
  // =====================================================================
  function roundedOutline(w, d, r) {
    const s = new THREE.Shape();
    const hw = w / 2 - r, hd = d / 2 - r;
    s.moveTo(-hw - r, -hd);
    s.lineTo(-hw - r, hd); s.quadraticCurveTo(-hw - r, hd + r, -hw, hd + r);
    s.lineTo(hw, hd + r);  s.quadraticCurveTo(hw + r, hd + r, hw + r, hd);
    s.lineTo(hw + r, -hd); s.quadraticCurveTo(hw + r, -hd - r, hw, -hd - r);
    s.lineTo(-hw, -hd - r); s.quadraticCurveTo(-hw - r, -hd - r, -hw - r, -hd);
    return s;
  }
  const rectPath = (cx, cy, w, h) => {
    const p = new THREE.Path();
    p.moveTo(cx - w / 2, cy - h / 2); p.lineTo(cx - w / 2, cy + h / 2);
    p.lineTo(cx + w / 2, cy + h / 2); p.lineTo(cx + w / 2, cy - h / 2);
    p.closePath(); return p;
  };
  function slab(name, w, d, h, r, mat, y, bevel = 0.0018) {
    const g = new THREE.ExtrudeGeometry(roundedOutline(w, d, r), {
      depth: h - bevel * 2, bevelEnabled: bevel > 0, bevelThickness: bevel,
      bevelSize: bevel, bevelSegments: 3, curveSegments: 8,
    });
    g.rotateX(-Math.PI / 2);
    g.translate(0, y + bevel, 0);
    const m = new THREE.Mesh(g, mat);
    m.name = name; m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function pcbSlab(name, w, d, h, mat, y) {
    const hw = w / 2, hd = d / 2, c = 0.0145, nF = 0.0200, nR = 0.0150;
    // corner notches at all four corners clear the cover's screw bosses
    const s = new THREE.Shape();
    s.moveTo(-hw, hd - nR);
    s.lineTo(-hw + c, hd - nR); s.lineTo(-hw + c, hd);
    s.lineTo(hw - c, hd); s.lineTo(hw - c, hd - nR); s.lineTo(hw, hd - nR);
    s.lineTo(hw, -hd + nF); s.lineTo(hw - c, -hd + nF); s.lineTo(hw - c, -hd);
    s.lineTo(-hw + c, -hd); s.lineTo(-hw + c, -hd + nF); s.lineTo(-hw, -hd + nF);
    s.closePath();
    HOLES.forEach(([px, pz]) => {
      const hole = new THREE.Path();
      hole.absarc(px, -pz, 0.0019, 0, Math.PI * 2, true);
      s.holes.push(hole);
    });
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 10 });
    g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
    const m = new THREE.Mesh(g, mat);
    m.name = name; m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function pill(name, w, d, hh, mat, x, y, z) {
    const r = d / 2, sx = w / 2 - r;
    const sh = new THREE.Shape();
    sh.absarc(sx, 0, r, -Math.PI / 2, Math.PI / 2, false);
    sh.absarc(-sx, 0, r, Math.PI / 2, Math.PI * 1.5, false);
    const g = new THREE.ExtrudeGeometry(sh, { depth: hh, bevelEnabled: false, curveSegments: 14 });
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, mat);
    m.name = name; m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function dShell(name, hwRear, hwFront, hd, thick, mat, y) {
    const p = new THREE.Shape();
    p.moveTo(-hwRear, -hd); p.lineTo(hwRear, -hd);
    p.lineTo(hwFront, hd); p.lineTo(-hwFront, hd); p.lineTo(-hwRear, -hd);
    const g = new THREE.ExtrudeGeometry(p, { depth: thick, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, mat);
    m.name = name; m.position.y = y;
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function plate(name, w, d, r, thick, mat, y) {
    const g = new THREE.ExtrudeGeometry(roundedOutline(w, d, r),
      { depth: thick, bevelEnabled: false, curveSegments: 8 });
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, mat);
    m.name = name; m.position.y = y;
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  // canvas decal lying flat, facing +Y
  function decalAt(name, w, d, x, y, z, draw, cw = 256, ch = 64, rough = 0.62) {
    const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    draw(cv.getContext('2d'), cw, ch);
    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 16; tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshStandardMaterial({
      name: name + '_print', map: tex, roughness: rough, metalness: 0.03,
      side: THREE.DoubleSide, alphaTest: 0.32,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.name = name; m.rotation.x = -Math.PI / 2; m.position.set(x, y, z);
    m.receiveShadow = true;
    return m;
  }
  const lidDecal = (name, w, d, x, z, draw, cw, ch, lift) =>
    decalAt(name, w, d, x, TOP + (lift || 0.0005), z, draw, cw, ch);
  const silkDecal = (name, w, d, x, y, z, draw, cw, ch) =>
    decalAt(name, w, d, x, y, z, draw, cw, ch, 0.72);

  function logoDecal(name, file, w, imgW, imgH, x, y, z) {
    const tex = texLoader.load(file);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
    const mat = new THREE.MeshStandardMaterial({
      name: name + '_print', map: tex, roughness: 0.62, metalness: 0.03,
      side: THREE.DoubleSide, alphaTest: 0.2,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * imgH / imgW), mat);
    m.name = name; m.rotation.x = -Math.PI / 2; m.position.set(x, y, z);
    return m;
  }

  // ---- canvas draw routines -------------------------------------------
  const textDraw = (t, color, align) => (g, cw, ch) => {
    g.fillStyle = color || '#3b4046';
    g.font = 'bold ' + Math.round(ch * 0.78) + 'px Helvetica, Arial, sans-serif';
    g.textAlign = align || 'center'; g.textBaseline = 'middle';
    const x = align === 'left' ? 0 : align === 'right' ? cw : cw / 2;
    g.fillText(t, x, ch / 2 + ch * 0.04);
  };
  const silk = (t, align) => (gc, cw, ch) => {
    gc.fillStyle = '#cfd6dd';
    let fs = Math.round(ch * 0.74);
    gc.font = 'bold ' + fs + 'px Helvetica, Arial, sans-serif';
    while (gc.measureText(t).width > cw * 0.94 && fs > 6) {
      fs -= 1; gc.font = 'bold ' + fs + 'px Helvetica, Arial, sans-serif';
    }
    gc.textAlign = align || 'center'; gc.textBaseline = 'middle';
    gc.fillText(t, align === 'left' ? 0 : align === 'right' ? cw : cw / 2, ch / 2 + ch * 0.04);
  };
  const silkRow = labels => (gc, cw, ch) => {
    const n = labels.length, w = cw / n;
    gc.fillStyle = '#c2cad2'; gc.textAlign = 'center'; gc.textBaseline = 'middle';
    labels.forEach((t, i) => {
      let fs = Math.round(ch * 0.62);
      gc.font = 'bold ' + fs + 'px Helvetica, Arial, sans-serif';
      while (gc.measureText(t).width > w * 0.84 && fs > 6) {
        fs -= 1; gc.font = 'bold ' + fs + 'px Helvetica, Arial, sans-serif';
      }
      gc.fillText(t, i * w + w / 2, ch * 0.54);
    });
  };
  const cellRow = (labels, colors) => (g, cw, ch) => {
    const n = labels.length, w = cw / n;
    g.strokeStyle = '#6d7278';
    g.lineWidth = Math.max(2, ch * 0.045);
    g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, cw - g.lineWidth, ch - g.lineWidth);
    for (let i = 1; i < n; i++) {
      g.beginPath(); g.moveTo(i * w, 0); g.lineTo(i * w, ch); g.stroke();
    }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    labels.forEach((t, i) => {
      const cxp = i * w + w / 2;
      if (t === 'GND') {
        const r = ch * 0.26, cy = ch * 0.5;
        g.strokeStyle = '#26292e'; g.lineWidth = Math.max(2, ch * 0.05);
        g.beginPath(); g.arc(cxp, cy, r, 0, Math.PI * 2); g.stroke();
        g.beginPath(); g.moveTo(cxp, cy - r * 0.75); g.lineTo(cxp, cy - r * 0.05); g.stroke();
        [[0.62, -0.05], [0.40, 0.28], [0.18, 0.58]].forEach(([hw, dy]) => {
          g.beginPath(); g.moveTo(cxp - r * hw, cy + r * dy); g.lineTo(cxp + r * hw, cy + r * dy); g.stroke();
        });
        g.strokeStyle = '#6d7278';
        return;
      }
      g.fillStyle = (colors && colors[i]) || '#26292e';
      let fs = ch * 0.62;
      g.font = 'bold ' + Math.round(fs) + 'px Helvetica, Arial, sans-serif';
      while (g.measureText(t).width > w * 0.84 && fs > 6) {
        fs -= 1; g.font = 'bold ' + Math.round(fs) + 'px Helvetica, Arial, sans-serif';
      }
      g.fillText(t, cxp, ch * 0.54);
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
    [[5, ch * 0.30, 0.90], [4, ch * 0.70, 0.72]].forEach(([n, cy, span]) => {
      const w = cw * span, x0 = (cw - w) / 2 + w / (2 * n);
      for (let i = 0; i < n; i++) {
        g.beginPath(); g.arc(x0 + i * (w / n), cy, ch * 0.135, 0, Math.PI * 2); g.fill();
      }
    });
  };
  const qrGlyph = (g, cw) => {
    const n = 21, c = cw / n;
    g.fillStyle = '#1b1e23';
    let seed = 20260730;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const inF = (fx, fy) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7;
      if (inF(0, 0) || inF(n - 7, 0) || inF(0, n - 7)) continue;
      if (rnd() > 0.52) g.fillRect(x * c, y * c, c * 1.02, c * 1.02);
    }
    [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([fx, fy]) => {
      g.fillRect(fx * c, fy * c, 7 * c, 7 * c);
      g.save(); g.globalCompositeOperation = 'destination-out';
      g.fillRect((fx + 1) * c, (fy + 1) * c, 5 * c, 5 * c); g.restore();
      g.fillRect((fx + 2) * c, (fy + 2) * c, 3 * c, 3 * c);
    });
  };

  // ---- fasteners -------------------------------------------------------
  function panScrew(name, r, x, y, z, mat) {
    const g = new THREE.Group(); g.name = name;
    g.position.set(x, y, z);
    g.add(cyl(name + '_head', r, 0.0016, mat || M.steel, 0, 0.0008, 0, 18));
    g.add(box(name + '_slot_a', r * 1.5, 0.0004, r * 0.34, M.dark, 0, 0.0016, 0));
    g.add(box(name + '_slot_b', r * 0.34, 0.0004, r * 1.5, M.dark, 0, 0.0016, 0));
    const sl = 0.0050;
    g.add(cyl(name + '_shank', r * 0.52, sl, mat || M.steel, 0, -sl / 2, 0, 14));
    for (let i = 0; i < 4; i++)
      g.add(cyl(name + '_thread_' + (i + 1), r * 0.62, 0.00045, mat || M.steel, 0, -0.0010 - i * 0.0011, 0, 14));
    return g;
  }

  // =====================================================================
  // 1 — BASE PLATE + MOUNTING FLANGES
  // =====================================================================
  const gBase = mkPart('base', 'Pelat dasar + flange', [0, -0.062, 0]);
  {
    const g = new THREE.ExtrudeGeometry(roundedOutline(W, D, 0.006),
      { depth: PLT, bevelEnabled: false, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, M.case);
    m.name = 'base_plate'; m.castShadow = true; m.receiveShadow = true;
    gBase.add(m);
  }
  function ear(name, side) {
    const s = new THREE.Shape();
    const hw = 0.0715, L = 0.0280, r = 0.0080;
    s.moveTo(0, -hw);
    s.lineTo(L - r, -hw); s.quadraticCurveTo(L, -hw, L, -hw + r);
    s.lineTo(L, hw - r);  s.quadraticCurveTo(L, hw, L - r, hw);
    s.lineTo(0, hw);
    [-0.052, 0.052].forEach(hz => {
      const hole = new THREE.Path();
      hole.absarc(L - 0.0090, hz, 0.0046, 0, Math.PI * 2, true);
      s.holes.push(hole);
    });
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.0058, bevelEnabled: false, curveSegments: 12 });
    g.rotateX(Math.PI / 2);
    const m = new THREE.Mesh(g, M.case);
    m.name = name;
    m.position.set(side * (W / 2 - 0.014), 0.0058, 0);
    m.rotation.y = side > 0 ? 0 : Math.PI;
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  gBase.add(ear('mount_flange_left', -1));
  gBase.add(ear('mount_flange_right', 1));

  // =====================================================================
  // 2 — LOWER STANDOFFS (base plate -> lower board)
  // =====================================================================
  const gStandLo = mkPart('standoff_lo', 'Standoff bawah ×4', [0, 0.068, 0]);
  HOLES.forEach(([px, pz], i) => {
    gStandLo.add(cyl('standoff_lower_' + (i + 1), 0.0032, STAND_LO, M.brass,
      px, PLT + STAND_LO / 2, pz, 6));
  });

  // =====================================================================
  // 3 — LOWER BOARD  (power + I/O motherboard)
  // =====================================================================
  const gBoardLo = mkPart('board_lo', 'Papan utama bawah', [0, 0.100, 0]);
  function tbLite(name, poles, x, z, surf, pitch, k = 1) {
    const gp = new THREE.Group(); gp.name = name;
    const L = poles * pitch, bw = 0.0136 * k, hh = 0.0155 * k;
    gp.add(box(name + '_body', L, hh, bw, M.green, 0, hh / 2, 0));
    gp.add(box(name + '_cap', L - 0.0016, 0.0022, bw - 0.0014, M.green, 0, hh + 0.0009, 0));
    gp.add(box(name + '_plinth', L + 0.0022, 0.004, bw + 0.0020, M.green, 0, 0.002, 0));
    for (let i = 0; i < poles; i++) {
      const px = -L / 2 + pitch / 2 + i * pitch;
      gp.add(cyl(name + '_screw_' + (i + 1), 0.0017 * k, 0.0016, M.brass, px, hh + 0.0016, -0.0026 * k, 16));
      gp.add(box(name + '_port_' + (i + 1), 0.0032, 0.0034 * k, 0.0012, M.dark, px, hh * 0.42, bw / 2 + 0.0002));
      gp.add(box(name + '_rib_' + (i + 1), 0.0006, hh * 0.8, 0.0008, M.dark, px + pitch / 2, hh * 0.45, bw / 2 - 0.0004));
    }
    gp.position.set(x, surf, z);
    return gp;
  }
  {
    const G = gBoardLo;
    G.add(pcbSlab('pcb_lower', BW, BD, PT, M.pcb, YB));

    // field terminal label strips (headers themselves are a separate step)
    [['tbl_1', -0.0948, ['24V', '0V', 'GND', 'A', 'B', 'SH']],
     ['tbl_2', -0.0331, ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'RX', 'TX']],
     ['tbl_3',  0.0439, ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'SV', 'GND']]]
      .forEach(([n, x, labels]) => {
        const wStrip = labels.length * 0.0064;
        G.add(silkDecal('silk_' + n + '_labels', wStrip, 0.0058, x, S0 + 0.0004, BD / 2 - 0.0130,
          silkRow(labels), labels.length * 80, 58));
      });

    // ETH + USB-B: flush jacks on the front wall (matches the finished unit)
    {
      const FZ = D / 2 + 0.0013, JY = 0.0245;
      G.add(box('eth_housing', 0.0168, 0.0138, 0.0230, M.steel, 0.0930, JY, FZ - 0.0130));
      G.add(box('eth_opening', 0.0175, 0.0145, 0.0030, M.dark, 0.0930, JY, FZ));
      G.add(box('eth_body', 0.0140, 0.0108, 0.0018, M.glass, 0.0930, JY - 0.0006, FZ + 0.0008));
      G.add(box('eth_key', 0.0055, 0.0048, 0.0014, M.dark, 0.0930, JY + 0.0062, FZ + 0.0010));
      G.add(box('usb_b_housing', 0.0138, 0.0138, 0.0200, M.steel, 0.1155, JY, FZ - 0.0115));
      G.add(box('usb_b_frame', 0.0145, 0.0145, 0.0030, M.dark, 0.1155, JY, FZ));
      G.add(box('usb_b_mouth', 0.0105, 0.0105, 0.0020, M.glass, 0.1155, JY, FZ + 0.0007));
      G.add(box('usb_b_contacts', 0.0072, 0.0018, 0.0014, M.label, 0.1155, JY + 0.0018, FZ + 0.0012));
      G.add(box('jack_pillar_l', 0.0168, JY - 0.0069 - S0, 0.0200, M.steel, 0.0930, (S0 + JY - 0.0069) / 2, FZ - 0.0130));
      G.add(box('jack_pillar_r', 0.0138, JY - 0.0069 - S0, 0.0180, M.steel, 0.1155, (S0 + JY - 0.0069) / 2, FZ - 0.0115));
    }

    G.add(part('lb_usb_c_shell', 0.0092, 0.0048, 0.0034, M.steel, 0.1215, -0.0190, S0));
    G.add(part('lb_usb_c_mouth', 0.0062, 0.0020, 0.0014, M.dark, 0.1240, -0.0190, S0 + 0.0010));
    G.add(part('lb_sd_holder', 0.0150, 0.0140, 0.0018, M.steel, 0.1090, -0.0330, S0));
    G.add(part('lb_usb_a_shell', 0.0140, 0.0138, 0.0068, M.steel, 0.1020, -0.0545, S0));
    G.add(part('lb_usb_a_mouth', 0.0016, 0.0110, 0.0044, M.dark, 0.1085, -0.0545, S0 + 0.0012));
    G.add(part('lb_led_g', 0.0030, 0.0022, 0.0014, M.ledG, 0.0870, -0.0620, S0));
    G.add(part('lb_led_r', 0.0030, 0.0022, 0.0014, M.ledR, 0.0870, -0.0560, S0));

    [[0.0086, 'CH1'], [-0.0172, 'CH2'], [-0.0542, 'CH3'], [-0.0837, 'CH4']].forEach(([bx, tag]) => {
      G.add(cyl(tag + '_electrolytic', 0.0058, 0.0125, M.steel, bx, S0 + 0.00625, -0.0135, 20));
      G.add(cyl(tag + '_electrolytic_top', 0.0052, 0.0006, M.label, bx, S0 + 0.0128, -0.0135, 20));
      G.add(cyl(tag + '_choke', 0.0068, 0.0058, M.choke, bx, S0 + 0.0029, -0.0307, 20));
      G.add(part(tag + '_reg', 0.0110, 0.0110, 0.0030, M.ic, bx, -0.0454, S0));
      G.add(part(tag + '_reg_tab', 0.0092, 0.0016, 0.0004, M.gold, bx, -0.0512, S0));
    });
    [0.0049, -0.0259, -0.0578, -0.0898].forEach((bx, i) => {
      G.add(cyl('C' + (60 + i) + '_electrolytic', 0.0050, 0.0100, M.steel, bx, S0 + 0.0050, -0.0602, 18));
      G.add(cyl('C' + (60 + i) + '_top', 0.0045, 0.0006, M.label, bx, S0 + 0.0103, -0.0602, 18));
    });

    G.add(part('IC20_mcu', 0.0220, 0.0220, 0.0020, M.ic, 0.0135, 0.0135, S0));
    ['n', 's', 'w', 'e'].forEach((sfx, i) => {
      const e = 0.0124, pw = i < 2 ? 0.0210 : 0.0022, pd = i < 2 ? 0.0022 : 0.0210;
      const ox = i === 2 ? -e : i === 3 ? e : 0, oz = i === 0 ? -e : i === 1 ? e : 0;
      G.add(part('IC20_leads_' + sfx, pw, pd, 0.0004, M.gold, 0.0135 + ox, 0.0135 + oz, S0));
    });
    G.add(part('IC8_soic', 0.0060, 0.0140, 0.0016, M.ic, -0.0111, 0.0307, S0));
    G.add(part('IC18_soic', 0.0060, 0.0180, 0.0016, M.ic, 0.0788, 0.0025, S0));
    G.add(part('IC4_soic', 0.0060, 0.0130, 0.0016, M.ic, -0.0640, 0.0330, S0));
    G.add(part('IC10_soic', 0.0060, 0.0130, 0.0016, M.ic, -0.0830, 0.0330, S0));
    G.add(part('Q3_crystal', 0.0100, 0.0042, 0.0032, M.steel, 0.0603, -0.0209, S0));
    G.add(part('Q4_crystal', 0.0090, 0.0038, 0.0030, M.steel, 0.0148, 0.0356, S0));

    G.add(cyl('SG1_buzzer', 0.0058, 0.0038, M.ic, -0.0960, S0 + 0.0019, 0.0319, 20));
    G.add(part('U16_gnss_module', 0.0170, 0.0120, 0.0026, M.pcbG, -0.1120, -0.0200, S0));
    G.add(part('U16_gnss_shield', 0.0120, 0.0090, 0.0014, M.label, -0.1120, -0.0200, S0 + 0.0026));
    G.add(part('K1_relay', 0.0150, 0.0110, 0.0100, M.ic, -0.1150, 0.0100, S0));
    G.add(cyl('BT1_cell', 0.0100, 0.0032, M.steel, -0.1034, S0 + 0.0016, -0.0380, 24));
    G.add(part('BT1_holder', 0.0230, 0.0210, 0.0012, M.label, -0.1034, -0.0380, S0));
    G.add(part('J5_connector', 0.0090, 0.0170, 0.0060, M.caseTop, -0.1210, 0.0135, S0));
    G.add(part('JP1_link', 0.0060, 0.0026, 0.0022, M.ic, 0.0430, -0.0330, S0));
    G.add(part('JP1_link_cap', 0.0022, 0.0022, 0.0016, M.ledR, 0.0430, -0.0330, S0 + 0.0022));

    let k = 771;
    const rr = () => (k = (k * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const spots = [];
    for (let i = 0; i < 56; i++) {
      const px = -0.1180 + (i % 14) * 0.0180 + (Math.floor(i / 14) % 2) * 0.0060;
      const pz = 0.0430 - Math.floor(i / 14) * 0.0120;
      if (Math.abs(px - 0.0135) < 0.0160 && Math.abs(pz - 0.0135) < 0.0160) continue;
      if (px > 0.0850 && pz > 0.0350) continue;
      const isCap = rr() > 0.55;
      G.add(part('p' + i, isCap ? 0.0022 : 0.0018, 0.0013, isCap ? 0.0011 : 0.0007,
        isCap ? M.cap : M.res, px, pz, S0));
      spots.push([px, pz, (isCap ? 'C' : 'R') + (i + 20)]);
    }
    G.add(silkDecal('silk_lower_refdes', BW, BD, 0, S0 + 0.0004, 0, (gc, cw, ch) => {
      const u = x => (x + BW / 2) / BW * cw, v = z => (z + BD / 2) / BD * ch;
      gc.fillStyle = '#c2cad2'; gc.textAlign = 'center'; gc.textBaseline = 'middle';
      const put = (t, x, z, size) => {
        gc.font = 'bold ' + (size || 15) + 'px Helvetica, Arial, sans-serif';
        gc.fillText(t, u(x), v(z));
      };
      spots.forEach(([x, z, t]) => put(t, x, z + 0.0032, 13));
      [['IC20', 0.0135, 0.0290, 20], ['IC8', -0.0111, 0.0400], ['IC18', 0.0788, 0.0135],
       ['IC4', -0.0640, 0.0410], ['IC10', -0.0830, 0.0410], ['Q3', 0.0603, -0.0270],
       ['Q4', 0.0148, 0.0410], ['SG1', -0.0960, 0.0390], ['U16', -0.1120, -0.0290],
       ['K1', -0.1150, 0.0175], ['BT1', -0.1034, -0.0514], ['J5', -0.1210, 0.0245],
       ['JP1', 0.0430, -0.0385], ['L1', 0.0086, -0.0380], ['L2', -0.0172, -0.0380],
       ['L3', -0.0542, -0.0380], ['L4', -0.0837, -0.0380], ['C16', 0.0086, -0.0215],
       ['C69', -0.0172, -0.0215], ['C28', -0.0542, -0.0215], ['C40', -0.0837, -0.0215],
       ['IC5', 0.0086, -0.0530], ['IC9', -0.0172, -0.0530], ['IC3', -0.0542, -0.0530],
       ['IC6', -0.0837, -0.0530], ['LED9', 0.0870, -0.0672], ['USB-A', 0.1020, -0.0448],
       ['MICRO SD', 0.1090, -0.0420], ['USB-C', 0.1215, -0.0250]]
        .forEach(([t, x, z, s]) => put(t, x, z, s));
    }, 2048, 1120));
  }

  // =====================================================================
  // 4 — LOWER BOARD SCREWS
  // =====================================================================
  const gScrewLo = mkPart('screw_lo', 'Sekrup papan bawah ×4', [0, 0.084, 0], Math.PI * 6);
  HOLES.forEach(([px, pz], i) =>
    gScrewLo.add(panScrew('screw_lower_' + (i + 1), 0.0026, px, S0, pz)));

  // =====================================================================
  // 5 — INTER-BOARD STANDOFFS + BUS HEADERS
  // =====================================================================
  const gStandMid = mkPart('standoff_mid', 'Standoff antar-papan + bus header', [0, 0.098, 0]);
  [[-0.1140, -0.0450], [-0.1140, 0.0300], [0.1200, -0.0450], [0.1200, 0.0300], [0, -0.0500]]
    .forEach(([sx, sz], i) => {
      gStandMid.add(cyl('standoff_mid_' + (i + 1), 0.0030, YT - S0, M.brass,
        sx, S0 + (YT - S0) / 2, sz, 6));
    });
  [['bus_header_rear', -0.0300, -0.0330, 0.1000], ['bus_header_front', -0.0300, 0.0250, 0.0800]]
    .forEach(([n, hx, hz, hl]) => {
      gStandMid.add(part(n + '_body', hl, 0.0060, YT - S0 - 0.0012, M.dark, hx, hz, S0));
      gStandMid.add(part(n + '_pins', hl - 0.0040, 0.0016, 0.0008, M.gold, hx, hz, S0 + 0.0006));
    });

  // =====================================================================
  // 6 — UPPER BOARD (logic + panel connectors, soldered as one)
  // =====================================================================
  const gBoardUp = mkPart('board_up', 'Papan logika atas', [0, 0.126, 0]);
  {
    const G = gBoardUp;
    G.add(pcbSlab('pcb_upper', BW, BD, PT, M.pcb, YT));

    [['X3', -0.046], ['X2', -0.018], ['X1', 0.010]].forEach(([t, z]) => {
      G.add(silkDecal('silk_' + t, 0.0080, 0.0040, 0.0555, S1 + 0.0004, z, silk(t), 160, 80));
    });
    G.add(silkDecal('silk_analog_in', 0.0480, 0.0050, 0.0280, S1 + 0.0004, 0.0240,
      silk('ANALOG INPUT X8'), 480, 50));
    G.add(silkDecal('silk_power_out', 0.0400, 0.0050, 0.0280, S1 + 0.0004, -0.0605,
      silk('POWER OUT'), 400, 50));

    // bodies stop under the lid; only the dark opening reaches the top face
    const CH = TOP - 0.0046 - S1, UY = TOP - 0.0046;
    G.add(part('pcb_usb_a_shell', 0.0152, 0.0082, CH, M.steel, 0.0985, -0.0480, S1));
    G.add(part('pcb_usb_a_opening', 0.0150, 0.0075, 0.0050, M.dark, 0.0985, -0.0480, UY));
    G.add(part('pcb_usb_a_insert', 0.0122, 0.0044, 0.0016, M.label, 0.0985, -0.0488, TOP - 0.0007));
    G.add(part('pcb_usb_a_tongue', 0.0104, 0.0016, 0.0012, M.caseTop, 0.0985, -0.0472, TOP - 0.0001));
    G.add(part('pcb_sd_holder', 0.0290, 0.0072, CH, M.steel, 0.0985, -0.0280, S1));
    G.add(part('pcb_sd_slot', 0.0250, 0.0032, 0.0050, M.dark, 0.0985, -0.0280, UY));
    G.add(part('pcb_usb_c_shell', 0.0102, 0.0048, CH, M.steel, 0.0985, -0.0115, S1));
    G.add(part('pcb_usb_c_throat', 0.0092, 0.0031, 0.0046, M.dark, 0.0985, -0.0115, UY));
    G.add(pill('pcb_usb_c_slot', 0.0092, 0.0031, 0.0006, M.dark, 0.0985, TOP - 0.0002, -0.0115));
    G.add(pill('pcb_usb_c_tongue', 0.0058, 0.0012, 0.0003, M.label, 0.0985, TOP + 0.0004, -0.0115));

    const db9b = new THREE.Group(); db9b.name = 'pcb_db9_port_io';
    db9b.add(box('pcb_db9_riser', 0.0210, TOP - S1, 0.0076, M.steel, 0, (S1 + TOP) / 2, 0));
    db9b.add(plate('pcb_db9_flange', 0.0280, 0.0104, 0.0024, 0.0010, M.brass, TOP + 0.0002));
    db9b.add(dShell('pcb_db9_insert', 0.0054, 0.0070, 0.0036, 0.0013, M.blue, TOP + 0.0011));
    [-1, 1].forEach((s, i) => {
      db9b.add(cyl('pcb_db9_nut_' + (i + 1), 0.0026, 0.0022, M.brass, s * 0.0107, TOP + 0.0011, 0, 18));
      db9b.add(cyl('pcb_db9_nut_bore_' + (i + 1), 0.0011, 0.0006, M.dark, s * 0.0107, TOP + 0.0023, 0, 14));
    });
    db9b.position.set(0.0995, 0, 0.0095);
    G.add(db9b);
    G.add(silkDecal('silk_db9_pins', 0.0122, 0.0060, 0.0995, TOP + 0.0027, 0.0095, db9Holes, 220, 108));

    G.add(part('IC3_mcu', 0.0102, 0.0102, 0.0016, M.ic, 0.0770, 0.0075, S1));
    [['n', 0, -0.0060, 0.0098, 0.0018], ['s', 0, 0.0060, 0.0098, 0.0018],
     ['w', -0.0060, 0, 0.0018, 0.0098], ['e', 0.0060, 0, 0.0018, 0.0098]]
      .forEach(([sfx, ox, oz, pw, pd]) => {
        G.add(part('IC3_leads_' + sfx, pw, pd, 0.0003, M.gold, 0.0770 + ox, 0.0075 + oz, S1));
      });
    G.add(part('IC1_driver', 0.0056, 0.0132, 0.0016, M.ic, 0.0880, 0.0230, S1));
    G.add(part('IC2_regulator', 0.0068, 0.0048, 0.0018, M.ic, 0.0620, -0.0190, S1));
    G.add(part('Y1_crystal', 0.0112, 0.0046, 0.0038, M.steel, 0.0700, -0.0090, S1));
    G.add(part('RST_button_base', 0.0062, 0.0062, 0.0022, M.ic, 0.0560, 0.0148, S1));
    G.add(part('RST_button_cap', 0.0034, 0.0034, 0.0014, M.label, 0.0560, 0.0148, S1 + 0.0022));
    G.add(silkDecal('silk_rst', 0.0090, 0.0030, 0.0560, S1 + 0.0004, 0.0192, silk('RST'), 180, 60));

    [['LED1', M.ledG, -0.0430], ['LED2', M.ledR, -0.0330], ['LED3', M.ledG, -0.0230],
     ['LED4', M.ledR, -0.0130], ['LED5', M.ledG, -0.0030]].forEach(([n, mat, z]) => {
      G.add(part(n, 0.0026, 0.0016, 0.0010, mat, 0.0605, z, S1));
    });
    G.add(silkDecal('silk_leds', 0.0100, 0.0460, 0.0680, S1 + 0.0004, -0.0230, (gc, cw, ch) => {
      gc.fillStyle = '#cfd6dd'; gc.textAlign = 'center'; gc.textBaseline = 'middle';
      gc.font = 'bold ' + Math.round(cw * 0.44) + 'px Helvetica, Arial, sans-serif';
      ['LED1', 'LED2', 'LED3', 'LED4', 'LED5'].forEach((t, i) => gc.fillText(t, cw / 2, ch * (0.1 + i * 0.2)));
    }, 100, 460));

    G.add(part('JP1_body', 0.0132, 0.0028, 0.0026, M.ic, 0.0455, 0.0410, S1));
    G.add(part('JP1_pins', 0.0112, 0.0008, 0.0044, M.gold, 0.0455, 0.0410, S1));
    G.add(silkDecal('silk_jp1', 0.0090, 0.0030, 0.0455, S1 + 0.0004, 0.0455, silk('JP1'), 180, 60));

    G.add(part('IC4_soic_u', 0.0052, 0.0100, 0.0014, M.ic, 0.0905, -0.0330, S1));
    G.add(part('IC4_leads_w', 0.0016, 0.0092, 0.0003, M.gold, 0.0871, -0.0330, S1));
    G.add(part('IC4_leads_e', 0.0016, 0.0092, 0.0003, M.gold, 0.0939, -0.0330, S1));
    G.add(part('IC1_leads_w', 0.0016, 0.0124, 0.0003, M.gold, 0.0842, 0.0230, S1));
    G.add(part('IC1_leads_e', 0.0016, 0.0124, 0.0003, M.gold, 0.0918, 0.0230, S1));
    G.add(part('IC2_tab', 0.0060, 0.0016, 0.0004, M.gold, 0.0620, -0.0219, S1));
    G.add(part('Q1_sot23', 0.0030, 0.0026, 0.0011, M.ic, 0.0800, -0.0225, S1));
    G.add(part('Q2_sot23', 0.0030, 0.0026, 0.0011, M.ic, 0.0800, -0.0155, S1));
    G.add(part('D1_diode', 0.0028, 0.0017, 0.0009, M.ic, 0.0866, -0.0180, S1));
    G.add(part('C1_tant', 0.0036, 0.0024, 0.0018, M.cap, 0.0500, -0.0180, S1));
    G.add(part('L1_choke', 0.0044, 0.0038, 0.0022, M.ic, 0.0500, -0.0270, S1));
    G.add(part('F1_fuse', 0.0034, 0.0018, 0.0012, M.cap, 0.0500, -0.0100, S1));
    G.add(part('JP2_body', 0.0140, 0.0056, 0.0028, M.ic, 0.0985, 0.0330, S1));
    G.add(part('JP2_pins_a', 0.0118, 0.0008, 0.0046, M.gold, 0.0985, 0.0317, S1));
    G.add(part('JP2_pins_b', 0.0118, 0.0008, 0.0046, M.gold, 0.0985, 0.0343, S1));

    let sd = 20260731;
    const rnd = () => (sd = (sd * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let i = 0; i < 20; i++) {
      const px = 0.0545 + (i % 5) * 0.0092, pz = -0.0555 + Math.floor(i / 5) * 0.0140;
      const isCap = rnd() > 0.62;
      G.add(part('Cu' + (i + 1), isCap ? 0.0022 : 0.0018, 0.0013, isCap ? 0.0011 : 0.0007,
        isCap ? M.cap : M.res, px, pz, S1));
    }
    for (let i = 0; i < 10; i++) {
      const px = 0.0500 + (i % 5) * 0.0098, pz = 0.0270 + Math.floor(i / 5) * 0.0110;
      const isCap = rnd() > 0.55;
      G.add(part('Ru' + (i + 1), isCap ? 0.0022 : 0.0018, 0.0013, isCap ? 0.0011 : 0.0007,
        isCap ? M.cap : M.res, px, pz, S1));
    }

    G.add(silkDecal('silk_refdes', 0.0550, 0.1040, 0.0715, S1 + 0.0004, -0.0080, (gc, cw, ch) => {
      const u = x => (x - 0.0440) * 10000, v = z => (z + 0.0600) * 10000;
      gc.fillStyle = '#c9d1d9'; gc.textAlign = 'center'; gc.textBaseline = 'middle';
      const put = (t, x, z, size) => {
        gc.font = 'bold ' + (size || 19) + 'px Helvetica, Arial, sans-serif';
        const hwid = gc.measureText(t).width / 2;
        gc.fillText(t, Math.min(Math.max(u(x), hwid + 2), cw - hwid - 2), v(z));
      };
      put('IC3', 0.0770, 0.0148, 22);
      put('IC1', 0.0880, 0.0310); put('IC4', 0.0905, -0.0405);
      put('IC2', 0.0620, -0.0247); put('Y1', 0.0700, -0.0135);
      put('Q1', 0.0800, -0.0270); put('Q2', 0.0800, -0.0200);
      put('D1', 0.0866, -0.0225); put('C1', 0.0500, -0.0228);
      put('L1', 0.0500, -0.0318); put('F1', 0.0500, -0.0148);
      put('JP2', 0.0985, 0.0388);
      let kk = 20260801;
      const rr2 = () => (kk = (kk * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      for (let i = 0; i < 20; i++) {
        const px = 0.0545 + (i % 5) * 0.0092, pz = -0.0555 + Math.floor(i / 5) * 0.0140;
        put((rr2() > 0.5 ? 'R' : 'C') + (i + 2), px, pz + 0.0035, 15);
      }
      for (let i = 0; i < 10; i++) {
        const px = 0.0500 + (i % 5) * 0.0098, pz = 0.0270 + Math.floor(i / 5) * 0.0110;
        put((rr2() > 0.5 ? 'R' : 'C') + (i + 22), px, pz + 0.0033, 15);
      }
    }, 550, 1040));

    G.add(silkDecal('pad_field', 0.0070, 0.0430, -0.1238, S1 + 0.0003, 0.0070, (gc, cw, ch) => {
      gc.fillStyle = '#d6ae57';
      for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) {
        gc.beginPath(); gc.arc(cw * (0.2 + c * 0.3), ch * (0.07 + r * 0.124), cw * 0.09, 0, Math.PI * 2); gc.fill();
      }
    }, 90, 430));
    G.add(logoDecal('pcb_logo_beacon', '/images/logger/logo-beacon.png', 0.0300, 2360, 626,
      0.0280, S1 + 0.0004, -0.0320));
    G.add(silkDecal('silk_model_pcb', 0.0420, 0.0070, -0.0640, S1 + 0.0004, 0.0560,
      silk('BL - 2000   MAIN BOARD   REV.A'), 620, 62));
  }

  // =====================================================================
  // 7 — UPPER BOARD SCREWS
  // =====================================================================
  const gScrewUp = mkPart('screw_up', 'Sekrup papan atas ×4', [0, 0.106, 0], Math.PI * 6);
  HOLES.forEach(([px, pz], i) =>
    gScrewUp.add(panScrew('screw_upper_' + (i + 1), 0.0026, px, S1, pz)));

  // =====================================================================
  // 8 — DISPLAY MODULE
  // =====================================================================
  const gDisplay = mkPart('display', 'Modul display 4.3"', [0, 0.114, 0]);
  const sw = 0.107, sh = 0.101, dcx = -0.0625, dcz = -0.0045;
  const DSH = 0.0060;
  const CORNERS = [[-0.0555, -0.0470], [0.0555, -0.0470], [-0.0555, 0.0470], [0.0555, 0.0470]];
  let scrMat;
  {
    CORNERS.forEach(([ox, oz], i) => {
      gDisplay.add(cyl('lcd_standoff_' + (i + 1), 0.0024, DSH, M.brass, dcx + ox, S1 + DSH / 2, dcz + oz, 6));
    });
    const DY = S1 + DSH;
    const carrier = slab('lcd_carrier', 0.1230, 0.1080, PT, 0.003, M.pcbG, DY, 0);
    carrier.position.set(dcx, 0, dcz);
    gDisplay.add(carrier);
    const DTOP = DY + PT;
    CORNERS.forEach(([ox, oz], i) => {
      gDisplay.add(panScrew('lcd_screw_' + (i + 1), 0.0022, dcx + ox, DTOP, dcz + oz, M.steel));
    });
    gDisplay.add(part('lcd_fpc_connector', 0.0620, 0.0056, 0.0022, M.steel, dcx, dcz + 0.0425, DTOP));
    gDisplay.add(part('lcd_module', 0.1020, 0.0980, 0.0034, M.dark, dcx, dcz - 0.0020, DTOP));
    const GTOP = DTOP + 0.0034;
    gDisplay.add(part('lcd_glass', 0.0940, 0.0890, 0.0008, M.glass, dcx, dcz - 0.0020, GTOP));

    // ---- screen artwork -----------------------------------------------
    const scv = document.createElement('canvas'); scv.width = 640; scv.height = 672;
    const g = scv.getContext('2d');
    const F = (w, s) => w + ' ' + s + 'px Helvetica, Arial, sans-serif';
    const WHITE = '#eaf3f8', MUTED = '#78899a', GREEN = '#4fca5c', CYAN = '#46bfdb', AMBER = '#efa22c';
    const rr = (x, y, w, hh, r) => {
      g.beginPath();
      g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
      g.lineTo(x + w, y + hh - r); g.quadraticCurveTo(x + w, y + hh, x + w - r, y + hh);
      g.lineTo(x + r, y + hh); g.quadraticCurveTo(x, y + hh, x, y + hh - r);
      g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
    };
    g.fillStyle = '#080d14'; g.fillRect(0, 0, 640, 672);
    g.fillStyle = WHITE; g.textBaseline = 'alphabetic';
    g.font = F('300', 104); g.textAlign = 'center';
    g.fillText('12:45:50', 320, 118);
    g.font = F('500', 24); g.textAlign = 'left';
    g.fillStyle = MUTED; g.fillText('25-01-25', 22, 156);
    g.textAlign = 'right'; g.fillText('BL-2000  DATA LOGGER', 618, 156);
    g.fillStyle = '#1a2734'; g.fillRect(22, 176, 596, 2);

    const icon = (kind, x, y, s, color) => {
      g.save(); g.translate(x, y); g.scale(s / 24, s / 24);
      g.strokeStyle = color; g.fillStyle = color;
      g.lineWidth = 2.2; g.lineJoin = 'round'; g.lineCap = 'round';
      const P = d => { g.beginPath(); d(); };
      if (kind === 'bolt') {
        P(() => { g.moveTo(14, 2); g.lineTo(5, 14); g.lineTo(11, 14); g.lineTo(10, 22); g.lineTo(19, 9); g.lineTo(13, 9); g.closePath(); }); g.fill();
      } else if (kind === 'thermo') {
        P(() => g.arc(12, 17.5, 4.2, 0, Math.PI * 2)); g.fill();
        P(() => { g.moveTo(12, 4); g.lineTo(12, 14); }); g.lineWidth = 4.6; g.stroke();
      } else if (kind === 'drop') {
        P(() => { g.moveTo(12, 3); g.quadraticCurveTo(20, 13, 18, 17); g.quadraticCurveTo(15.5, 22, 12, 22); g.quadraticCurveTo(8.5, 22, 6, 17); g.quadraticCurveTo(4, 13, 12, 3); }); g.fill();
      } else if (kind === 'bell') {
        P(() => { g.moveTo(5.5, 17); g.lineTo(18.5, 17); g.lineTo(16.5, 13); g.lineTo(16.5, 10); g.quadraticCurveTo(16.5, 5, 12, 5); g.quadraticCurveTo(7.5, 5, 7.5, 10); g.lineTo(7.5, 13); g.closePath(); }); g.fill();
        P(() => g.arc(12, 19.5, 2, 0, Math.PI)); g.fill();
      } else if (kind === 'clock') {
        P(() => g.arc(12, 12, 8.6, 0, Math.PI * 2)); g.stroke();
        P(() => { g.moveTo(12, 7); g.lineTo(12, 12.5); g.lineTo(16, 14.5); }); g.stroke();
      } else if (kind === 'link') {
        [4, 8, 12].forEach((r, i) => { P(() => g.arc(12, 19, r, Math.PI * 1.2, Math.PI * 1.8)); g.lineWidth = 2.2 - i * 0.2; g.stroke(); });
        P(() => g.arc(12, 19, 1.6, 0, Math.PI * 2)); g.fill();
      } else if (kind === 'chip') {
        P(() => { g.rect(6, 6, 12, 12); }); g.stroke();
        P(() => { g.rect(10, 10, 4, 4); }); g.fill();
        [-1, 1].forEach(sg => [9, 12, 15].forEach(v => {
          P(() => { g.moveTo(12 + sg * 6, v); g.lineTo(12 + sg * 9, v); }); g.stroke();
          P(() => { g.moveTo(v, 12 + sg * 6); g.lineTo(v, 12 + sg * 9); }); g.stroke();
        }));
      } else if (kind === 'disk') {
        P(() => { g.rect(4.5, 5, 15, 14); }); g.stroke();
        P(() => g.arc(12, 12, 3.4, 0, Math.PI * 2)); g.fill();
        P(() => { g.moveTo(8, 5); g.lineTo(8, 9); g.lineTo(16, 9); g.lineTo(16, 5); }); g.stroke();
      } else if (kind === 'home') {
        P(() => { g.moveTo(3.5, 12); g.lineTo(12, 4); g.lineTo(20.5, 12); }); g.stroke();
        P(() => { g.rect(6.5, 12, 11, 8); }); g.stroke();
      } else if (kind === 'chart') {
        [[6, 8], [11, 12], [16, 5]].forEach(([bx, bh]) => { P(() => g.rect(bx, 20 - bh, 3.4, bh)); g.fill(); });
        P(() => { g.moveTo(3.5, 20.5); g.lineTo(21, 20.5); }); g.stroke();
      }
      g.restore();
    };

    const cards = [['12.5', 'VOLT', CYAN, 'bolt'], ['35.3', '°C', AMBER, 'thermo'],
                   ['40.5', '% RH', GREEN, 'drop'], ['0', 'ALARM', MUTED, 'bell']];
    const cw2 = 140, gap = 12;
    cards.forEach(([val, unit, accent, ic], i) => {
      const x = 22 + i * (cw2 + gap), y = 198;
      g.fillStyle = '#101c28'; rr(x, y, cw2, 116, 8); g.fill();
      g.fillStyle = accent; rr(x, y, cw2, 4, 2); g.fill();
      icon(ic, x + cw2 / 2 - 10, y + 14, 20, accent);
      g.fillStyle = WHITE; g.font = F('600', 44); g.textAlign = 'center';
      g.fillText(val, x + cw2 / 2, y + 84);
      g.fillStyle = MUTED; g.font = F('500', 20);
      g.fillText(unit, x + cw2 / 2, y + 106);
    });
    const rows = [
      ['WAKTU SISTEM', 'MEMPERBARUI', CYAN, 'clock'], ['KOMUNIKASI', 'BERHASIL', GREEN, 'link'],
      ['PERANGKAT', 'TERDETEKSI', GREEN, 'chip'], ['PENYIMPANAN', 'BERHASIL', GREEN, 'disk'],
    ];
    rows.forEach(([label, state, tone, ic], i) => {
      const col = i % 2, row = (i - col) / 2;
      const x = 22 + col * 308, y = 356 + row * 92;
      icon(ic, x, y - 15, 17, MUTED);
      g.fillStyle = MUTED; g.font = F('600', 21); g.textAlign = 'left';
      g.fillText(label, x + 24, y);
      g.fillStyle = '#101c28'; rr(x, y + 14, 288, 36, 6); g.fill();
      g.fillStyle = tone; rr(x, y + 14, 4, 36, 2); g.fill();
      g.fillStyle = tone; g.font = F('600', 20);
      g.fillText(state, x + 18, y + 39);
    });
    g.fillStyle = MUTED; g.font = F('600', 21); g.textAlign = 'left';
    g.fillText('TREN 24 JAM', 22, 546);
    g.textAlign = 'right'; g.fillText('35.3 °C', 618, 546);
    g.fillStyle = '#101c28'; rr(22, 556, 596, 54, 6); g.fill();
    const pts = [0.42, 0.48, 0.44, 0.55, 0.62, 0.58, 0.66, 0.72, 0.68, 0.60, 0.64, 0.71, 0.78, 0.74, 0.69, 0.73];
    g.beginPath();
    pts.forEach((v, i) => {
      const px = 34 + i * (572 / (pts.length - 1)), py = 600 - v * 38;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    });
    g.strokeStyle = CYAN; g.lineWidth = 3; g.lineJoin = 'round'; g.stroke();
    g.lineTo(606, 604); g.lineTo(34, 604); g.closePath();
    g.fillStyle = 'rgba(70,191,219,0.16)'; g.fill();
    g.fillStyle = '#1a2734'; g.fillRect(22, 628, 596, 2);
    g.font = F('600', 21); g.fillStyle = WHITE; g.textAlign = 'left';
    icon('home', 22, 644, 18, WHITE);
    g.fillText('LAYAR UTAMA', 46, 660);
    g.fillStyle = MUTED; g.textAlign = 'right';
    g.fillText('PEMANTAUAN', 618, 660);
    icon('chart', 618 - g.measureText('PEMANTAUAN').width - 26, 644, 18, MUTED);
    g.fillStyle = GREEN;
    g.beginPath(); g.arc(320, 652, 7, 0, Math.PI * 2); g.fill();

    const scrTex = new THREE.CanvasTexture(scv);
    scrTex.colorSpace = THREE.SRGBColorSpace; scrTex.anisotropy = 16;
    scrMat = new THREE.MeshStandardMaterial({
      name: 'screen_ui', map: scrTex, emissiveMap: scrTex, emissive: 0xffffff,
      emissiveIntensity: 0.0, roughness: 0.22, metalness: 0, color: 0x0a0a0a,
    });
    const scrUI = new THREE.Mesh(new THREE.PlaneGeometry(0.0920, 0.0870), scrMat);
    scrUI.name = 'screen_ui';
    scrUI.rotation.x = -Math.PI / 2;
    scrUI.position.set(dcx, GTOP + 0.0013, dcz - 0.0020);
    gDisplay.add(scrUI);
  }

  // =====================================================================
  // 9 — SIGNAL TERMINAL BLOCKS (plug in from above, through the lid)
  // =====================================================================
  const gTermSig = mkPart('term_sig', 'Terminal sinyal X1–X3', [0, 0.094, 0]);
  const SIG_Z = [-0.046, -0.018, 0.010];
  SIG_Z.forEach((z, i) => {
    const tb = tbLite('tbu_' + (i + 1), 8, 0.028, z, TOP, 0.0052);
    const L = 8 * 0.0052;
    tb.add(box('tbu_' + (i + 1) + '_riser', L - 0.004, TOP - S1, 0.0106, M.dark, 0, -(TOP - S1) / 2, 0));
    gTermSig.add(tb);
  });

  // =====================================================================
  // 10 — FIELD TERMINAL BLOCKS (plug in horizontally, through the front)
  // =====================================================================
  const gTermField = mkPart('term_field', 'Terminal lapangan (depan)', [0, 0, 0.104]);
  [['tbl_1', 6, -0.09475], ['tbl_2', 10, -0.03305], ['tbl_3', 10, 0.04385]].forEach(([n, poles, x]) => {
    gTermField.add(tbLite(n, poles, x, D / 2 + 0.0053, 0.0162, 0.0064, 1.0));
  });

  // =====================================================================
  // 11 — TOP COVER
  // =====================================================================
  // screw pattern shared by the cover bosses and the bottom-entry screws
  const COVER_XZ = [[-0.1215, -0.0640], [0.1215, -0.0640], [-0.1215, 0.0640], [0.1215, 0.0640]];

  const gCover = mkPart('cover', 'Penutup atas', [0, 0.166, 0]);
  // r rounds the back corners, rF the front ones (front radius is smaller so
  // the ETH/USB cutout still fits inside the flat front wall)
  function outlineFS(w, d, r, rF) {
    const s = new THREE.Shape(), hw = w / 2, hd = d / 2;
    s.moveTo(-hw, -hd + rF);
    s.lineTo(-hw, hd - r); s.quadraticCurveTo(-hw, hd, -hw + r, hd);
    s.lineTo(hw - r, hd);  s.quadraticCurveTo(hw, hd, hw, hd - r);
    s.lineTo(hw, -hd + rF); s.quadraticCurveTo(hw, -hd, hw - rF, -hd);
    s.lineTo(-hw + rF, -hd); s.quadraticCurveTo(-hw, -hd, -hw, -hd + rF);
    s.closePath();
    return s;
  }
  const coverShells = [];
  {
    const B = 0.003, LT = 0.008;   // top-edge roundover 3 mm, side corners 6 mm
    const s = outlineFS(W - B * 2, D - B * 2, 0.006 - B, 0.006 - B);
    s.holes.push(rectPath(-0.0625, 0.0055, 0.1010, 0.0970));   // display window
    SIG_Z.forEach(z => s.holes.push(rectPath(0.028, -z, 0.0424, 0.0144)));
    s.holes.push(rectPath(0.0985, 0.0480, 0.0154, 0.0079));    // USB-A
    s.holes.push(rectPath(0.0985, 0.0280, 0.0254, 0.0036));    // SD
    s.holes.push(rectPath(0.0985, 0.0115, 0.0096, 0.0035));    // USB-C
    s.holes.push(rectPath(0.0995, -0.0095, 0.0214, 0.0080));   // PORT I/O
    const g = new THREE.ExtrudeGeometry(s, {
      depth: LT - B * 2, bevelEnabled: true, bevelThickness: B, bevelSize: B,
      bevelSegments: 6, curveSegments: 24,
    });
    g.rotateX(-Math.PI / 2); g.translate(0, TOP - LT + B, 0);
    const m = new THREE.Mesh(g, M.caseTop);
    m.name = 'cover_top_face'; m.castShadow = true; m.receiveShadow = true;
    gCover.add(m); coverShells.push(m);
  }
  {
    const hw = W / 2, hd = D / 2, r = 0.006, rf = 0.006, t = WALLT;
    const iw = hw - t, id = hd - t, ri = r - t, rif = rf - t;
    // C-ring: left/back/right walls plus rounded front corners; the flat front
    // wall (with the ETH/USB cutout) spans between the two corner arcs
    const s = new THREE.Shape();
    s.moveTo(-hw + rf, -hd);
    s.quadraticCurveTo(-hw, -hd, -hw, -hd + rf);
    s.lineTo(-hw, hd - r); s.quadraticCurveTo(-hw, hd, -hw + r, hd);
    s.lineTo(hw - r, hd);  s.quadraticCurveTo(hw, hd, hw, hd - r);
    s.lineTo(hw, -hd + rf); s.quadraticCurveTo(hw, -hd, hw - rf, -hd);
    s.lineTo(hw - rf, -id);
    s.quadraticCurveTo(iw, -id, iw, -id + rif);
    s.lineTo(iw, id - ri); s.quadraticCurveTo(iw, id, iw - ri, id);
    s.lineTo(-iw + ri, id); s.quadraticCurveTo(-iw, id, -iw, id - ri);
    s.lineTo(-iw, -id + rif); s.quadraticCurveTo(-iw, -id, -iw + rif, -id);
    s.closePath();
    // walls rise exactly to where the lid's flush section starts — unibody,
    // no coplanar overlap, the lid's lower bevel is hidden inside the shell
    const g = new THREE.ExtrudeGeometry(s, { depth: WALLH - 0.0005, bevelEnabled: false, curveSegments: 24 });
    g.rotateX(-Math.PI / 2); g.translate(0, PLT, 0);
    const m = new THREE.Mesh(g, M.caseTop);
    m.name = 'cover_skirt'; m.castShadow = true; m.receiveShadow = true;
    gCover.add(m); coverShells.push(m);
  }
  {
    const hw = W / 2 - 0.006;   // stops where the skirt's rounded front corners begin
    const WH = WALLH - 0.0005;
    const s = new THREE.Shape();
    s.moveTo(-hw, 0); s.lineTo(hw, 0); s.lineTo(hw, WH); s.lineTo(-hw, WH); s.closePath();
    // two separate cutouts, one per jack — the enclosure keeps a 4.5 mm web
    // between the ETH and USB-B openings
    s.holes.push(rectPath(0.0930, 0.0210, 0.0195, 0.0151));   // ETH
    s.holes.push(rectPath(0.1155, 0.0210, 0.0165, 0.0151));   // USB-B
    // field terminal blocks pass through the front wall — the window hugs each
    // block (0.4 mm side clearance, 0.3 mm over the cap) so it reads as a fit
    [[-0.09475, 0.0392], [-0.03305, 0.0648], [0.04385, 0.0648]]
      .forEach(([cx, cw]) => s.holes.push(rectPath(cx, 0.0207, cw, 0.0164)));
    const g = new THREE.ExtrudeGeometry(s, { depth: WALLT, bevelEnabled: false, curveSegments: 6 });
    g.translate(0, PLT, D / 2 - WALLT);
    const m = new THREE.Mesh(g, M.caseTop);
    m.name = 'cover_wall_front'; m.castShadow = true; m.receiveShadow = true;
    gCover.add(m); coverShells.push(m);
  }
  {
    const bar = cyl('cover_antenna_gland', 0.0070, 0.0070, M.caseTop, -(W / 2 + 0.0015), 0.0260, -0.0300, 12);
    bar.rotation.z = Math.PI / 2; gCover.add(bar); coverShells.push(bar);
  }

  // screw bosses hang down from the cover's top face to meet the base plate
  const BOSS_H = (TOP - LIDT) - PLT;
  COVER_XZ.forEach(([px, pz], i) => {
    const b = cyl('cover_boss_' + (i + 1), 0.0050, BOSS_H, M.case, px, PLT + BOSS_H / 2, pz, 14);
    gCover.add(b); coverShells.push(b);
  });

  // ---- printing on the cover ------------------------------------------
  const K = '#26292e', R = '#c8202a';
  // each legend clears its own opening by ~0.0022 so it reads with that port,
  // not with the neighbour above it (ports sit at z -0.0480 / -0.0280 / -0.0115 / +0.0095)
  gCover.add(lidDecal('print_usb_logo', 0.0110, 0.0075, 0.0985, -0.0580, usbGlyph, 128, 88));
  gCover.add(lidDecal('print_sd_card', 0.0230, 0.0052, 0.0985, -0.0346, textDraw('SD CARD')));
  gCover.add(lidDecal('print_type_c', 0.0210, 0.0048, 0.0985, -0.0179, textDraw('TYPE-C')));
  gCover.add(lidDecal('print_port_io', 0.0230, 0.0052, 0.0995, 0.0007, textDraw('PORT I/O')));
  [['tb_label_1', -0.046, ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'], []],
   ['tb_label_2', -0.018, ['Tx3', 'Rx3', 'Tx4', 'Rx4', 'D6', 'D7', 'D8', 'D9'], []],
   ['tb_label_3', 0.010, ['24V', '24V', 'T2V', 'T2V', 'SV', '3.3V', 'RST', 'GND'], [R, R, R, R, R, R, K, K]]]
    .forEach(([name, bz, labels, colors]) => {
      gCover.add(lidDecal(name, 0.0416, 0.0062, 0.028, bz - 0.0110, cellRow(labels, colors), 560, 84, 0.0008));
    });
  gCover.add(logoDecal('logo_stesy', '/images/logger/logo-stesy.png', 0.0470, 401, 128, 0.0280, TOP + 0.0005, 0.0385));
  gCover.add(logoDecal('logo_beacon', '/images/logger/logo-beacon.png', 0.0330, 2360, 626, 0.0920, TOP + 0.0005, 0.0360));
  gCover.add(lidDecal('print_made_in', 0.0300, 0.0040, 0.0920, 0.0430,
    textDraw('made in indonesia', '#26292e'), 420, 56, 0.0006));
  gCover.add(lidDecal('print_qr_code', 0.0120, 0.0120, 0.1160, 0.0390, qrGlyph, 252, 252, 0.0006));

  // one label strip per terminal block, each aligned to the poles it names
  [['label_rail_1', -0.09475, 0.0455, ['R1', 'D4', 'D3', 'D2', 'D1', 'RST'], []],
   ['label_rail_2', -0.03305, 0.0759, ['24V', '12V', 'SV', 'TX', 'RX', 'TZ', 'RZ', 'A', 'B', 'GND'], [R, R, R]],
   ['label_rail_3', 0.04385, 0.0759, ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'IN', 'GND'],
    [K, K, K, K, K, K, K, K, R]]]
    .forEach(([name, lx, lw, labels, colors]) => {
      const cellPx = Math.round(96 * (lw / labels.length) / 0.0072);
      gCover.add(lidDecal(name, lw, 0.0072, lx, 0.0605, cellRow(labels, colors), labels.length * cellPx, 96, 0.0008));
    });
  [['eth', 'ETH', 0.0930], ['usb', 'USB', 0.1135]].forEach(([key, text, lx]) => {
    gCover.add(box('label_' + key + '_base', 0.0222, 0.0007, 0.0072, M.label, lx, TOP + 0.0004, 0.0605));
    gCover.add(box('label_' + key + '_face', 0.0200, 0.0009, 0.0060, M.caseTop, lx, TOP + 0.0006, 0.0605));
    gCover.add(lidDecal('print_' + key, 0.0140, 0.0040, lx, 0.0605, textDraw(text), 280, 80, 0.0014));
  });
  gCover.add(lidDecal('print_model_name', 0.0380, 0.0076, -0.0970, -0.0608,
    textDraw('BL - 2000', '#c8202a', 'left'), 380, 76));
  gCover.add(lidDecal('print_data_logger', 0.0500, 0.0069, -0.0340, -0.0605,
    textDraw('DATA LOGGER', null, 'right'), 500, 69));

  // =====================================================================
  // 12 — COVER SCREWS + SMA ANTENNA CONNECTOR
  // =====================================================================
  // driven UP from underneath, through the base plate, into the cover bosses —
  // the finished unit shows no fastener on its top face at all
  const gScrewCover = mkPart('screw_cover', 'Sekrup penutup ×4 (dari bawah)', [0, -0.062, 0], -Math.PI * 8);
  COVER_XZ.forEach(([px, pz], i) => {
    const n = 'screw_cover_' + (i + 1);
    const g = new THREE.Group(); g.name = n;
    g.position.set(px, 0, pz);
    g.add(cyl(n + '_head', 0.0038, 0.0017, M.steel, 0, -0.00085, 0, 20));
    g.add(cyl(n + '_shank', 0.0017, 0.0165, M.steel, 0, 0.00825, 0, 14));
    for (let j = 0; j < 8; j++)
      g.add(cyl(n + '_thread_' + (j + 1), 0.0020, 0.0005, M.steel, 0, 0.0012 + j * 0.0018, 0, 14));
    g.add(box(n + '_slot_a', 0.0058, 0.0004, 0.0013, M.dark, 0, -0.0017, 0));
    g.add(box(n + '_slot_b', 0.0013, 0.0004, 0.0058, M.dark, 0, -0.0017, 0));
    gScrewCover.add(g);
  });

  const gAntenna = mkPart('antenna', 'Konektor antena SMA', [-0.072, 0, 0], Math.PI * 6, 'x');
  {
    const a = new THREE.Group(); a.name = 'sma_antenna_port';
    a.position.set(-W / 2 - 0.007, 0.026, -0.030);
    const barrel = cyl('sma_barrel', 0.0055, 0.014, M.brass, 0, 0, 0);
    barrel.rotation.z = Math.PI / 2; a.add(barrel);
    const nut = cyl('sma_nut', 0.0070, 0.005, M.brass, 0.0045, 0, 0, 6);
    nut.rotation.z = Math.PI / 2; a.add(nut);
    const pin = cyl('sma_pin', 0.0012, 0.006, M.steel, -0.008, 0, 0, 12);
    pin.rotation.z = Math.PI / 2; a.add(pin);
    gAntenna.add(a);
  }

  root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  // =====================================================================
  // step script — camera choreography lives with the parts it frames
  // =====================================================================
  const steps = [
    { parts: ['base'],         stagger: false, cam: { t: [0, 0.010, 0],        th: 0.62, ph: 1.02, d: 0.44 } },
    { parts: ['standoff_lo'],  stagger: true,  cam: { t: [0, 0.008, -0.008],    th: 0.98, ph: 0.76, d: 0.38 } },
    { parts: ['board_lo'],     stagger: false, cam: { t: [0, 0.014, 0],        th: 0.48, ph: 0.92, d: 0.42 } },
    { parts: ['screw_lo'],     stagger: true,  cam: { t: [0, 0.013, -0.008], th: 0.70, ph: 0.60, d: 0.37 } },
    { parts: ['standoff_mid'], stagger: true,  cam: { t: [0, 0.020, -0.006],    th: -0.55, ph: 0.86, d: 0.36 } },
    { parts: ['board_up'],     stagger: false, cam: { t: [0, 0.026, 0],        th: 0.44, ph: 0.92, d: 0.44 } },
    { parts: ['screw_up'],     stagger: true,  cam: { t: [0, 0.033, -0.008], th: -0.88, ph: 0.62, d: 0.37 } },
    { parts: ['display'],      stagger: false, cam: { t: [-0.062, 0.036, 0],   th: 0.32, ph: 0.74, d: 0.28 } },
    { parts: ['term_sig'],     stagger: true,  cam: { t: [0.030, 0.048, -0.02], th: 0.80, ph: 0.72, d: 0.21 } },
    { parts: ['term_field'],   stagger: true,  cam: { t: [-0.010, 0.020, 0.05], th: 0.16, ph: 1.18, d: 0.34 } },
    { parts: ['cover'],        stagger: false, cam: { t: [0, 0.030, 0],        th: 0.55, ph: 0.84, d: 0.50 } },
    { parts: ['screw_cover', 'antenna'], stagger: true, cam: { t: [-0.010, 0.014, 0], th: 1.05, ph: 2.16, d: 0.42 } },
  ];
  const camFinal = { t: [0, 0.024, 0], th: 0.50, ph: 0.86, d: 0.40 };
  // wide keyframe for the fully-exploded state (t=0 and the end of "membongkar")
  const camExploded = { t: [0, 0.062, 0], th: 0.62, ph: 0.94, d: 0.62 };

  // ---- runtime hooks ---------------------------------------------------
  function setPower(v) {
    scrMat.emissiveIntensity = 0.62 * v;
    const c = 0.04 + 0.96 * v;
    scrMat.color.setScalar(c);
    leds.forEach(m => { m.emissiveIntensity = 0.85 * v; });
  }
  setPower(0);

  // cover shells get private material clones so x-ray doesn't fade the base too
  coverShells.forEach(m => { m.material = m.material.clone(); });
  function setXray(v) {
    coverShells.forEach(m => {
      m.material.transparent = v > 0.001;
      m.material.opacity = 1 - 0.80 * v;
      m.material.depthWrite = v < 0.5;
      m.material.needsUpdate = true;
    });
  }

  return { root, parts, byId, steps, camFinal, camExploded, setPower, setXray, materials: M, dims: { W, D, TOP } };
}
