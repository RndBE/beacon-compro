// Three.js scene for the PDAM Tirtamarta digital twin (Kota Yogyakarta).
// Same approach as the Tulang Bawang twin (imperative scene, the Svelte page owns
// the timeline and pushes the hour in), at city scale: 1 scene unit = 1 km.
// The main-pipe network is drawn as glowing ribbons whose flow speed follows the
// demand pattern and whose colour can show category, pressure or zone.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {
	makeProjector,
	makeUnprojector,
	mercX,
	mercY,
	tileLat,
	tileLon,
	tileRange,
	tileX,
	tileY,
	type XZ
} from '../../demo-dashboard/twin/geo';
import {
	ASSETS,
	ASSET_BY_ID,
	BALANCE,
	LEAKS,
	TYPE_META,
	ZONES,
	nrwColor,
	type Asset,
	type SiteStatus
} from '../data';
import { BURST, burstFlow, burstOn, demand, fmtNum, readAsset, zonePressure } from '../sim';

export interface TwinLayers {
	imagery: boolean;
	zones: boolean;
	pipes: boolean;
	flow: boolean;
	leaks: boolean;
	labels: boolean;
}

export type PipeMode = 'kategori' | 'tekanan' | 'zona';

interface GeoFeature {
	geometry: { type: string; coordinates: unknown };
	properties: Record<string, unknown>;
}
interface GeoCollection {
	features: GeoFeature[];
}

export interface TwinOptions {
	container: HTMLElement;
	pipes: GeoCollection;
	zones: GeoCollection;
	/** XYZ imagery url builder; tiles must allow CORS */
	tileUrl: (z: number, x: number, y: number) => string;
	tileZoom?: number;
	compass?: HTMLElement | null;
	onSelect?: (id: string) => void;
	onImagery?: (loaded: number, total: number) => void;
}

export interface TwinApi {
	/** clock hour 0–24 of the replayed day */
	setHour(h: number): void;
	setLayers(l: Partial<TwinLayers>): void;
	setPipeMode(m: PipeMode): void;
	/** zone tint: identity colours or the NRW choropleth */
	setZoneMode(m: 'zona' | 'nrw'): void;
	setImageryStyle(style: 'natural' | 'night'): void;
	select(id: string, fly?: boolean): void;
	resetView(): void;
	setAutoRotate(on: boolean): void;
	dispose(): void;
}

const STATUS_HEX: Record<SiteStatus, string> = { ok: '#46D78F', warn: '#FFB454', alarm: '#FF7A66' };
const LON0 = 110.382;
const LAT0 = -7.772;
const HOME_TGT = new THREE.Vector3(0.1, 0, 1.6);
const HOME_POS = new THREE.Vector3(-1.6, 11.5, 14.8);
/** camera distance at which nodes and pipe widths are drawn 1:1 */
const REF_DIST = 16;

const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

type Ring = [number, number][];
function polygonsOf(f: GeoFeature): Ring[][] {
	const g = f.geometry;
	return (g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates]) as Ring[][];
}

