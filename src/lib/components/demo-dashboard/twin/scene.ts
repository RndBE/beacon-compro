// Three.js scene for the Tulang Bawang digital twin. Imperative on purpose:
// the Svelte page owns the forecast state and pushes it in through the API below.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import type { SiteStatus, TbSensor, TbSensorType } from '../data';
import { TB_TYPE_META } from '../data';
import {
	makeProjector,
	makeUnprojector,
	mercX,
	mercY,
	outerRings,
	ringArea,
	simplify,
	tileLat,
	tileLon,
	tileRange,
	tileX,
	tileY,
	type XZ
} from './geo';
import { FLOOD_ZONES, GAUGES } from './scenario';

export interface TwinLayers {
	imagery: boolean;
	rivers: boolean;
	flood: boolean;
	rain: boolean;
	links: boolean;
	labels: boolean;
}

export interface SensorState {
	value: string;
	status: SiteStatus;
	/** water level in metres, AWLR only */
	level?: number;
}

interface GeoCollection {
	features: { geometry: { type: string; coordinates: unknown }; properties?: Record<string, unknown> }[];
}

export interface TwinOptions {
	container: HTMLElement;
	sensors: TbSensor[];
	boundary: GeoCollection;
	rivers: GeoCollection;
	/** XYZ imagery url builder; tiles must allow CORS */
	tileUrl: (z: number, x: number, y: number) => string;
	tileZoom?: number;
	compass?: HTMLElement | null;
	onSelect?: (id: string) => void;
	onImagery?: (loaded: number, total: number) => void;
}

export interface FloodArea {
	total: number;
	perZone: number[];
}

export interface TwinApi {
	setZoneFlood(f: number[]): void;
	/** weather over a rain gauge follows its status: ok = clear, warn = drizzle, alarm = downpour */
	setWeather(id: string, level: SiteStatus): void;
	setSensor(id: string, s: SensorState): void;
	setLayers(l: Partial<TwinLayers>): void;
	select(id: string, fly?: boolean): void;
	resetView(): void;
	setAutoRotate(on: boolean): void;
	floodArea(f: number[]): FloodArea;
	/** 'natural' shows true-colour imagery, 'night' maps it onto the navy palette */
	setImageryStyle(style: 'natural' | 'night'): void;
	dispose(): void;
}

const STATUS_HEX: Record<SiteStatus, string> = { ok: '#46D78F', warn: '#FFB454', alarm: '#FF7A66' };
const LON0 = 105.535;
const LAT0 = -4.398;
/** how far the flood can spread from a river channel at full inundation, km */
const FLOOD_WIDTH = 0.8;
/** channels that overtop in the forecast: the main stem and Way Pedada past Banjar Margo */
const FLOOD_RIVERS = /tulang bawang|pedada/i;
/** distance range encoded in the field texture, km */
const DIST_MAX = 8;
/** metres of water level to scene kilometres for the gauge columns */
const LEVEL_SCALE = 1.1;
const HOME_POS = new THREE.Vector3(6, 60, 80);
const HOME_TGT = new THREE.Vector3(2, 0, 3);

const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