export function createPdamTwin(opts: TwinOptions): TwinApi {
	const { container } = opts;
	const project = makeProjector(LON0, LAT0);
	const unproject = makeUnprojector(LON0, LAT0);
	const disposables: { dispose(): void }[] = [];
	const track = <T extends { dispose(): void }>(o: T) => (disposables.push(o), o);

	/* ---------------- renderer, camera, controls ---------------- */
	const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.domElement.className = 'twin-canvas';
	container.appendChild(renderer.domElement);

	const labelRenderer = new CSS2DRenderer();
	labelRenderer.domElement.className = 'twin-labels';
	container.appendChild(labelRenderer.domElement);

	const scene = new THREE.Scene();
	const bg = new THREE.Color('#040b1d');
	scene.background = bg;

	const camera = new THREE.PerspectiveCamera(38, 1, 0.04, 400);
	camera.position.copy(HOME_POS);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.copy(HOME_TGT);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.minDistance = 0.45;
	controls.maxDistance = 58;
	controls.minPolarAngle = 0.1;
	controls.maxPolarAngle = 1.32;
	controls.zoomToCursor = true;
	controls.autoRotateSpeed = 0.3;
	let userMoved = false;
	controls.addEventListener('start', () => {
		controls.autoRotate = false;
		userMoved = true;
		fly = null;
	});
	function fitDistance() {
		const base = HOME_POS.distanceTo(HOME_TGT);
		const half = THREE.MathUtils.degToRad(camera.fov / 2);
		const hfovHalf = Math.atan(Math.tan(half) * camera.aspect);
		return THREE.MathUtils.clamp(6.2 / Math.tan(hfovHalf), base, 34);
	}
	function homePos() {
		return HOME_TGT.clone().add(HOME_POS.clone().sub(HOME_TGT).normalize().multiplyScalar(fitDistance()));
	}

	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));
	// One NaN/Inf pixel in the HDR buffer (e.g. pow() of a slightly negative value at a ribbon edge)
	// spreads through the bloom blur into a black block; clamp drops it first (max(NaN, 0) = 0 on the GPU).
	composer.addPass(
		new ShaderPass({
			uniforms: { tDiffuse: { value: null } },
			vertexShader: /* glsl */ `
				varying vec2 vUv;
				void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
			fragmentShader: /* glsl */ `
				uniform sampler2D tDiffuse;
				varying vec2 vUv;
				void main() { gl_FragColor = clamp(texture2D(tDiffuse, vUv), 0.0, 64.0); }`
		})
	);
	const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.42, 0.6);
	composer.addPass(bloom);
	composer.addPass(new OutputPass());

	/* ---------------- extent: every main pipe and service zone, plus a margin ---------------- */
	let west = Infinity,
		east = -Infinity,
		south = Infinity,
		north = -Infinity;
	const grow = ([x, y]: [number, number]) => {
		west = Math.min(west, x);
		east = Math.max(east, x);
		south = Math.min(south, y);
		north = Math.max(north, y);
	};
	for (const f of opts.pipes.features) (f.geometry.coordinates as [number, number][]).forEach(grow);
	for (const f of opts.zones.features) for (const poly of polygonsOf(f)) poly[0].forEach(grow);
	const margin = 0.012;
	const zoom = opts.tileZoom ?? 14;
	const tr = tileRange(west - margin, south - margin, east + margin, north + margin, zoom);
	const nw = project(tr.west, tr.north);
	const se = project(tr.east, tr.south);
	const groundW = se.x - nw.x;
	const groundD = se.z - nw.z;
	const groundCx = (nw.x + se.x) / 2;
	const groundCz = (nw.z + se.z) / 2;

	/* ---------------- imagery canvas, filled progressively ---------------- */
	const tilesX = tr.x1 - tr.x0 + 1;
	const tilesY = tr.y1 - tr.y0 + 1;
	const imgCanvas = document.createElement('canvas');
	imgCanvas.width = tilesX * 256;
	imgCanvas.height = tilesY * 256;
	const imgCtx = imgCanvas.getContext('2d')!;
	imgCtx.fillStyle = '#1b2433';
	imgCtx.fillRect(0, 0, imgCanvas.width, imgCanvas.height);
	const imgTex = track(new THREE.CanvasTexture(imgCanvas));
	imgTex.colorSpace = THREE.SRGBColorSpace;
	imgTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
	let imgDirty = false;
	let imgLoaded = 0;
	const imgTotal = tilesX * tilesY;
	const pendingImages: HTMLImageElement[] = [];
	// load from the city centre outwards so the interesting part shows up first
	const order: [number, number][] = [];
	for (let ty = tr.y0; ty <= tr.y1; ty++) for (let tx = tr.x0; tx <= tr.x1; tx++) order.push([tx, ty]);
	const cTx = tileX(LON0, zoom);
	const cTy = tileY(LAT0, zoom);
	order.sort((a, b) => Math.hypot(a[0] - cTx, a[1] - cTy) - Math.hypot(b[0] - cTx, b[1] - cTy));
	for (const [tx, ty] of order) {
		const im = new Image();
		im.crossOrigin = 'anonymous';
		im.decoding = 'async';
		im.onload = () => {
			imgCtx.drawImage(im, (tx - tr.x0) * 256, (ty - tr.y0) * 256);
			imgLoaded++;
			imgDirty = true;
			groundMat.uniforms.uHasMap.value = 1;
			opts.onImagery?.(imgLoaded, imgTotal);
		};
		im.src = opts.tileUrl(zoom, tx, ty);
		pendingImages.push(im);
	}

	/* ---------------- zone + service-area textures ---------------- */
	const FW = 720;
	const FH = Math.round((FW * groundD) / groundW);
	const toPx = (lon: number, lat: number): [number, number] => [
		((mercX(lon) - mercX(tr.west)) / (mercX(tr.east) - mercX(tr.west))) * FW,
		((mercY(tr.north) - mercY(lat)) / (mercY(tr.north) - mercY(tr.south))) * FH
	];
	const zoneIndex = new Map(ZONES.map((z, i) => [z.name, i]));
	function paintZones(colorOf: (i: number) => string) {
		const c = document.createElement('canvas');
		c.width = FW;
		c.height = FH;
		const ctx = c.getContext('2d')!;
		for (const f of opts.zones.features) {
			const i = zoneIndex.get(String(f.properties.zona));
			if (i == null) continue;
			ctx.fillStyle = colorOf(i);
			for (const poly of polygonsOf(f)) {
				ctx.beginPath();
				for (const ring of poly)
					ring.forEach(([x, y], k) => {
						const [px, py] = toPx(x, y);
						if (k) ctx.lineTo(px, py);
						else ctx.moveTo(px, py);
					});
				ctx.fill('evenodd');
			}
		}
		const tex = track(new THREE.CanvasTexture(c));
		tex.colorSpace = THREE.SRGBColorSpace;
		return tex;
	}
	const zoneTex = paintZones((i) => ZONES[i].color);
	const nrwTex = paintZones((i) => nrwColor(BALANCE[ZONES[i].id].nrw));

	const groundUniforms = {
		uMap: { value: imgTex as THREE.Texture },
		uHasMap: { value: 0 },
		uImagery: { value: 1 },
		uNatural: { value: 1 },
		uIsPatch: { value: 0 },
		uFade: { value: 1 },
		uGround: { value: new THREE.Vector4(nw.x, nw.z, groundW, groundD) },
		uZoneTex: { value: zoneTex },
		uNrwTex: { value: nrwTex },
		uZonesOn: { value: 1 },
		uNrwMode: { value: 0 },
		uDeep: { value: new THREE.Color('#030a1c') },
		uMid: { value: new THREE.Color('#0f2c5c') },
		uHi: { value: new THREE.Color('#5e9fe0') },
		uGrid: { value: new THREE.Color('#2f73d8') },
		uBg: { value: bg }
	};
	const groundVert = /* glsl */ `
		varying vec2 vUv;
		varying vec3 vWorld;
		void main() {
			vUv = uv;
			vec4 w = modelMatrix * vec4(position, 1.0);
			vWorld = w.xyz;
			gl_Position = projectionMatrix * viewMatrix * w;
		}`;
	const groundFrag = /* glsl */ `
		uniform sampler2D uMap, uZoneTex, uNrwTex;
		uniform float uHasMap, uImagery, uNatural, uIsPatch, uFade, uZonesOn, uNrwMode;
		uniform vec4 uGround;
		uniform vec3 uDeep, uMid, uHi, uGrid, uBg;
		varying vec2 vUv;
		varying vec3 vWorld;
		const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
		float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
		float noise(vec2 p) {
			vec2 i = floor(p), f = fract(p);
			vec2 u = f * f * (3.0 - 2.0 * f);
			return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
		}
		void main() {
			vec2 fuv = vec2((vWorld.x - uGround.x) / uGround.z, 1.0 - (vWorld.z - uGround.y) / uGround.w);
			vec4 zc = texture2D(uZoneTex, fuv);
			vec4 nc = texture2D(uNrwTex, fuv);
			float inside = zc.a;
			vec4 texel = texture2D(uMap, vUv);
			vec3 img = texel.rgb;
			// patch tiles not loaded yet are transparent black; bilinear/mipmap filtering blends them into
			// the loaded tile edges as dark half-transparent blocks, so divide by alpha to get the colour back
			if (uIsPatch > 0.5) img = min(texel.rgb / max(texel.a, 0.02), vec3(1.0));
			float has = uHasMap * uImagery;
			float fallback = 0.35 + 0.2 * noise(vWorld.xz * 0.9) + 0.1 * noise(vWorld.xz * 5.0);

			float lum = clamp((pow(dot(img, LUMA), 0.45) - 0.1) / 0.34, 0.0, 1.0);
			lum = mix(fallback, lum, has);
			vec3 tint = mix(uDeep, uMid, smoothstep(0.0, 0.55, lum));
			tint = mix(tint, uHi, smoothstep(0.55, 1.0, lum));
			float lift = 0.55 + 0.45 * inside;
			vec3 night = tint * (0.55 + 0.6 * inside);

			vec3 nat = mix(vec3(dot(img, LUMA)), img, 0.9) * vec3(0.92, 1.0, 1.08) * 1.2;
			nat = mix(uDeep + uMid * fallback * 0.6, nat, has);
			vec3 natural = nat * lift;

			vec3 col = mix(night, natural, uNatural);
			vec3 zcol = mix(zc.rgb, nc.rgb, uNrwMode);
			col = mix(col, col * 0.6 + zcol * 0.42, inside * uZonesOn * (0.3 + 0.22 * uNrwMode) * (1.0 + 0.45 * (1.0 - uNatural)));

			vec2 gp = vWorld.xz;
			vec2 gd = abs(fract(gp - 0.5) - 0.5) / fwidth(gp);
			float line = 1.0 - min(min(gd.x, gd.y), 1.0);
			col += uGrid * line * (0.02 + 0.05 * inside) * (1.0 - 0.6 * uNatural);

			float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
			float alpha = 1.0;
			if (uIsPatch > 0.5) alpha = texel.a * smoothstep(0.0, 0.14, e) * uFade * uImagery;
			else col = mix(uBg, col, smoothstep(0.0, 0.05, e));
			gl_FragColor = vec4(col, alpha);
		}`;
	const groundMat = track(
		new THREE.ShaderMaterial({ uniforms: groundUniforms, vertexShader: groundVert, fragmentShader: groundFrag })
	);
	const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(groundW, groundD, 1, 1)), groundMat);
	ground.rotation.x = -Math.PI / 2;
	ground.position.set(groundCx, 0, groundCz);
	scene.add(ground);

	/* ---------------- sharper imagery around the orbit target (z16 detail patch) ---------------- */
	const PATCH_Z = Math.min(17, zoom + 2);
	const PATCH_N = 5;
	const patchCanvas = document.createElement('canvas');
	patchCanvas.width = patchCanvas.height = PATCH_N * 256;
	const pctx = patchCanvas.getContext('2d')!;
	const patchTex = track(new THREE.CanvasTexture(patchCanvas));
	patchTex.colorSpace = THREE.SRGBColorSpace;
	patchTex.anisotropy = imgTex.anisotropy;
	const patchMat = track(
		new THREE.ShaderMaterial({
			uniforms: { ...groundUniforms, uMap: { value: patchTex }, uIsPatch: { value: 1 }, uFade: { value: 0 } },
			vertexShader: groundVert,
			fragmentShader: groundFrag,
			transparent: true,
			depthWrite: false
		})
	);
	const patch = new THREE.Mesh(track(new THREE.PlaneGeometry(1, 1)), patchMat);
	patch.rotation.x = -Math.PI / 2;
	patch.renderOrder = -1;
	patch.visible = false;
	scene.add(patch);
	let patchAt: { x: number; y: number } | null = null;
	let patchImgs: HTMLImageElement[] = [];
	let patchDirty = false;

	function loadPatch(cx: number, cy: number) {
		const x0 = cx - (PATCH_N >> 1);
		const y0 = cy - (PATCH_N >> 1);
		for (const im of patchImgs) im.onload = null;
		patchImgs = [];
		if (patchAt) {
			const copy = document.createElement('canvas');
			copy.width = copy.height = patchCanvas.width;
			copy.getContext('2d')!.drawImage(patchCanvas, 0, 0);
			pctx.clearRect(0, 0, patchCanvas.width, patchCanvas.height);
			const px0 = patchAt.x - (PATCH_N >> 1);
			const py0 = patchAt.y - (PATCH_N >> 1);
			pctx.drawImage(copy, (px0 - x0) * 256, (py0 - y0) * 256);
		}
		patchAt = { x: cx, y: cy };
		const a = project(tileLon(x0, PATCH_Z), tileLat(y0, PATCH_Z));
		const b = project(tileLon(x0 + PATCH_N, PATCH_Z), tileLat(y0 + PATCH_N, PATCH_Z));
		patch.position.set((a.x + b.x) / 2, 0.0015, (a.z + b.z) / 2);
		patch.scale.set(b.x - a.x, b.z - a.z, 1);
		patch.visible = true;
		// the patch moves now, so its texture must follow now; waiting for the periodic upload shows the
		// old imagery at the new place for up to 250 ms
		patchTex.needsUpdate = true;
		patchDirty = false;
		for (let ty = y0; ty < y0 + PATCH_N; ty++)
			for (let tx = x0; tx < x0 + PATCH_N; tx++) {
				const im = new Image();
				im.crossOrigin = 'anonymous';
				im.decoding = 'async';
				im.onload = () => {
					pctx.clearRect((tx - x0) * 256, (ty - y0) * 256, 256, 256);
					pctx.drawImage(im, (tx - x0) * 256, (ty - y0) * 256);
					patchDirty = true;
				};
				im.src = opts.tileUrl(PATCH_Z, tx, ty);
				patchImgs.push(im);
			}
	}

	function updatePatch() {
		const d = camera.position.distanceTo(controls.target);
		const fade = 1 - THREE.MathUtils.smoothstep(d, 3.2, 6.5);
		patchMat.uniforms.uFade.value = fade;
		// a faded-out patch would still run the full ground shader over a large part of the screen
		patch.visible = patchAt !== null && fade > 0.01;
		if (fade <= 0.01) return;
		const { lon, lat } = unproject(controls.target.x, controls.target.z);
		const cx = Math.floor(tileX(lon, PATCH_Z));
		const cy = Math.floor(tileY(lat, PATCH_Z));
		if (patchAt && Math.abs(cx - patchAt.x) <= 1 && Math.abs(cy - patchAt.y) <= 1) return;
		loadPatch(cx, cy);
	}

	/* ---------------- service-area curtain + zone outlines ---------------- */
	const CURTAIN_H = 0.14;
	const curtainPos: number[] = [];
	const curtainV: number[] = [];
	const zoneGroup = new THREE.Group();
	scene.add(zoneGroup);
	const edgeMat = track(new THREE.LineBasicMaterial({ color: '#7fe3ff', transparent: true, opacity: 0.9 }));
	for (const f of opts.zones.features) {
		const isService = f.properties.zona === '_layanan';
		const zi = zoneIndex.get(String(f.properties.zona));
		const lineMat = isService
			? edgeMat
			: track(new THREE.LineBasicMaterial({ color: ZONES[zi ?? 0].color, transparent: true, opacity: 0.55 }));
		for (const poly of polygonsOf(f))
			poly.forEach((ring, ri) => {
				const pts = ring.map(([x, y]) => project(x, y));
				if (isService && ri === 0)
					for (let i = 0; i < pts.length - 1; i++) {
						const a = pts[i];
						const b = pts[i + 1];
						curtainPos.push(a.x, 0, a.z, b.x, 0, b.z, b.x, CURTAIN_H, b.z, a.x, 0, a.z, b.x, CURTAIN_H, b.z, a.x, CURTAIN_H, a.z);
						curtainV.push(0, 0, 1, 0, 1, 1);
					}
				const g = track(new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, isService ? 0.004 : 0.003, p.z))));
				const line = new THREE.Line(g, lineMat);
				(isService ? scene : zoneGroup).add(line);
			});
	}
	const curtainGeo = track(new THREE.BufferGeometry());
	curtainGeo.setAttribute('position', new THREE.Float32BufferAttribute(curtainPos, 3));
	curtainGeo.setAttribute('aV', new THREE.Float32BufferAttribute(curtainV, 1));
	const curtainMat = track(
		new THREE.ShaderMaterial({
			uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#3cc3f2') } },
			vertexShader: /* glsl */ `
				attribute float aV;
				varying float vV;
				varying float vH;
				void main() {
					vV = aV;
					vH = position.x * 3.0 + position.z * 2.0;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}`,
			fragmentShader: /* glsl */ `
				uniform float uTime;
				uniform vec3 uColor;
				varying float vV;
				varying float vH;
				void main() {
					float fade = pow(max(1.0 - vV, 0.0), 2.2);
					float scan = 0.5 + 0.5 * sin(vV * 18.0 - uTime * 2.4 + vH * 0.2);
					gl_FragColor = vec4(uColor, fade * (0.28 + 0.16 * scan));
				}`,
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending
		})
	);
	scene.add(new THREE.Mesh(curtainGeo, curtainMat));

	// zone name tags
	const zoneTags: CSS2DObject[] = [];
	for (const z of ZONES) {
		const el = document.createElement('div');
		el.className = 'pdam-ztag';
		el.style.setProperty('--c', z.color);
		el.innerHTML = `<b>${z.name}</b><span>NRW ${fmtNum(BALANCE[z.id].nrw * 100, 1)}%</span>`;
		const o = new CSS2DObject(el);
		const p = project(z.label[0], z.label[1]);
		o.position.set(p.x, 0.02, p.z);
		zoneGroup.add(o);
		zoneTags.push(o);
	}

	/* ---------------- main pipes as flowing ribbons ---------------- */
	// hydraulic "distance from source" per zone, for the pressure colouring
	const SOURCE_OF: Record<string, string> = {
		BDG: 'RES-BDG',
		GMW: 'RES-GMW',
		PDS: 'RES-PDS',
		KRG: 'KRG-IN',
		BNR: 'BNR-IN',
		PGK: 'PGK-IN',
		KTG: 'KTG-IN'
	};
	const srcXZ = ZONES.map((z) => {
		const a = ASSET_BY_ID[SOURCE_OF[z.id]];
		return project(a.lng, a.lat);
	});
	const leakMain = LEAKS[0];
	const leakPipes = new Map(LEAKS.map((l, i) => [l.pipeId, i === 0 ? 1 : 2]));
	type Line = { pts: XZ[]; kind: number; width: number; zone: number; leak: number };
	const lines: Line[] = [];
	const zoneMax = new Array(ZONES.length).fill(0.001);
	for (const f of opts.pipes.features) {
		const p = f.properties as { id: string; kategori: string; diameter: number | null; zona: string | null };
		const pts = (f.geometry.coordinates as [number, number][]).map(([x, y]) => project(x, y));
		if (pts.length < 2) continue;
		const zone = zoneIndex.get(String(p.zona)) ?? -1;
		const kind = p.kategori === 'transmisi' ? 1 : 0;
		// on-screen width in pixels (kept constant while zooming)
		const width = kind ? 4.2 : (p.diameter ?? 0) >= 10 ? 3.1 : 2.3;
		lines.push({ pts, kind, width, zone, leak: leakPipes.get(p.id) ?? 0 });
		if (zone >= 0) for (const q of pts) zoneMax[zone] = Math.max(zoneMax[zone], Math.hypot(q.x - srcXZ[zone].x, q.z - srcXZ[zone].z));
	}
	const pPos: number[] = [];
	const pNorm: number[] = [];
	const pSide: number[] = [];
	const pAlong: number[] = [];
	const pWidth: number[] = [];
	const pKind: number[] = [];
	const pZone: number[] = [];
	const pT: number[] = [];
	const pLeak: number[] = [];
	const pIdx: number[] = [];
	let base = 0;
	for (const l of lines) {
		let along = 0;
		for (let i = 0; i < l.pts.length; i++) {
			const q = l.pts[i];
			const a = l.pts[Math.max(0, i - 1)];
			const b = l.pts[Math.min(l.pts.length - 1, i + 1)];
			let tx = b.x - a.x;
			let tz = b.z - a.z;
			const tl = Math.hypot(tx, tz) || 1;
			tx /= tl;
			tz /= tl;
			if (i > 0) along += Math.hypot(q.x - l.pts[i - 1].x, q.z - l.pts[i - 1].z);
			const t = l.zone >= 0 ? Math.min(1, Math.hypot(q.x - srcXZ[l.zone].x, q.z - srcXZ[l.zone].z) / zoneMax[l.zone]) : 0.5;
			for (const side of [-1, 1]) {
				pPos.push(q.x, 0, q.z);
				pNorm.push(-tz, tx);
				pSide.push(side);
				pAlong.push(along);
				pWidth.push(l.width);
				pKind.push(l.kind);
				pZone.push(Math.max(0, l.zone));
				pT.push(t);
				pLeak.push(l.leak);
			}
			if (i < l.pts.length - 1) {
				const k = base + i * 2;
				pIdx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
			}
		}
		base += l.pts.length * 2;
	}
	const pipeGeo = track(new THREE.BufferGeometry());
	pipeGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
	pipeGeo.setAttribute('aNormal', new THREE.Float32BufferAttribute(pNorm, 2));
	pipeGeo.setAttribute('aSide', new THREE.Float32BufferAttribute(pSide, 1));
	pipeGeo.setAttribute('aAlong', new THREE.Float32BufferAttribute(pAlong, 1));
	pipeGeo.setAttribute('aWidth', new THREE.Float32BufferAttribute(pWidth, 1));
	pipeGeo.setAttribute('aKind', new THREE.Float32BufferAttribute(pKind, 1));
	pipeGeo.setAttribute('aZone', new THREE.Float32BufferAttribute(pZone, 1));
	pipeGeo.setAttribute('aT', new THREE.Float32BufferAttribute(pT, 1));
	pipeGeo.setAttribute('aLeak', new THREE.Float32BufferAttribute(pLeak, 1));
	pipeGeo.setIndex(pIdx);
	const leakXZ = project(leakMain.at.lng, leakMain.at.lat);
	const pipeUniforms = {
		uTime: { value: 0 },
		uFlowT: { value: 0 },
		/** km per screen pixel per km of view depth (set on resize) */
		uPxPerDepth: { value: 0.001 },
		uMode: { value: 0 },
		uFlowOn: { value: 1 },
		uLeakOn: { value: 0 },
		uLeakDrop: { value: 0 },
		uLeakPos: { value: new THREE.Vector2(leakXZ.x, leakXZ.z) },
		uPin: { value: new Array(ZONES.length).fill(2) },
		uPend: { value: new Array(ZONES.length).fill(1) },
		uZoneCol: { value: ZONES.map((z) => new THREE.Color(z.color)) }
	};
	const pipeVert = /* glsl */ `
				attribute vec2 aNormal;
				attribute float aSide, aAlong, aWidth, aKind, aZone, aT, aLeak;
				uniform float uPxPerDepth, uGrow, uLeakDrop, uLeakOn;
				uniform vec2 uLeakPos;
				uniform float uPin[${ZONES.length}];
				uniform float uPend[${ZONES.length}];
				uniform vec3 uZoneCol[${ZONES.length}];
				varying float vSide, vAlong, vKind, vLeak, vP;
				varying vec3 vZoneCol;
				void main() {
					int zi = int(aZone + 0.5);
					vec3 p = position;
					float w = (aWidth + step(0.5, aLeak) * step(aLeak, 1.5) * uLeakOn * 1.6) * uGrow;
					// constant pixel width at any distance, so far pipes never thin out into shimmering sub-pixel lines
					float depth = max(-(modelViewMatrix * vec4(position, 1.0)).z, 0.01);
					p.xz += aNormal * aSide * w * 0.5 * uPxPerDepth * depth;
					p.y = 0.006 + aKind * 0.004 + aLeak * 0.002;
					float d = distance(position.xz, uLeakPos);
					vP = mix(uPin[zi], uPend[zi], aT) - uLeakDrop * exp(-pow(d / 0.9, 2.0));
					vZoneCol = uZoneCol[zi];
					vSide = aSide;
					vAlong = aAlong;
					vKind = aKind;
					vLeak = aLeak;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
				}`;
	// dark casing underneath keeps the glow legible over bright imagery
	const casingMat = track(
		new THREE.ShaderMaterial({
			uniforms: { ...pipeUniforms, uGrow: { value: 2.3 } },
			vertexShader: pipeVert,
			fragmentShader: /* glsl */ `
				varying float vSide, vAlong, vKind, vLeak, vP;
				varying vec3 vZoneCol;
				void main() {
					float edge = 1.0 - pow(abs(vSide), 2.5);
					gl_FragColor = vec4(0.01, 0.035, 0.09, edge * 0.62);
				}`,
			transparent: true,
			depthWrite: false
		})
	);
	const casingMesh = new THREE.Mesh(pipeGeo, casingMat);
	casingMesh.renderOrder = 1;
	scene.add(casingMesh);
	const pipeMat = track(
		new THREE.ShaderMaterial({
			uniforms: { ...pipeUniforms, uGrow: { value: 1 } },
			vertexShader: pipeVert,
			fragmentShader: /* glsl */ `
				uniform float uTime, uFlowT, uMode, uFlowOn, uLeakOn;
				varying float vSide, vAlong, vKind, vLeak, vP;
				varying vec3 vZoneCol;
				vec3 pressureColor(float p) {
					vec3 c = vec3(1.0, 0.32, 0.27);
					c = mix(c, vec3(1.0, 0.62, 0.26), smoothstep(0.5, 0.75, p));
					c = mix(c, vec3(1.0, 0.82, 0.4), smoothstep(0.75, 1.2, p));
					c = mix(c, vec3(0.27, 0.84, 0.56), smoothstep(1.2, 2.0, p));
					c = mix(c, vec3(0.24, 0.76, 0.95), smoothstep(2.0, 3.0, p));
					c = mix(c, vec3(0.42, 0.5, 1.0), smoothstep(3.0, 4.5, p));
					return c;
				}
				void main() {
					vec3 cat = vKind > 0.5 ? vec3(0.44, 0.88, 1.0) : vec3(0.23, 0.55, 1.0);
					vec3 col = uMode < 0.5 ? cat : (uMode < 1.5 ? pressureColor(vP) : vZoneCol);
					float ph = vAlong * 4.0;
					float f = fract(ph - uFlowT * (vKind > 0.5 ? 1.5 : 1.0));
					float streak = smoothstep(0.0, 0.1, f) * smoothstep(0.55, 0.1, f);
					// a streak only a few pixels long would twinkle under the bloom: fade it to its average
					streak = mix(streak, 0.26, smoothstep(0.06, 0.25, fwidth(ph))) * uFlowOn;
					float edge = pow(max(1.0 - abs(vSide), 0.0), 0.55);
					float pulse = 0.5 + 0.5 * sin(uTime * 3.2);
					float main = step(0.5, vLeak) * step(vLeak, 1.5) * uLeakOn;
					float cand = step(1.5, vLeak);
					col = mix(col, vec3(1.0, 0.36, 0.3), main * (0.72 + 0.28 * pulse));
					col = mix(col, vec3(1.0, 0.7, 0.33), cand * 0.45 * (0.65 + 0.35 * sin(uTime * 1.8)));
					float a = edge * (0.62 + 0.5 * streak + 0.35 * main);
					gl_FragColor = vec4(col * (0.88 + 0.9 * streak + 0.5 * main), a);
				}`,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		})
	);
	const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
	pipeMesh.renderOrder = 2;
	scene.add(pipeMesh);

	/* ---------------- assets ---------------- */
	interface Node {
		a: Asset;
		pos: XZ;
		group: THREE.Group;
		top: number;
		ring: THREE.Mesh;
		ringMat: THREE.MeshBasicMaterial;
		halo: THREE.Mesh;
		haloMat: THREE.ShaderMaterial;
		fill?: THREE.Mesh;
		fillMat?: THREE.MeshBasicMaterial;
		label: CSS2DObject;
		labelEl: HTMLDivElement;
		valueEl: HTMLSpanElement;
		status: SiteStatus;
		spin?: THREE.Object3D;
		prio: number;
	}
	const nodes = new Map<string, Node>();
	const pickables: THREE.Object3D[] = [];
	const nodeGroups: THREE.Group[] = [];

	const haloGeo = track(new THREE.CircleGeometry(0.19, 40));
	const ringGeo = track(new THREE.RingGeometry(0.062, 0.08, 40));
	const beamGeo = track(new THREE.CylinderGeometry(0.0075, 0.0075, 1, 8, 1, true));
	const headGeo = track(new THREE.SphereGeometry(0.036, 18, 12));
	const pickGeo = track(new THREE.CylinderGeometry(0.1, 0.1, 1, 8));
	const pickMat = track(new THREE.MeshBasicMaterial({ visible: false }));

	const makeHaloMat = (hex: string) =>
		track(
			new THREE.ShaderMaterial({
				uniforms: { uColor: { value: new THREE.Color(hex) }, uTime: { value: 0 }, uAlarm: { value: 0 } },
				vertexShader: /* glsl */ `
					varying vec2 vUv;
					void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
				fragmentShader: /* glsl */ `
					uniform vec3 uColor;
					uniform float uTime, uAlarm;
					varying vec2 vUv;
					void main() {
						float d = length(vUv - 0.5) * 2.0;
						float wave = fract(uTime * (0.45 + uAlarm * 0.5));
						float ringW = smoothstep(wave - 0.12, wave, d) * smoothstep(wave + 0.02, wave, d);
						float core = smoothstep(1.0, 0.0, d) * 0.2;
						gl_FragColor = vec4(uColor, (ringW * (1.0 - wave) * 0.9 + core) * (1.0 - smoothstep(0.92, 1.0, d)));
					}`,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);

	const beamMat = (hex: string) =>
		track(
			new THREE.ShaderMaterial({
				uniforms: { uColor: { value: new THREE.Color(hex) } },
				vertexShader: /* glsl */ `
					varying float vY;
					void main() { vY = position.y + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
				fragmentShader: /* glsl */ `
					uniform vec3 uColor;
					varying float vY;
					void main() { gl_FragColor = vec4(uColor, 0.25 + 0.75 * (1.0 - vY)); }`,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);

	const TOP: Record<Asset['type'], number> = { DMA: 0.34, PT: 0.27, SC: 0.4, RES: 0.3 };
	const PRIO: Record<Asset['type'], number> = { DMA: 2, PT: 2, SC: 3, RES: 3 };

	function addLabel(group: THREE.Group, top: number, cls: string, color: string, id: string, value: string) {
		const labelEl = document.createElement('div');
		labelEl.className = `twin-label ${cls}`;
		labelEl.style.setProperty('--c', color);
		const dot = document.createElement('span');
		dot.className = 'twin-label__dot';
		const idEl = document.createElement('b');
		idEl.textContent = id;
		const valueEl = document.createElement('span');
		valueEl.className = 'twin-label__v';
		valueEl.textContent = value;
		labelEl.append(dot, idEl, valueEl);
		labelEl.addEventListener('pointerdown', (e) => e.stopPropagation());
		labelEl.addEventListener('click', () => select(id, true));
		const anchor = document.createElement('div');
		anchor.className = 'twin-label-anchor';
		anchor.append(labelEl);
		const label = new CSS2DObject(anchor);
		label.center.set(0.5, 1.15);
		label.position.set(0, top + 0.05, 0);
		group.add(label);
		return { label, labelEl, valueEl };
	}

	for (const a of ASSETS) {
		const meta = TYPE_META[a.type];
		const pos = project(a.lng, a.lat);
		const group = new THREE.Group();
		group.position.set(pos.x, 0, pos.z);
		scene.add(group);
		nodeGroups.push(group);
		const r0 = readAsset(a, 12, false);

		const haloMat = makeHaloMat(STATUS_HEX[r0.status]);
		const halo = new THREE.Mesh(haloGeo, haloMat);
		halo.rotation.x = -Math.PI / 2;
		halo.position.y = 0.008;
		group.add(halo);

		const ringMat = track(
			new THREE.MeshBasicMaterial({ color: STATUS_HEX[r0.status], transparent: true, opacity: 0.9, side: THREE.DoubleSide })
		);
		const ring = new THREE.Mesh(ringGeo, ringMat);
		ring.rotation.x = -Math.PI / 2;
		ring.position.y = 0.009;
		group.add(ring);

		let top = TOP[a.type];
		let fill: THREE.Mesh | undefined;
		let fillMat: THREE.MeshBasicMaterial | undefined;
		let spin: THREE.Object3D | undefined;
		const headMat = track(new THREE.MeshBasicMaterial({ color: meta.color }));

		if (a.type === 'RES') {
			// reservoir tank with its level
			const tubeH = top;
			const tank = new THREE.Mesh(
				track(new THREE.CylinderGeometry(0.075, 0.075, tubeH, 24, 1, true)),
				track(
					new THREE.MeshBasicMaterial({ color: '#8ff0e0', transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })
				)
			);
			tank.position.y = tubeH / 2;
			group.add(tank);
			const cap = new THREE.Mesh(track(new THREE.TorusGeometry(0.075, 0.005, 6, 28)), headMat);
			cap.rotation.x = Math.PI / 2;
			cap.position.y = tubeH;
			group.add(cap);
			fillMat = track(new THREE.MeshBasicMaterial({ color: meta.color, transparent: true, opacity: 0.8 }));
			fill = new THREE.Mesh(track(new THREE.CylinderGeometry(0.064, 0.064, 1, 24)), fillMat);
			group.add(fill);
			top = tubeH + 0.03;
		} else {
			const beam = new THREE.Mesh(beamGeo, beamMat(meta.color));
			beam.scale.y = top;
			beam.position.y = top / 2;
			group.add(beam);
			let head: THREE.Mesh;
			if (a.type === 'PT') head = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.046)), headMat);
			else if (a.type === 'SC') head = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, 0.06, 0.06)), headMat);
			else {
				// DMA meter: a flat "chamber" disc under the head
				head = new THREE.Mesh(headGeo, headMat);
				const pit = new THREE.Mesh(
					track(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 16)),
					track(new THREE.MeshBasicMaterial({ color: a.role === 'in' ? '#3cc3f2' : '#9fc6ff' }))
				);
				pit.position.y = 0.012;
				group.add(pit);
			}
			head.position.y = top;
			group.add(head);
			if (a.type !== 'DMA') spin = head;
		}

		const pick = new THREE.Mesh(pickGeo, pickMat);
		pick.scale.y = top + 0.06;
		pick.position.y = (top + 0.06) / 2;
		pick.userData.id = a.id;
		group.add(pick);
		pickables.push(pick);

		const { label, labelEl, valueEl } = addLabel(group, top, `twin-label--${r0.status}`, meta.color, a.id, r0.value);
		nodes.set(a.id, { a, pos, group, top, ring, ringMat, halo, haloMat, fill, fillMat, label, labelEl, valueEl, status: r0.status, spin, prio: PRIO[a.type] });
	}

	/* ---------------- leaks: burst fountain, ripples, localisation ring ---------------- */
	interface LeakNode {
		id: string;
		group: THREE.Group;
		ripple: THREE.ShaderMaterial;
		disc: THREE.Mesh;
		label: CSS2DObject;
		labelEl: HTMLDivElement;
		valueEl: HTMLSpanElement;
		main: boolean;
		pos: XZ;
	}
	const leakNodes: LeakNode[] = [];
	const leakGroup = new THREE.Group();
	scene.add(leakGroup);
	const DROPS = 220;
	const dropSeed = new Float32Array(DROPS * 4);
	for (let i = 0; i < DROPS; i++) {
		dropSeed[i * 4] = Math.random() * Math.PI * 2;
		dropSeed[i * 4 + 1] = 0.35 + Math.random() * 0.65;
		dropSeed[i * 4 + 2] = Math.random();
		dropSeed[i * 4 + 3] = 0.6 + Math.random() * 0.8;
	}
	const dropGeo = track(new THREE.BufferGeometry());
	dropGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(DROPS * 3), 3));
	dropGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(dropSeed, 4));
	const dropMat = track(
		new THREE.ShaderMaterial({
			uniforms: { uTime: { value: 0 }, uAmp: { value: 0 }, uScale: { value: 1 }, uPx: { value: 800 } },
			vertexShader: /* glsl */ `
				attribute vec4 aSeed;
				uniform float uTime, uAmp, uScale, uPx;
				varying float vA;
				void main() {
					float life = 1.1 * aSeed.w;
					float t = fract(uTime / life + aSeed.z) * life;
					float spread = 0.08 * aSeed.y * uScale;
					float v = 0.45 * (0.55 + 0.45 * aSeed.y) * uScale * uAmp;
					vec3 p = vec3(cos(aSeed.x) * spread * t, v * t - 0.19 * uScale * t * t, sin(aSeed.x) * spread * t);
					p.y = max(p.y, 0.0);
					vA = uAmp * (1.0 - t / life);
					vec4 mv = modelViewMatrix * vec4(p, 1.0);
					gl_Position = projectionMatrix * mv;
					gl_PointSize = max(1.5, (0.028 * uScale * uPx) / -mv.z);
				}`,
			fragmentShader: /* glsl */ `
				varying float vA;
				void main() {
					float d = length(gl_PointCoord - 0.5) * 2.0;
					if (d > 1.0) discard;
					gl_FragColor = vec4(vec3(0.75, 0.93, 1.0), vA * (1.0 - d) * 0.9);
				}`,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		})
	);
	const makeRipple = (hex: string) =>
		track(
			new THREE.ShaderMaterial({
				uniforms: { uColor: { value: new THREE.Color(hex) }, uTime: { value: 0 }, uAmp: { value: 1 } },
				vertexShader: /* glsl */ `
					varying vec2 vUv;
					void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
				fragmentShader: /* glsl */ `
					uniform vec3 uColor;
					uniform float uTime, uAmp;
					varying vec2 vUv;
					void main() {
						float d = length(vUv - 0.5) * 2.0;
						float a = 0.0;
						for (int k = 0; k < 3; k++) {
							float w = fract(uTime * 0.55 + float(k) / 3.0);
							a += smoothstep(w - 0.08, w, d) * smoothstep(w + 0.015, w, d) * (1.0 - w);
						}
						float core = smoothstep(0.35, 0.0, d) * 0.5;
						gl_FragColor = vec4(uColor, (a * 0.9 + core) * uAmp * (1.0 - smoothstep(0.9, 1.0, d)));
					}`,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
	let drops: THREE.Points | null = null;
	LEAKS.forEach((lk, i) => {
		const main = i === 0;
		const hex = STATUS_HEX[lk.severity];
		const pos = project(lk.at.lng, lk.at.lat);
		const group = new THREE.Group();
		group.position.set(pos.x, 0, pos.z);
		leakGroup.add(group);
		const ripple = makeRipple(hex);
		const disc = new THREE.Mesh(track(new THREE.CircleGeometry(main ? 0.32 : 0.22, 48)), ripple);
		disc.rotation.x = -Math.PI / 2;
		disc.position.y = 0.012;
		group.add(disc);
		// localisation uncertainty along the pipe (true metres)
		const ring = new THREE.Mesh(
			track(new THREE.RingGeometry(lk.radius / 1000 - 0.01, lk.radius / 1000, 72)),
			track(new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false }))
		);
		ring.rotation.x = -Math.PI / 2;
		ring.position.y = 0.011;
		group.add(ring);
		if (main) {
			drops = new THREE.Points(dropGeo, dropMat);
			drops.frustumCulled = false;
			group.add(drops);
		}
		const pick = new THREE.Mesh(pickGeo, pickMat);
		pick.scale.y = 0.2;
		pick.position.y = 0.1;
		pick.userData.id = lk.id;
		group.add(pick);
		pickables.push(pick);
		const { label, labelEl, valueEl } = addLabel(
			group,
			main ? 0.34 : 0.12,
			`twin-label--${lk.severity} pdam-leaklabel`,
			hex,
			lk.id,
			`${fmtNum(lk.est, 1)} L/s`
		);
		leakNodes.push({ id: lk.id, group, ripple, disc, label, labelEl, valueEl, main, pos });
	});

	/* ---------------- label declutter ---------------- */
	// Greedy screen-space placement in a stable order (priority, then id). Each label first
	// tries the offset it had last time, and may only switch between shown and hidden once
	// it has kept its state for a moment, so labels do not blink while the camera orbits.
	const LABEL_PRIO: Record<SiteStatus, number> = { alarm: 0, warn: 1, ok: 2 };
	const OFFSETS = [0, -1, 1, -2, 2, -3];
	const HOLD = 0.9;
	const labelState = new Map<string, { k: number | null; t: number }>();
	const projV = new THREE.Vector3();
	let lastDeclutter = 0;
	function declutter(now: number) {
		const w = container.clientWidth;
		const h = container.clientHeight;
		const all = [
			...[...nodes.values()].map((n) => ({ id: n.a.id, label: n.label, el: n.labelEl, prio: LABEL_PRIO[n.status] + n.prio })),
			...leakNodes.map((n) => ({ id: n.id, label: n.label, el: n.labelEl, prio: n.main ? -0.5 : 1 }))
		];
		const items = all
			.filter((n) => n.label.visible)
			.map((n) => {
				n.label.getWorldPosition(projV).project(camera);
				const bw = n.el.offsetWidth || 90;
				const bh = n.el.offsetHeight || 22;
				return {
					n,
					bw,
					bh,
					x: (projV.x * 0.5 + 0.5) * w - bw / 2,
					y: (-projV.y * 0.5 + 0.5) * h - bh * 1.15,
					behind: projV.z > 1,
					prio: n.id === selected ? -2 : n.prio
				};
			})
			.sort((a, b) => a.prio - b.prio || (a.n.id < b.n.id ? -1 : 1));
		const placed: { x: number; y: number; w: number; h: number }[] = [];
		const hits = (r: { x: number; y: number; w: number; h: number }) =>
			placed.some((p) => r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y);
		for (const it of items) {
			if (it.behind) continue;
			const rect = (k: number) => ({ x: it.x - 3, y: it.y + k * (it.bh + 4) - 2, w: it.bw + 6, h: it.bh + 4 });
			const prev = labelState.get(it.n.id);
			const order = prev && prev.k !== null ? [prev.k, ...OFFSETS.filter((k) => k !== prev.k)] : OFFSETS;
			let k: number | null = null;
			for (const kk of order) {
				const r = rect(kk);
				if (!hits(r)) {
					k = kk;
					placed.push(r);
					break;
				}
			}
			if (prev && (prev.k === null) !== (k === null) && now - prev.t < HOLD) {
				if (prev.k !== null) {
					// shown a moment ago: keep it where it was for now
					k = prev.k;
					placed.push(rect(k));
				} else {
					// hidden a moment ago: stay hidden and give the room back
					if (k !== null) placed.pop();
					k = null;
				}
			}
			const flip = !prev || (prev.k === null) !== (k === null);
			labelState.set(it.n.id, { k, t: flip ? now : prev!.t });
			const dy = k === null ? 0 : k * (it.bh + 4);
			it.n.el.classList.toggle('is-hidden', k === null);
			it.n.el.style.setProperty('--dy', `${dy}px`);
			it.n.el.classList.toggle('is-shifted', dy !== 0);
		}
	}

	/* ---------------- selection + picking ---------------- */
	let selected: string | null = null;
	let fly: { t0: number; dur: number; p0: THREE.Vector3; p1: THREE.Vector3; t0v: THREE.Vector3; t1v: THREE.Vector3 } | null = null;

	function flyTo(pos: THREE.Vector3, target: THREE.Vector3, dur = 1.3) {
		fly = { t0: clock.elapsedTime, dur, p0: camera.position.clone(), p1: pos, t0v: controls.target.clone(), t1v: target };
	}
	function labelOf(id: string) {
		return nodes.get(id)?.labelEl ?? leakNodes.find((l) => l.id === id)?.labelEl;
	}
	function select(id: string, doFly = false) {
		const node = nodes.get(id);
		const lk = leakNodes.find((l) => l.id === id);
		const pos = node?.pos ?? lk?.pos;
		if (!pos) return;
		if (selected && selected !== id) labelOf(selected)?.classList.remove('is-selected');
		selected = id;
		labelOf(id)?.classList.add('is-selected');
		if (doFly) {
			const tgt = new THREE.Vector3(pos.x, 0.1, pos.z);
			const dir = camera.position.clone().sub(controls.target).normalize();
			if (dir.y < 0.5) dir.y = 0.5;
			dir.normalize();
			flyTo(tgt.clone().add(dir.multiplyScalar(lk ? 2.6 : 3.4)), tgt);
		}
		opts.onSelect?.(id);
	}

	const raycaster = new THREE.Raycaster();
	const ndc = new THREE.Vector2();
	let downX = 0;
	let downY = 0;
	const onDown = (e: PointerEvent) => {
		downX = e.clientX;
		downY = e.clientY;
	};
	const onUp = (e: PointerEvent) => {
		if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;
		const rect = renderer.domElement.getBoundingClientRect();
		ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
		raycaster.setFromCamera(ndc, camera);
		const hit = raycaster.intersectObjects(pickables, false)[0];
		if (hit) select(hit.object.userData.id as string, true);
	};
	renderer.domElement.addEventListener('pointerdown', onDown);
	renderer.domElement.addEventListener('pointerup', onUp);

	/* ---------------- state pushed in from the page ---------------- */
	let hour = 12;
	let leakAmp = 0;
	let flowRate = 1;
	let layers: TwinLayers = { imagery: true, zones: true, pipes: true, flow: true, leaks: true, labels: true };

	function applyHour(h: number) {
		hour = h;
		const u = pipeMat.uniforms;
		ZONES.forEach((z, k) => {
			(u.uPin.value as number[])[k] = zonePressure(z.id, h, 'in');
			(u.uPend.value as number[])[k] = zonePressure(z.id, h, 'end');
		});
		const on = burstOn(h, false);
		leakAmp = on;
		u.uLeakOn.value = on > 0 ? 1 : 0;
		u.uLeakDrop.value = (BURST.drop['PT-01'] ?? 0.34) * on;
		flowRate = 0.35 + 0.65 * demand(h);
		for (const n of nodes.values()) {
			const r = readAsset(n.a, h, false);
			n.valueEl.textContent = r.value;
			if (r.status !== n.status) {
				n.labelEl.classList.remove(`twin-label--${n.status}`);
				n.labelEl.classList.add(`twin-label--${r.status}`);
				n.status = r.status;
				n.ringMat.color.set(STATUS_HEX[r.status]);
				(n.haloMat.uniforms.uColor.value as THREE.Color).set(STATUS_HEX[r.status]);
				n.haloMat.uniforms.uAlarm.value = r.status === 'alarm' ? 1 : 0;
			}
			if (n.fill && r.level != null) {
				const hgt = Math.max(0.004, (r.level / 100) * (n.top - 0.03));
				n.fill.scale.y = hgt;
				n.fill.position.y = hgt / 2;
			}
		}
		const main = leakNodes[0];
		if (main) {
			main.valueEl.textContent = on > 0 ? `${fmtNum(burstFlow(h, false), 1)} L/s` : 'belum terjadi';
			main.labelEl.classList.toggle('is-dim', on <= 0);
		}
		applyLeakVisibility();
	}

	function applyLeakVisibility() {
		const main = leakNodes[0];
		if (main) main.group.visible = layers.leaks && leakAmp > 0;
		for (const l of leakNodes.slice(1)) l.group.visible = layers.leaks;
		for (const l of leakNodes) l.label.visible = layers.labels && l.group.visible;
	}

	/* ---------------- sizing + loop ---------------- */
	const dropPx = { value: 800 };
	function resize() {
		const w = Math.max(1, container.clientWidth);
		const h = Math.max(1, container.clientHeight);
		renderer.setSize(w, h, false);
		composer.setSize(w, h);
		labelRenderer.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		dropPx.value = (h * renderer.getPixelRatio()) / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
		pipeUniforms.uPxPerDepth.value = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / h;
		if (!userMoved && !fly) {
			const dir = camera.position.clone().sub(controls.target).normalize();
			camera.position.copy(controls.target).add(dir.multiplyScalar(fitDistance()));
		}
		// setSize clears the canvas and ResizeObserver fires after rAF, so without this one black frame shows
		composer.render();
		labelRenderer.render(scene, camera);
	}
	const ro = new ResizeObserver(resize);
	ro.observe(container);
	resize();

	const clock = new THREE.Clock();
	let raf = 0;
	let lastImgUpload = 0;
	let lastPatchCheck = 0;
	let lastPatchUpload = 0;
	let lastT = 0;
	let flowT = 0;
	let far = false;
	function frame() {
		raf = requestAnimationFrame(frame);
		const t = clock.getElapsedTime();
		const dt = Math.min(0.1, t - lastT);
		lastT = t;
		flowT += dt * flowRate * 0.55;
		curtainMat.uniforms.uTime.value = t;
		pipeMat.uniforms.uTime.value = t;
		pipeMat.uniforms.uFlowT.value = flowT;
		if (imgDirty && t - lastImgUpload > 0.3) {
			imgTex.needsUpdate = true;
			imgDirty = false;
			lastImgUpload = t;
		}
		if (t - lastPatchCheck > 0.4) {
			updatePatch();
			lastPatchCheck = t;
		}
		if (patchDirty && t - lastPatchUpload > 0.25) {
			patchTex.needsUpdate = true;
			patchDirty = false;
			lastPatchUpload = t;
		}
		// nodes and ribbons keep a readable size at any zoom
		const camD = camera.position.distanceTo(controls.target) || 1;
		const k = THREE.MathUtils.clamp(camD / REF_DIST, 0.07, 1.6);
		// from far away, normal assets show only their id (with hysteresis so it never toggles back and forth)
		const wantFar = far ? camD > 10.2 : camD > 11.8;
		if (wantFar !== far) {
			far = wantFar;
			container.classList.toggle('is-far', far);
		}
		// near plane follows the zoom: keeps depth precision for pipes and outlines a few metres above the ground
		const near = Math.max(0.01, camD * 0.02);
		if (Math.abs(camera.near - near) > near * 0.2) {
			camera.near = near;
			camera.updateProjectionMatrix();
		}
		for (const g of nodeGroups) g.scale.setScalar(k);
		for (const l of leakNodes) {
			// the ripple marker follows the zoom; the localisation ring stays true to scale
			l.disc.scale.setScalar(THREE.MathUtils.clamp(k, 0.34, 1.2));
			l.ripple.uniforms.uTime.value = t + (l.main ? 0 : 0.4);
			l.ripple.uniforms.uAmp.value = l.main ? leakAmp : 0.8;
			l.label.position.y = (l.main ? 0.34 : 0.12) * Math.max(k, 0.2);
		}
		dropMat.uniforms.uTime.value = t;
		dropMat.uniforms.uAmp.value = leakAmp;
		dropMat.uniforms.uScale.value = Math.max(k, 0.3);
		dropMat.uniforms.uPx.value = dropPx.value;
		for (const n of nodes.values()) {
			n.haloMat.uniforms.uTime.value = t + n.pos.x * 0.7;
			const sel = n.a.id === selected;
			const pulse = 1 + 0.08 * Math.sin(t * 3 + n.pos.z * 3);
			n.ring.scale.setScalar(sel ? 1.6 * pulse : pulse);
			n.ringMat.opacity = n.status === 'alarm' ? 0.55 + 0.45 * Math.abs(Math.sin(t * 4)) : 0.9;
			if (n.spin) n.spin.rotation.y = t * 0.8;
		}
		if (fly) {
			const kk = Math.min(1, (t - fly.t0) / fly.dur);
			const e = easeInOut(kk);
			camera.position.lerpVectors(fly.p0, fly.p1, e);
			controls.target.lerpVectors(fly.t0v, fly.t1v, e);
			if (kk >= 1) fly = null;
		}
		controls.update();
		controls.target.x = THREE.MathUtils.clamp(controls.target.x, nw.x + 1, se.x - 1);
		controls.target.z = THREE.MathUtils.clamp(controls.target.z, nw.z + 1, se.z - 1);
		if (opts.compass) opts.compass.style.transform = `rotate(${THREE.MathUtils.radToDeg(controls.getAzimuthalAngle())}deg)`;
		composer.render();
		labelRenderer.render(scene, camera);
		if (t - lastDeclutter > 0.2) {
			declutter(t);
			lastDeclutter = t;
		}
	}
	applyHour(hour);
	frame();

	/* ---------------- API ---------------- */
	return {
		setHour: applyHour,
		setLayers(l) {
			layers = { ...layers, ...l };
			groundMat.uniforms.uImagery.value = layers.imagery ? 1 : 0;
			groundUniforms.uZonesOn.value = layers.zones ? 1 : 0;
			zoneGroup.visible = layers.zones;
			for (const z of zoneTags) z.visible = layers.zones && layers.labels;
			pipeMesh.visible = layers.pipes;
			casingMesh.visible = layers.pipes;
			pipeMat.uniforms.uFlowOn.value = layers.flow ? 1 : 0;
			for (const n of nodes.values()) n.label.visible = layers.labels;
			applyLeakVisibility();
		},
		setPipeMode(m) {
			pipeMat.uniforms.uMode.value = m === 'kategori' ? 0 : m === 'tekanan' ? 1 : 2;
		},
		setZoneMode(m) {
			groundUniforms.uNrwMode.value = m === 'nrw' ? 1 : 0;
		},
		setImageryStyle(style) {
			groundUniforms.uNatural.value = style === 'natural' ? 1 : 0;
		},
		select,
		resetView() {
			flyTo(homePos(), HOME_TGT.clone(), 1.4);
		},
		setAutoRotate(on) {
			controls.autoRotate = on;
		},
		dispose() {
			cancelAnimationFrame(raf);
			for (const im of patchImgs) im.onload = null;
			ro.disconnect();
			renderer.domElement.removeEventListener('pointerdown', onDown);
			renderer.domElement.removeEventListener('pointerup', onUp);
			for (const im of pendingImages) {
				im.onload = null;
				im.src = '';
			}
			controls.dispose();
			for (const d of disposables) d.dispose();
			composer.dispose();
			renderer.dispose();
			renderer.forceContextLoss();
			renderer.domElement.remove();
			labelRenderer.domElement.remove();
		}
	};
}