export function createTwinScene(opts: TwinOptions): TwinApi {
	const { container, sensors } = opts;
	const project = makeProjector(LON0, LAT0);
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

	const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 900);
	camera.position.copy(HOME_POS);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.copy(HOME_TGT);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.minDistance = 7;
	controls.maxDistance = 175;
	controls.minPolarAngle = 0.12;
	controls.maxPolarAngle = 1.3;
	controls.zoomToCursor = true;
	controls.autoRotateSpeed = 0.35;
	let userMoved = false;
	controls.addEventListener('start', () => {
		controls.autoRotate = false;
		userMoved = true;
		fly = null;
	});
	/** Camera distance at which the whole regency fits the viewport width. */
	function fitDistance() {
		const base = HOME_POS.distanceTo(HOME_TGT);
		const half = THREE.MathUtils.degToRad(camera.fov / 2);
		const hfovHalf = Math.atan(Math.tan(half) * camera.aspect);
		return THREE.MathUtils.clamp(46 / Math.tan(hfovHalf), base, 170);
	}
	function homePos() {
		return HOME_TGT.clone().add(HOME_POS.clone().sub(HOME_TGT).normalize().multiplyScalar(fitDistance()));
	}

	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));
	const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.38, 0.62);
	composer.addPass(bloom);
	composer.addPass(new OutputPass());

	/* ---------------- ground: imagery + field textures ---------------- */
	const rings = outerRings(opts.boundary)
		.filter((r) => ringArea(r) > 1e-4)
		.map((r) => simplify(r, 0.0012));
	let west = Infinity,
		east = -Infinity,
		south = Infinity,
		north = -Infinity;
	for (const r of rings)
		for (const [x, y] of r) {
			west = Math.min(west, x);
			east = Math.max(east, x);
			south = Math.min(south, y);
			north = Math.max(north, y);
		}
	const margin = 0.07;
	const zoom = opts.tileZoom ?? 12;
	const tr = tileRange(west - margin, south - margin, east + margin, north + margin, zoom);
	const nw = project(tr.west, tr.north);
	const se = project(tr.east, tr.south);
	const groundW = se.x - nw.x;
	const groundD = se.z - nw.z;
	const groundCx = (nw.x + se.x) / 2;
	const groundCz = (nw.z + se.z) / 2;

	// imagery canvas, filled progressively as tiles arrive
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
	for (let ty = tr.y0; ty <= tr.y1; ty++)
		for (let tx = tr.x0; tx <= tr.x1; tx++) {
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

	// field grid: inside mask, distance to river, zone weights
	const FW = 560;
	const FH = Math.round((FW * groundD) / groundW);
	const toFieldPx = (lon: number, lat: number): [number, number] => [
		((mercX(lon) - mercX(tr.west)) / (mercX(tr.east) - mercX(tr.west))) * FW,
		((mercY(tr.north) - mercY(lat)) / (mercY(tr.north) - mercY(tr.south))) * FH
	];
	const scratch = document.createElement('canvas');
	scratch.width = FW;
	scratch.height = FH;
	const sctx = scratch.getContext('2d', { willReadFrequently: true })!;

	sctx.fillStyle = '#fff';
	for (const r of rings) {
		sctx.beginPath();
		r.forEach(([x, y], i) => {
			const [px, py] = toFieldPx(x, y);
			if (i) sctx.lineTo(px, py);
			else sctx.moveTo(px, py);
		});
		sctx.closePath();
		sctx.fill();
	}
	const insideData = sctx.getImageData(0, 0, FW, FH).data;
	const inside = new Float32Array(FW * FH);
	for (let i = 0; i < FW * FH; i++) inside[i] = insideData[i * 4 + 3] / 255;

	type RiverLine = { pts: [number, number][]; rank: number; name: string };
	const riverLines: RiverLine[] = [];
	for (const f of opts.rivers.features) {
		if (f.geometry.type !== 'LineString') continue;
		riverLines.push({
			pts: f.geometry.coordinates as [number, number][],
			rank: Number(f.properties?.rank ?? 3),
			name: String(f.properties?.name ?? '')
		});
	}
	sctx.clearRect(0, 0, FW, FH);
	sctx.strokeStyle = '#fff';
	sctx.lineCap = 'round';
	sctx.lineJoin = 'round';
	for (const l of riverLines) {
		if (!FLOOD_RIVERS.test(l.name)) continue;
		sctx.lineWidth = l.rank === 1 ? 2.2 : 1.2;
		sctx.beginPath();
		l.pts.forEach(([x, y], i) => {
			const [px, py] = toFieldPx(x, y);
			if (i) sctx.lineTo(px, py);
			else sctx.moveTo(px, py);
		});
		sctx.stroke();
	}
	const riverData = sctx.getImageData(0, 0, FW, FH).data;

	// two-pass chamfer distance transform (pixels)
	const INF = 1e9;
	const dist = new Float32Array(FW * FH);
	for (let i = 0; i < FW * FH; i++) dist[i] = riverData[i * 4 + 3] > 60 ? 0 : INF;
	const D1 = 1;
	const D2 = Math.SQRT2;
	for (let y = 0; y < FH; y++)
		for (let x = 0; x < FW; x++) {
			const i = y * FW + x;
			let d = dist[i];
			if (x > 0) d = Math.min(d, dist[i - 1] + D1);
			if (y > 0) {
				d = Math.min(d, dist[i - FW] + D1);
				if (x > 0) d = Math.min(d, dist[i - FW - 1] + D2);
				if (x < FW - 1) d = Math.min(d, dist[i - FW + 1] + D2);
			}
			dist[i] = d;
		}
	for (let y = FH - 1; y >= 0; y--)
		for (let x = FW - 1; x >= 0; x--) {
			const i = y * FW + x;
			let d = dist[i];
			if (x < FW - 1) d = Math.min(d, dist[i + 1] + D1);
			if (y < FH - 1) {
				d = Math.min(d, dist[i + FW] + D1);
				if (x < FW - 1) d = Math.min(d, dist[i + FW + 1] + D2);
				if (x > 0) d = Math.min(d, dist[i + FW - 1] + D2);
			}
			dist[i] = d;
		}
	const kmPerPx = groundW / FW;
	const cellArea = (groundW / FW) * (groundD / FH);

	const zoneXZ = FLOOD_ZONES.map((z) => project(z.lon, z.lat));
	const zoneW = new Float32Array(FW * FH * 4);
	const fieldBytes = new Uint8Array(FW * FH * 4);
	const zoneBytes = new Uint8Array(FW * FH * 4);
	for (let y = 0; y < FH; y++) {
		const wz = nw.z + ((y + 0.5) / FH) * groundD;
		// DataTexture row 0 is the bottom (south) edge
		const row = FH - 1 - y;
		for (let x = 0; x < FW; x++) {
			const i = y * FW + x;
			const o = (row * FW + x) * 4;
			const wx = nw.x + ((x + 0.5) / FW) * groundW;
			const dkm = dist[i] * kmPerPx;
			dist[i] = dkm;
			fieldBytes[o] = Math.round(inside[i] * 255);
			fieldBytes[o + 1] = Math.round(Math.min(1, dkm / DIST_MAX) * 255);
			fieldBytes[o + 3] = 255;
			for (let k = 0; k < 4; k++) {
				const zz = zoneXZ[k];
				const r = FLOOD_ZONES[k].radius;
				const d2 = ((wx - zz.x) ** 2 + (wz - zz.z) ** 2) / (r * r);
				const w = Math.exp(-d2 * 2);
				zoneW[i * 4 + k] = w;
				zoneBytes[o + k] = Math.round(w * 255);
			}
		}
	}
	const fieldTex = track(new THREE.DataTexture(fieldBytes, FW, FH, THREE.RGBAFormat));
	fieldTex.magFilter = fieldTex.minFilter = THREE.LinearFilter;
	fieldTex.needsUpdate = true;
	const zoneTex = track(new THREE.DataTexture(zoneBytes, FW, FH, THREE.RGBAFormat));
	zoneTex.magFilter = zoneTex.minFilter = THREE.LinearFilter;
	zoneTex.needsUpdate = true;

	const groundUniforms = {
		uMap: { value: imgTex as THREE.Texture },
		uHasMap: { value: 0 },
		uImagery: { value: 1 },
		uNatural: { value: 1 },
		uIsPatch: { value: 0 },
		uFade: { value: 1 },
		uGround: { value: new THREE.Vector4(nw.x, nw.z, groundW, groundD) },
		uField: { value: fieldTex },
		uZones: { value: zoneTex },
		uZoneFlood: { value: new THREE.Vector4() },
		uFloodOn: { value: 1 },
		uTime: { value: 0 },
		uDistMax: { value: DIST_MAX },
		uFloodWidth: { value: FLOOD_WIDTH },
		uDeep: { value: new THREE.Color('#030a1c') },
		uMid: { value: new THREE.Color('#0f2c5c') },
		uHi: { value: new THREE.Color('#5e9fe0') },
		uGrid: { value: new THREE.Color('#2f73d8') },
		uWaterA: { value: new THREE.Color('#0c5fc0') },
		uWaterB: { value: new THREE.Color('#58d2ff') },
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
		uniform sampler2D uMap, uField, uZones;
		uniform float uHasMap, uImagery, uNatural, uIsPatch, uFade, uFloodOn, uTime, uDistMax, uFloodWidth;
		uniform vec4 uZoneFlood, uGround;
		uniform vec3 uDeep, uMid, uHi, uGrid, uWaterA, uWaterB, uBg;
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
			// field textures cover the whole ground, so look them up by world position
			vec2 fuv = vec2((vWorld.x - uGround.x) / uGround.z, 1.0 - (vWorld.z - uGround.y) / uGround.w);
			vec4 field = texture2D(uField, fuv);
			float inside = field.r;
			vec4 texel = texture2D(uMap, vUv);
			vec3 img = texel.rgb;
			float has = uHasMap * uImagery;
			float fallback = 0.35 + 0.2 * noise(vWorld.xz * 0.09) + 0.1 * noise(vWorld.xz * 0.5);

			// night grade: imagery luminance mapped onto the navy palette
			float lum = clamp((pow(dot(img, LUMA), 0.45) - 0.1) / 0.34, 0.0, 1.0);
			lum = mix(fallback, lum, has);
			vec3 tint = mix(uDeep, uMid, smoothstep(0.0, 0.55, lum));
			tint = mix(tint, uHi, smoothstep(0.55, 1.0, lum));
			vec3 night = mix(tint * 0.3 + uDeep * 0.45, tint * 1.2, inside);

			// natural grade: true colour, slightly cooled so it sits in the navy UI
			vec3 nat = mix(vec3(dot(img, LUMA)), img, 0.92) * vec3(0.92, 1.0, 1.1) * 1.25;
			nat = mix(uDeep + uMid * fallback * 0.6, nat, has);
			vec3 natural = mix(nat * 0.3 + uDeep * 0.4, nat, inside);

			vec3 col = mix(night, natural, uNatural);

			vec2 gp = vWorld.xz / 5.0;
			vec2 gd = abs(fract(gp - 0.5) - 0.5) / fwidth(gp);
			float line = 1.0 - min(min(gd.x, gd.y), 1.0);
			col += uGrid * line * (0.025 + 0.06 * inside) * (1.0 - 0.55 * uNatural);

			float dist = field.g * uDistMax;
			vec4 zr = texture2D(uZones, fuv) * uZoneFlood;
			float reach = max(max(zr.x, zr.y), max(zr.z, zr.w)) * uFloodWidth;
			float n = (noise(vWorld.xz * 0.55) - 0.5) * 1.2 + (noise(vWorld.xz * 2.2) - 0.5) * 0.45;
			float front = reach - dist + n * min(reach, 1.2);
			float wet = smoothstep(0.0, 0.35, front) * step(0.05, reach) * inside * uFloodOn;
			float ripple = 0.5 + 0.5 * sin(uTime * 1.7 + vWorld.x * 2.1 + vWorld.z * 1.3 + noise(vWorld.xz * 1.1) * 6.0);
			vec3 water = mix(uWaterA, uWaterB, 0.18 + ripple * 0.3);
			float rim = smoothstep(0.35, 0.0, abs(front - 0.18)) * step(0.05, reach) * inside * uFloodOn;
			col = mix(col, water, wet * 0.7);
			col += uWaterB * rim * 0.22;

			float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
			float alpha = 1.0;
			if (uIsPatch > 0.5) alpha = texel.a * smoothstep(0.0, 0.14, e) * uFade * uImagery;
			else col = mix(uBg, col, smoothstep(0.0, 0.08, e));
			gl_FragColor = vec4(col, alpha);
		}`;
	const groundMat = track(
		new THREE.ShaderMaterial({ uniforms: groundUniforms, vertexShader: groundVert, fragmentShader: groundFrag })
	);
	const groundGeo = track(new THREE.PlaneGeometry(groundW, groundD, 1, 1));
	const ground = new THREE.Mesh(groundGeo, groundMat);
	ground.rotation.x = -Math.PI / 2;
	ground.position.set(groundCx, 0, groundCz);
	scene.add(ground);

	/* ---------------- sharper imagery around the orbit target (z14 detail patch) ---------------- */
	const PATCH_Z = 14;
	const PATCH_N = 5;
	const unproject = makeUnprojector(LON0, LAT0);
	const patchCanvas = document.createElement('canvas');
	patchCanvas.width = patchCanvas.height = PATCH_N * 256;
	const pctx = patchCanvas.getContext('2d')!;
	const patchTex = track(new THREE.CanvasTexture(patchCanvas));
	patchTex.colorSpace = THREE.SRGBColorSpace;
	patchTex.anisotropy = imgTex.anisotropy;
	// shares every uniform object with the ground except the map and the patch flags
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
		// keep the overlapping part of the previous patch so the move does not flash
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
		patch.position.set((a.x + b.x) / 2, 0.012, (a.z + b.z) / 2);
		patch.scale.set(b.x - a.x, b.z - a.z, 1);
		patch.visible = true;
		patchDirty = true;
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
		const fade = 1 - THREE.MathUtils.smoothstep(d, 34, 58);
		patchMat.uniforms.uFade.value = fade;
		if (fade <= 0.01) return;
		const { lon, lat } = unproject(controls.target.x, controls.target.z);
		const cx = Math.floor(tileX(lon, PATCH_Z));
		const cy = Math.floor(tileY(lat, PATCH_Z));
		if (patchAt && Math.abs(cx - patchAt.x) <= 1 && Math.abs(cy - patchAt.y) <= 1) return;
		loadPatch(cx, cy);
	}

	/* ---------------- boundary curtain ---------------- */
	const CURTAIN_H = 1.8;
	const curtainPos: number[] = [];
	const curtainV: number[] = [];
	const edgePts: THREE.Vector3[][] = [];
	for (const r of rings) {
		const pts = r.map(([x, y]) => project(x, y));
		const line: THREE.Vector3[] = [];
		for (let i = 0; i < pts.length; i++) {
			const a = pts[i];
			const b = pts[(i + 1) % pts.length];
			curtainPos.push(a.x, 0, a.z, b.x, 0, b.z, b.x, CURTAIN_H, b.z, a.x, 0, a.z, b.x, CURTAIN_H, b.z, a.x, CURTAIN_H, a.z);
			curtainV.push(0, 0, 1, 0, 1, 1);
			line.push(new THREE.Vector3(a.x, 0.04, a.z));
		}
		line.push(line[0].clone());
		edgePts.push(line);
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
					vH = position.x * 0.35 + position.z * 0.2;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}`,
			fragmentShader: /* glsl */ `
				uniform float uTime;
				uniform vec3 uColor;
				varying float vV;
				varying float vH;
				void main() {
					float fade = pow(1.0 - vV, 2.2);
					float scan = 0.5 + 0.5 * sin(vV * 18.0 - uTime * 2.4 + vH * 0.2);
					gl_FragColor = vec4(uColor, fade * (0.32 + 0.18 * scan));
				}`,
			transparent: true,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending
		})
	);
	scene.add(new THREE.Mesh(curtainGeo, curtainMat));
	const edgeMat = track(new THREE.LineBasicMaterial({ color: '#7fe3ff', transparent: true, opacity: 0.95 }));
	for (const line of edgePts) {
		const g = track(new THREE.BufferGeometry().setFromPoints(line));
		scene.add(new THREE.Line(g, edgeMat));
	}

	/* ---------------- rivers as flowing ribbons ---------------- */
	const rPos: number[] = [];
	const rAlong: number[] = [];
	const rSide: number[] = [];
	const rRank: number[] = [];
	const rIdx: number[] = [];
	let base = 0;
	for (const l of riverLines) {
		const pts = l.pts.map(([x, y]) => project(x, y));
		if (pts.length < 2) continue;
		const w = l.rank === 1 ? 0.42 : l.rank === 2 ? 0.17 : 0.09;
		const y = l.rank === 1 ? 0.05 : 0.04;
		let along = 0;
		for (let i = 0; i < pts.length; i++) {
			const p = pts[i];
			const a = pts[Math.max(0, i - 1)];
			const b = pts[Math.min(pts.length - 1, i + 1)];
			let tx = b.x - a.x;
			let tz = b.z - a.z;
			const tl = Math.hypot(tx, tz) || 1;
			tx /= tl;
			tz /= tl;
			if (i > 0) along += Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z);
			const nx = -tz * (w / 2);
			const nz = tx * (w / 2);
			rPos.push(p.x + nx, y, p.z + nz, p.x - nx, y, p.z - nz);
			rAlong.push(along, along);
			rSide.push(-1, 1);
			rRank.push(l.rank, l.rank);
			if (i < pts.length - 1) {
				const k = base + i * 2;
				rIdx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
			}
		}
		base += pts.length * 2;
	}
	const riverGeo = track(new THREE.BufferGeometry());
	riverGeo.setAttribute('position', new THREE.Float32BufferAttribute(rPos, 3));
	riverGeo.setAttribute('aAlong', new THREE.Float32BufferAttribute(rAlong, 1));
	riverGeo.setAttribute('aSide', new THREE.Float32BufferAttribute(rSide, 1));
	riverGeo.setAttribute('aRank', new THREE.Float32BufferAttribute(rRank, 1));
	riverGeo.setIndex(rIdx);
	const riverMat = track(
		new THREE.ShaderMaterial({
			uniforms: {
				uTime: { value: 0 },
				uField: { value: fieldTex },
				uGround: { value: new THREE.Vector4(nw.x, nw.z, groundW, groundD) },
				uA: { value: new THREE.Color('#1c78d8') },
				uB: { value: new THREE.Color('#7fe7ff') }
			},
			vertexShader: /* glsl */ `
				attribute float aAlong;
				attribute float aSide;
				attribute float aRank;
				varying float vAlong;
				varying float vSide;
				varying float vRank;
				varying vec2 vFieldUv;
				uniform vec4 uGround;
				void main() {
					vAlong = aAlong;
					vSide = aSide;
					vRank = aRank;
					vFieldUv = vec2((position.x - uGround.x) / uGround.z, 1.0 - (position.z - uGround.y) / uGround.w);
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}`,
			fragmentShader: /* glsl */ `
				uniform float uTime;
				uniform sampler2D uField;
				uniform vec3 uA, uB;
				varying float vAlong;
				varying float vSide;
				varying float vRank;
				varying vec2 vFieldUv;
				void main() {
					float inside = texture2D(uField, vFieldUv).r;
					float speed = vRank < 1.5 ? 0.9 : 0.6;
					float f = fract(vAlong * (vRank < 1.5 ? 0.22 : 0.35) - uTime * speed * 0.35);
					float streak = smoothstep(0.0, 0.08, f) * smoothstep(0.42, 0.08, f);
					float edge = pow(1.0 - abs(vSide), 0.7);
					vec3 c = mix(uA, uB, 0.25 + streak * 0.75);
					float a = edge * mix(0.28, vRank < 1.5 ? 1.0 : 0.85, inside);
					gl_FragColor = vec4(c * (0.75 + 0.5 * inside), a);
				}`,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		})
	);
	const riverMesh = new THREE.Mesh(riverGeo, riverMat);
	scene.add(riverMesh);

	/* ---------------- sensors ---------------- */
	interface SensorNode {
		s: TbSensor;
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
	}
	const nodes = new Map<string, SensorNode>();
	const pickables: THREE.Object3D[] = [];

	const haloGeo = track(new THREE.CircleGeometry(1.6, 48));
	const ringGeo = track(new THREE.RingGeometry(0.55, 0.7, 48));
	const beamGeo = track(new THREE.CylinderGeometry(0.06, 0.06, 1, 10, 1, true));
	const headGeo = track(new THREE.SphereGeometry(0.3, 20, 14));
	const pickGeo = track(new THREE.CylinderGeometry(0.9, 0.9, 1, 8));
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
						float core = smoothstep(1.0, 0.0, d) * 0.22;
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

	function typeHeight(t: TbSensorType): number {
		switch (t) {
			case 'ARR':
				return 4.4;
			case 'CMD':
				return 3.8;
			case 'CCTV':
				return 2.6;
			default:
				return 3.1;
		}
	}

	for (const s of sensors) {
		const meta = TB_TYPE_META[s.type];
		const pos = project(s.lng, s.lat);
		const group = new THREE.Group();
		group.position.set(pos.x, 0, pos.z);
		scene.add(group);

		const haloMat = makeHaloMat(STATUS_HEX[s.status]);
		const halo = new THREE.Mesh(haloGeo, haloMat);
		halo.rotation.x = -Math.PI / 2;
		halo.position.y = 0.07;
		group.add(halo);

		const ringMat = track(
			new THREE.MeshBasicMaterial({ color: STATUS_HEX[s.status], transparent: true, opacity: 0.9, side: THREE.DoubleSide })
		);
		const ring = new THREE.Mesh(ringGeo, ringMat);
		ring.rotation.x = -Math.PI / 2;
		ring.position.y = 0.08;
		group.add(ring);

		let top = typeHeight(s.type);
		let fill: THREE.Mesh | undefined;
		let fillMat: THREE.MeshBasicMaterial | undefined;
		let spin: THREE.Object3D | undefined;
		const headMat = track(new THREE.MeshBasicMaterial({ color: meta.color }));

		if (s.type === 'AWLR') {
			const g = GAUGES[s.id];
			const tubeH = (g?.bank ?? 4.5) * LEVEL_SCALE;
			top = tubeH + 0.35;
			const tube = new THREE.Mesh(
				track(new THREE.CylinderGeometry(0.42, 0.42, tubeH, 20, 1, true)),
				track(
					new THREE.MeshBasicMaterial({
						color: '#8fc2ff',
						transparent: true,
						opacity: 0.12,
						side: THREE.DoubleSide,
						depthWrite: false
					})
				)
			);
			tube.position.y = tubeH / 2;
			group.add(tube);
			const cap = new THREE.Mesh(track(new THREE.TorusGeometry(0.42, 0.03, 6, 28)), headMat);
			cap.rotation.x = Math.PI / 2;
			cap.position.y = tubeH;
			group.add(cap);
			if (g) {
				for (const [lvl, hex] of [
					[g.siaga, '#FFB454'],
					[g.awas, '#FF7A66']
				] as const) {
					const t = new THREE.Mesh(
						track(new THREE.TorusGeometry(0.47, 0.035, 6, 28)),
						track(new THREE.MeshBasicMaterial({ color: hex }))
					);
					t.rotation.x = Math.PI / 2;
					t.position.y = lvl * LEVEL_SCALE;
					group.add(t);
				}
			}
			fillMat = track(new THREE.MeshBasicMaterial({ color: STATUS_HEX[s.status], transparent: true, opacity: 0.85 }));
			fill = new THREE.Mesh(track(new THREE.CylinderGeometry(0.34, 0.34, 1, 20)), fillMat);
			group.add(fill);
			const lvl = Number(s.value) || 0;
			fill.scale.y = Math.max(0.01, lvl * LEVEL_SCALE);
			fill.position.y = fill.scale.y / 2;
		} else if (s.type === 'CMD') {
			const tower = new THREE.Mesh(
				track(new THREE.CylinderGeometry(0.75, 1.0, top, 6, 1, false)),
				track(
					new THREE.ShaderMaterial({
						uniforms: { uColor: { value: new THREE.Color(meta.color) } },
						vertexShader: /* glsl */ `
							varying float vY;
							void main() { vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
						fragmentShader: /* glsl */ `
							uniform vec3 uColor;
							varying float vY;
							void main() {
								float bands = step(0.5, fract(vY * 2.2));
								gl_FragColor = vec4(uColor * (0.35 + 0.35 * bands), 0.9);
							}`,
						transparent: true
					})
				)
			);
			tower.position.y = top / 2;
			group.add(tower);
			const halo2 = new THREE.Mesh(track(new THREE.TorusGeometry(1.4, 0.05, 6, 48)), headMat);
			halo2.rotation.x = Math.PI / 2;
			halo2.position.y = top + 0.4;
			group.add(halo2);
			spin = halo2;
		} else {
			const beam = new THREE.Mesh(beamGeo, beamMat(meta.color));
			beam.scale.y = top;
			beam.position.y = top / 2;
			group.add(beam);
			let head: THREE.Mesh;
			if (s.type === 'WQ') head = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.42)), headMat);
			else if (s.type === 'SCADA') head = new THREE.Mesh(track(new THREE.BoxGeometry(0.62, 0.62, 0.62)), headMat);
			else head = new THREE.Mesh(headGeo, headMat);
			head.position.y = top;
			group.add(head);
			if (s.type === 'WQ' || s.type === 'SCADA') spin = head;
			if (s.type === 'CCTV') {
				const cone = new THREE.Mesh(
					track(new THREE.ConeGeometry(2.2, 5.5, 32, 1, true)),
					track(
						new THREE.MeshBasicMaterial({
							color: meta.color,
							transparent: true,
							opacity: 0.08,
							depthWrite: false,
							side: THREE.DoubleSide,
							blending: THREE.AdditiveBlending
						})
					)
				);
				// look down-river, towards the south-west bend near Menggala
				cone.position.set(-1.9, top - 1.2, 1.4);
				cone.rotation.set(0.9, 0, 0.75);
				group.add(cone);
			}
		}

		const pick = new THREE.Mesh(pickGeo, pickMat);
		pick.scale.y = top + 0.6;
		pick.position.y = (top + 0.6) / 2;
		pick.userData.id = s.id;
		group.add(pick);
		pickables.push(pick);

		const labelEl = document.createElement('div');
		labelEl.className = `twin-label twin-label--${s.status}`;
		labelEl.style.setProperty('--c', meta.color);
		const dot = document.createElement('span');
		dot.className = 'twin-label__dot';
		const idEl = document.createElement('b');
		idEl.textContent = s.id;
		const valueEl = document.createElement('span');
		valueEl.className = 'twin-label__v';
		valueEl.textContent = `${s.value}${s.unit ? ' ' + s.unit : ''}`;
		labelEl.append(dot, idEl, valueEl);
		labelEl.addEventListener('pointerdown', (e) => e.stopPropagation());
		labelEl.addEventListener('click', () => select(s.id, true));
		// CSS2DRenderer owns the anchor's transform; the pill inside is free to be nudged
		const anchor = document.createElement('div');
		anchor.className = 'twin-label-anchor';
		anchor.append(labelEl);
		const label = new CSS2DObject(anchor);
		label.center.set(0.5, 1.15);
		label.position.set(0, top + 0.5, 0);
		group.add(label);

		nodes.set(s.id, { s, pos, group, top, ring, ringMat, halo, haloMat, fill, fillMat, label, labelEl, valueEl, status: s.status, spin });
	}

	/* ---------------- telemetry links from the command centre ---------------- */
	const cmd = sensors.find((s) => s.type === 'CMD');
	interface Link {
		curve: THREE.QuadraticBezierCurve3;
		packet: THREE.Mesh;
		offset: number;
		speed: number;
	}
	const links: Link[] = [];
	const linkGroup = new THREE.Group();
	scene.add(linkGroup);
	let linkMat: THREE.ShaderMaterial | null = null;
	if (cmd) {
		const c = nodes.get(cmd.id)!;
		const from = new THREE.Vector3(c.pos.x, c.top + 0.4, c.pos.z);
		linkMat = track(
			new THREE.ShaderMaterial({
				uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#6aa0ff') } },
				vertexShader: /* glsl */ `
					attribute float aT;
					varying float vT;
					void main() { vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
				fragmentShader: /* glsl */ `
					uniform float uTime;
					uniform vec3 uColor;
					varying float vT;
					void main() {
						float dash = step(0.55, fract(vT * 26.0 - uTime * 1.4));
						gl_FragColor = vec4(uColor, 0.16 + 0.4 * dash);
					}`,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		// kept just under the bloom threshold so packets read as dots, not glowing orbs up close
		const packetGeo = track(new THREE.SphereGeometry(0.1, 10, 8));
		const packetMat = track(new THREE.MeshBasicMaterial({ color: '#8cc8ff' }));
		let k = 0;
		for (const n of nodes.values()) {
			if (n.s.id === cmd.id) continue;
			const to = new THREE.Vector3(n.pos.x, n.top, n.pos.z);
			const mid = from.clone().lerp(to, 0.5);
			mid.y += 2 + from.distanceTo(to) * 0.16;
			const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
			const pts = curve.getPoints(64);
			const g = track(new THREE.BufferGeometry().setFromPoints(pts));
			g.setAttribute('aT', new THREE.Float32BufferAttribute(pts.map((_, i) => i / 64), 1));
			linkGroup.add(new THREE.Line(g, linkMat));
			const packet = new THREE.Mesh(packetGeo, packetMat);
			linkGroup.add(packet);
			links.push({ curve, packet, offset: (k * 0.37) % 1, speed: 0.12 + (k % 3) * 0.03 });
			k++;
		}
	}

	/* ---------------- weather per rain gauge ---------------- */
	// Each ARR cell follows its gauge status: ok = cerah (no rain), warn = gerimis,
	// alarm = deras with dark cloud and lightning. Parameters ease toward the target
	// every frame, and fall/splash phases are integrated on the CPU so speed changes
	// never make the drops jump.
	interface WeatherTarget {
		density: number;
		speed: number;
		len: number;
		alpha: number;
		wind: number;
		cover: number;
		dark: number;
		splash: number;
	}
	const WEATHER: Record<SiteStatus, WeatherTarget> = {
		ok: { density: 0, speed: 10, len: 0.25, alpha: 0, wind: 0.08, cover: 0, dark: 0, splash: 0.8 },
		warn: { density: 0.22, speed: 11, len: 0.28, alpha: 0.42, wind: 0.1, cover: 0.55, dark: 0.25, splash: 0.9 },
		alarm: { density: 1, speed: 27, len: 0.9, alpha: 0.72, wind: 0.3, cover: 1, dark: 1, splash: 1.7 }
	};
	interface RainCell {
		id: string;
		center: XZ;
		radius: number;
		level: SiteStatus;
		cur: WeatherTarget;
		u: {
			uTime: { value: number };
			uFall: { value: number };
			uPhase: { value: number };
			uDensity: { value: number };
			uLen: { value: number };
			uAlpha: { value: number };
			uWind: { value: THREE.Vector3 };
			uCover: { value: number };
			uDark: { value: number };
			uFlash: { value: number };
		};
		bolt: THREE.Line;
		boltPos: THREE.BufferAttribute;
		boltMat: THREE.LineBasicMaterial;
		nextFlash: number;
		objects: THREE.Object3D[];
	}
	const rain: RainCell[] = [];
	// pixels per scene unit at distance 1, shared by the splash sprites (set on resize)
	const rainScale = { value: 1000 };
	// how flat ground ripples look from the current camera angle (1 = straight down)
	const splashSquash = { value: 0.6 };
	const RAIN_H = 8.5;
	for (const s of sensors.filter((x) => x.type === 'ARR')) {
		const p = project(s.lng, s.lat);
		const R = s.id === 'ARR-02' ? 12 : 9;
		const start = WEATHER[s.status];
		const u = {
			uTime: { value: 0 },
			uFall: { value: 0 },
			uPhase: { value: 0 },
			uDensity: { value: start.density },
			uLen: { value: start.len },
			uAlpha: { value: start.alpha },
			uWind: { value: new THREE.Vector3(start.wind, 0, start.wind * 0.55) },
			uCover: { value: start.cover },
			uDark: { value: start.dark },
			uFlash: { value: 0 }
		};

		// streaks: two vertices per drop sharing one seed; the tail trails up-wind
		const N = 3200;
		const pos = new Float32Array(N * 2 * 3);
		const end = new Float32Array(N * 2);
		const rnd = new Float32Array(N * 2);
		for (let i = 0; i < N; i++) {
			const a = Math.random() * Math.PI * 2;
			const r = Math.sqrt(Math.random()) * R;
			const x = p.x + Math.cos(a) * r;
			const y = Math.random() * RAIN_H;
			const z = p.z + Math.sin(a) * r;
			const k = Math.random();
			for (let v = 0; v < 2; v++) {
				const o = i * 2 + v;
				pos.set([x, y, z], o * 3);
				end[o] = v;
				rnd[o] = k;
			}
		}
		const g = track(new THREE.BufferGeometry());
		g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
		g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
		const mat = track(
			new THREE.ShaderMaterial({
				uniforms: { ...u, uColor: { value: new THREE.Color('#b4dcff') } },
				vertexShader: /* glsl */ `
					attribute float aEnd;
					attribute float aRnd;
					uniform float uFall, uDensity, uLen, uAlpha;
					uniform vec3 uWind;
					varying float vAlpha;
					const float H = ${RAIN_H.toFixed(1)};
					void main() {
						float y = mod(position.y - uFall * (0.8 + aRnd * 0.45), H);
						vec3 dir = normalize(vec3(uWind.x, -1.0, uWind.z));
						// wind pushes the drop sideways the further it has fallen
						vec3 head = vec3(position.x, y, position.z) + vec3(uWind.x, 0.0, uWind.z) * (H - y);
						vec3 q = head - dir * uLen * (0.7 + aRnd * 0.6) * aEnd;
						vAlpha = step(aRnd, uDensity) * (1.0 - aEnd) * uAlpha * smoothstep(0.0, 0.5, y) * smoothstep(H, H - 1.6, y);
						gl_Position = projectionMatrix * modelViewMatrix * vec4(q, 1.0);
					}`,
				fragmentShader: /* glsl */ `
					uniform vec3 uColor;
					varying float vAlpha;
					void main() {
						if (vAlpha < 0.01) discard;
						gl_FragColor = vec4(uColor, vAlpha);
					}`,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		const drops = new THREE.LineSegments(g, mat);
		drops.frustumCulled = false;
		scene.add(drops);

		// splashes: rings that open and fade where drops hit the ground (down-wind of the cell)
		const M = 900;
		const spos = new Float32Array(M * 3);
		const srnd = new Float32Array(M);
		for (let i = 0; i < M; i++) {
			const a = Math.random() * Math.PI * 2;
			const r = Math.sqrt(Math.random()) * R * 0.95;
			spos.set([p.x + Math.cos(a) * r, 0.06, p.z + Math.sin(a) * r], i * 3);
			srnd[i] = Math.random();
		}
		const sg = track(new THREE.BufferGeometry());
		sg.setAttribute('position', new THREE.BufferAttribute(spos, 3));
		sg.setAttribute('aRnd', new THREE.BufferAttribute(srnd, 1));
		const splashMat = track(
			new THREE.ShaderMaterial({
				uniforms: { ...u, uScale: rainScale, uSquash: splashSquash, uColor: { value: new THREE.Color('#9fd6ff') } },
				vertexShader: /* glsl */ `
					attribute float aRnd;
					uniform float uPhase, uDensity, uAlpha, uScale;
					uniform vec3 uWind;
					varying float vT;
					varying float vVis;
					void main() {
						vT = fract(uPhase * (0.8 + aRnd * 0.7) + aRnd * 13.0);
						vVis = step(aRnd, uDensity) * uAlpha;
						vec3 p = position + vec3(uWind.x, 0.0, uWind.z) * ${RAIN_H.toFixed(1)};
						vec4 mv = modelViewMatrix * vec4(p, 1.0);
						gl_PointSize = uScale * (0.05 + 0.3 * vT) / -mv.z;
						gl_Position = projectionMatrix * mv;
					}`,
				fragmentShader: /* glsl */ `
					uniform vec3 uColor;
					uniform float uSquash;
					varying float vT;
					varying float vVis;
					void main() {
						vec2 c = gl_PointCoord - 0.5;
						c.y /= max(uSquash, 0.2);
						float d = length(c) * 2.0;
						float ring = smoothstep(0.62, 0.86, d) * smoothstep(1.0, 0.86, d);
						float a = ring * (1.0 - vT) * vVis;
						if (a < 0.02) discard;
						gl_FragColor = vec4(uColor, a);
					}`,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		const splashes = new THREE.Points(sg, splashMat);
		scene.add(splashes);

		const cloudMat = track(
			new THREE.ShaderMaterial({
				uniforms: u,
				vertexShader: /* glsl */ `
					varying vec2 vUv;
					void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
				fragmentShader: /* glsl */ `
					uniform float uTime, uCover, uDark, uFlash;
					varying vec2 vUv;
					float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
					float noise(vec2 p) {
						vec2 i = floor(p), f = fract(p);
						vec2 u = f * f * (3.0 - 2.0 * f);
						return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
					}
					void main() {
						vec2 q = vUv * 5.0 + vec2(uTime * 0.04, uTime * 0.015);
						float n = noise(q) * 0.55 + noise(q * 2.1) * 0.3 + noise(q * 4.7) * 0.15;
						float d = length(vUv - 0.5) * 2.0;
						// thin broken cloud for gerimis, a solid dark deck for deras
						float shape = smoothstep(1.0, 0.25, d) * smoothstep(0.62 - 0.4 * uCover, 0.9 - 0.3 * uCover, n);
						float a = shape * uCover * (0.35 + 0.35 * uDark);
						vec3 light = mix(vec3(0.62, 0.7, 0.8), vec3(0.4, 0.47, 0.57), n);
						vec3 dark = mix(vec3(0.1, 0.12, 0.16), vec3(0.24, 0.28, 0.35), n);
						vec3 c = mix(light, dark, uDark) + vec3(0.75, 0.82, 1.0) * uFlash * (0.4 + 0.6 * n);
						gl_FragColor = vec4(c, min(1.0, a + uFlash * shape * 0.35));
					}`,
				transparent: true,
				depthWrite: false,
				side: THREE.DoubleSide
			})
		);
		const cloud = new THREE.Mesh(track(new THREE.CircleGeometry(R * 1.2, 48)), cloudMat);
		cloud.rotation.x = -Math.PI / 2;
		cloud.position.set(p.x, RAIN_H + 0.4, p.z);
		scene.add(cloud);

		// lightning bolt, redrawn on every strike
		const boltPos = new THREE.BufferAttribute(new Float32Array(12 * 3), 3);
		const boltGeo = track(new THREE.BufferGeometry());
		boltGeo.setAttribute('position', boltPos);
		const boltMat = track(
			new THREE.LineBasicMaterial({ color: '#e8f1ff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
		);
		const bolt = new THREE.Line(boltGeo, boltMat);
		bolt.frustumCulled = false;
		scene.add(bolt);

		rain.push({
			id: s.id,
			center: p,
			radius: R,
			level: s.status,
			cur: { ...start },
			u,
			bolt,
			boltPos,
			boltMat,
			nextFlash: 2 + Math.random() * 3,
			objects: [drops, splashes, cloud, bolt]
		});
	}

	function strike(r: RainCell) {
		const a = Math.random() * Math.PI * 2;
		const rr = Math.sqrt(Math.random()) * r.radius * 0.7;
		const gx = r.center.x + Math.cos(a) * rr;
		const gz = r.center.z + Math.sin(a) * rr;
		const n = r.boltPos.count;
		for (let i = 0; i < n; i++) {
			const k = i / (n - 1);
			const jitter = i === 0 || i === n - 1 ? 0 : (Math.random() - 0.5) * 1.1;
			r.boltPos.setXYZ(i, gx + jitter + (1 - k) * 0.6, RAIN_H * (1 - k), gz + (Math.random() - 0.5) * 0.6 * (1 - k));
		}
		r.boltPos.needsUpdate = true;
		r.u.uFlash.value = 1;
	}

	function stepWeather(t: number, dt: number) {
		const ease = 1 - Math.exp(-dt * 2.2);
		for (const r of rain) {
			const tgt = WEATHER[r.level];
			const c = r.cur;
			for (const k of Object.keys(tgt) as (keyof WeatherTarget)[]) c[k] += (tgt[k] - c[k]) * ease;
			r.u.uTime.value = t;
			r.u.uFall.value += dt * c.speed;
			r.u.uPhase.value += dt * c.splash;
			r.u.uDensity.value = c.density;
			r.u.uLen.value = c.len;
			r.u.uAlpha.value = c.alpha;
			r.u.uWind.value.set(c.wind, 0, c.wind * 0.55);
			r.u.uCover.value = c.cover;
			r.u.uDark.value = c.dark;
			if (r.level === 'alarm' && t > r.nextFlash) {
				strike(r);
				r.nextFlash = t + 2.5 + Math.random() * 5;
			}
			r.u.uFlash.value *= Math.exp(-dt * 7);
			// the bolt itself is visible only in the first instants of the flash
			r.boltMat.opacity = r.u.uFlash.value > 0.55 ? r.u.uFlash.value : 0;
		}
	}

	/* ---------------- label declutter ---------------- */
	// Greedy screen-space placement: important labels keep their spot, the rest
	// step up or down until they stop overlapping (CMD vs AWLR-01, the WQ/SCADA cluster).
	const LABEL_PRIO: Record<SiteStatus, number> = { alarm: 0, warn: 1, ok: 2 };
	const projV = new THREE.Vector3();
	let lastDeclutter = 0;
	function declutter() {
		const w = container.clientWidth;
		const h = container.clientHeight;
		const items = [...nodes.values()]
			.filter((n) => n.label.visible)
			.map((n) => {
				n.label.getWorldPosition(projV).project(camera);
				const bw = n.labelEl.offsetWidth || 90;
				const bh = n.labelEl.offsetHeight || 22;
				return {
					n,
					bw,
					bh,
					x: (projV.x * 0.5 + 0.5) * w - bw / 2,
					y: (-projV.y * 0.5 + 0.5) * h - bh * 1.15,
					behind: projV.z > 1,
					prio: n.s.id === selected ? -1 : LABEL_PRIO[n.status]
				};
			})
			.sort((a, b) => a.prio - b.prio || a.y - b.y);
		const placed: { x: number; y: number; w: number; h: number }[] = [];
		const hits = (r: { x: number; y: number; w: number; h: number }) =>
			placed.some((p) => r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y);
		for (const it of items) {
			if (it.behind) continue;
			let dy = 0;
			for (const k of [0, -1, 1, -2, 2, -3]) {
				const off = k * (it.bh + 4);
				const r = { x: it.x - 3, y: it.y + off - 2, w: it.bw + 6, h: it.bh + 4 };
				if (!hits(r)) {
					dy = off;
					placed.push(r);
					break;
				}
			}
			it.n.labelEl.style.setProperty('--dy', `${dy}px`);
			it.n.labelEl.classList.toggle('is-shifted', dy !== 0);
		}
	}

	/* ---------------- selection + picking ---------------- */
	let selected: string | null = null;
	let fly: { t0: number; dur: number; p0: THREE.Vector3; p1: THREE.Vector3; t0v: THREE.Vector3; t1v: THREE.Vector3 } | null = null;

	function flyTo(pos: THREE.Vector3, target: THREE.Vector3, dur = 1.3) {
		fly = { t0: clock.elapsedTime, dur, p0: camera.position.clone(), p1: pos, t0v: controls.target.clone(), t1v: target };
	}

	function select(id: string, doFly = false) {
		const n = nodes.get(id);
		if (!n) return;
		if (selected && selected !== id) nodes.get(selected)?.labelEl.classList.remove('is-selected');
		selected = id;
		n.labelEl.classList.add('is-selected');
		if (doFly) {
			const tgt = new THREE.Vector3(n.pos.x, 1.2, n.pos.z);
			const dir = camera.position.clone().sub(controls.target).normalize();
			if (dir.y < 0.45) dir.y = 0.45;
			dir.normalize();
			flyTo(tgt.clone().add(dir.multiplyScalar(26)), tgt);
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

	/* ---------------- sizing + loop ---------------- */
	function resize() {
		const w = Math.max(1, container.clientWidth);
		const h = Math.max(1, container.clientHeight);
		renderer.setSize(w, h, false);
		composer.setSize(w, h);
		labelRenderer.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		rainScale.value = (h * renderer.getPixelRatio()) / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
		if (!userMoved && !fly) {
			const dir = camera.position.clone().sub(controls.target).normalize();
			camera.position.copy(controls.target).add(dir.multiplyScalar(fitDistance()));
		}
	}
	const ro = new ResizeObserver(resize);
	ro.observe(container);
	resize();

	const clock = new THREE.Clock();
	let raf = 0;
	let lastImgUpload = 0;
	let lastFrameT = 0;
	let lastPatchCheck = 0;
	let lastPatchUpload = 0;
	const tmp = new THREE.Vector3();
	function frame() {
		raf = requestAnimationFrame(frame);
		const t = clock.getElapsedTime();
		groundMat.uniforms.uTime.value = t;
		curtainMat.uniforms.uTime.value = t;
		riverMat.uniforms.uTime.value = t;
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
		const camD = camera.position.distanceTo(controls.target) || 1;
		splashSquash.value = Math.max(0.2, (camera.position.y - controls.target.y) / camD);
		for (const n of nodes.values()) {
			n.haloMat.uniforms.uTime.value = t + n.pos.x * 0.07;
			const sel = n.s.id === selected;
			const pulse = 1 + 0.08 * Math.sin(t * 3 + n.pos.z);
			n.ring.scale.setScalar(sel ? 1.55 * pulse : pulse);
			n.ringMat.opacity = n.status === 'alarm' ? 0.55 + 0.45 * Math.abs(Math.sin(t * 4)) : 0.9;
			if (n.spin) n.spin.rotation.y = t * 0.8;
		}
		for (const l of links) {
			const k = (l.offset + t * l.speed) % 1;
			l.curve.getPointAt(k, tmp);
			l.packet.position.copy(tmp);
		}
		stepWeather(t, Math.min(0.1, t - lastFrameT));
		lastFrameT = t;
		if (linkMat) linkMat.uniforms.uTime.value = t;
		if (fly) {
			const k = Math.min(1, (t - fly.t0) / fly.dur);
			const e = easeInOut(k);
			camera.position.lerpVectors(fly.p0, fly.p1, e);
			controls.target.lerpVectors(fly.t0v, fly.t1v, e);
			if (k >= 1) fly = null;
		}
		controls.update();
		// keep the orbit target over the regency
		controls.target.x = THREE.MathUtils.clamp(controls.target.x, -55, 55);
		controls.target.z = THREE.MathUtils.clamp(controls.target.z, -45, 45);
		if (opts.compass) opts.compass.style.transform = `rotate(${THREE.MathUtils.radToDeg(controls.getAzimuthalAngle())}deg)`;
		composer.render();
		labelRenderer.render(scene, camera);
		if (t - lastDeclutter > 0.15) {
			declutter();
			lastDeclutter = t;
		}
	}
	frame();

	/* ---------------- API ---------------- */
	const zoneFlood = new THREE.Vector4();
	return {
		setZoneFlood(f) {
			zoneFlood.set(f[0] ?? 0, f[1] ?? 0, f[2] ?? 0, f[3] ?? 0);
			groundMat.uniforms.uZoneFlood.value.copy(zoneFlood);
		},
		setWeather(id, level) {
			const r = rain.find((x) => x.id === id);
			if (r) r.level = level;
		},
		setSensor(id, st) {
			const n = nodes.get(id);
			if (!n) return;
			n.valueEl.textContent = st.value;
			if (st.status !== n.status) {
				n.labelEl.classList.remove(`twin-label--${n.status}`);
				n.labelEl.classList.add(`twin-label--${st.status}`);
				n.status = st.status;
				n.ringMat.color.set(STATUS_HEX[st.status]);
				(n.haloMat.uniforms.uColor.value as THREE.Color).set(STATUS_HEX[st.status]);
				n.haloMat.uniforms.uAlarm.value = st.status === 'alarm' ? 1 : 0;
				n.fillMat?.color.set(STATUS_HEX[st.status]);
			}
			if (n.fill && st.level != null) {
				n.fill.scale.y = Math.max(0.01, st.level * LEVEL_SCALE);
				n.fill.position.y = n.fill.scale.y / 2;
			}
		},
		setLayers(l) {
			if (l.imagery != null) groundMat.uniforms.uImagery.value = l.imagery ? 1 : 0;
			if (l.rivers != null) riverMesh.visible = l.rivers;
			if (l.flood != null) groundMat.uniforms.uFloodOn.value = l.flood ? 1 : 0;
			if (l.links != null) linkGroup.visible = l.links;
			if (l.rain != null) for (const r of rain) for (const o of r.objects) o.visible = l.rain;
			if (l.labels != null) for (const n of nodes.values()) n.label.visible = l.labels;
		},
		select,
		resetView() {
			flyTo(homePos(), HOME_TGT.clone(), 1.4);
		},
		setAutoRotate(on) {
			controls.autoRotate = on;
		},
		floodArea(f) {
			const perZone = [0, 0, 0, 0];
			let total = 0;
			for (let i = 0; i < FW * FH; i++) {
				if (inside[i] < 0.5) continue;
				let best = 0;
				let bestK = -1;
				for (let k = 0; k < 4; k++) {
					const r = zoneW[i * 4 + k] * (f[k] ?? 0);
					if (r > best) {
						best = r;
						bestK = k;
					}
				}
				if (best < 0.05 || dist[i] > best * FLOOD_WIDTH) continue;
				total += cellArea;
				perZone[bestK] += cellArea;
			}
			return { total, perZone };
		},
		setImageryStyle(style) {
			groundUniforms.uNatural.value = style === 'natural' ? 1 : 0;
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
