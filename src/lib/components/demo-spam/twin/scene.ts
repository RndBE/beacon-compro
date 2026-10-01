// Three.js scene for the SPAM Regional Wosusokas digital twin (Mojolaban + Plesungan).
// Same approach as the PDAM Tirtamarta twin, 1 scene unit = 1 km. The pipe network is
// indicative (schematic topology routed along OSM streets); what moves on it is live:
// every pipe glows and streams while the meters downstream of it register flow.

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
import { FLOW_EPS, LOGGERS, RESERVOIRS, type ReservoirId } from '../wosusokas';

export type TwinStatus = 'ok' | 'warn' | 'alarm';

export interface TwinLayers {
	imagery: boolean;
	pipes: boolean;
	flow: boolean;
	labels: boolean;
}

/** what one logger (or a reservoir's supply) reports now */
export interface NodeReading {
	flow: number | null;
	st: TwinStatus;
	value: string;
}

/** series pair on its inlet → outlet main: 0 fine, 1 outlet silent while the inlet flows, 2 loss between the meters */
export type PairAlert = 0 | 1 | 2;

interface PipeFeature {
	geometry: { type: string; coordinates: [number, number][] };
	properties: { id: string; kategori: 'utama' | 'distribusi'; reservoir: ReservoirId; meter: string[]; panjang_m: number };
}

export interface PipeNetwork {
	features: PipeFeature[];
	reservoir: Record<string, { lng: number; lat: number; perkiraan?: boolean }>;
}

export interface TwinOptions {
	container: HTMLElement;
	pipes: PipeNetwork;
	/** XYZ imagery url builder; tiles must allow CORS */
	tileUrl: (z: number, x: number, y: number) => string;
	tileZoom?: number;
	compass?: HTMLElement | null;
	onSelect?: (id: string) => void;
	onImagery?: (loaded: number, total: number) => void;
}

export interface TwinApi {
	/** readings per logger id and per reservoir id (RES-PLS, RES-MJL); alerts per pair outlet id */
	setReadings(r: Record<string, NodeReading>, alerts: Record<string, PairAlert>): void;
	setLayers(l: Partial<TwinLayers>): void;
	setImageryStyle(style: 'natural' | 'night'): void;
	select(id: string | null, fly?: boolean): void;
	resetView(): void;
	setAutoRotate(on: boolean): void;
	dispose(): void;
}

const STATUS_HEX: Record<TwinStatus, string> = { ok: '#46D78F', warn: '#FFB454', alarm: '#FF7A66' };
const ROLE_HEX = { in: '#A08BFF', out: '#3CC3F2' } as const;
/** direction from the orbit target to the camera at home: from the south-west, so the
 * Plesungan (north-west) and Mojolaban (south-east) clusters sit side by side on screen */
const HOME_DIR = new THREE.Vector3(-0.52, 0.62, 0.58).normalize();
/** camera distance at which nodes and pipe widths are drawn 1:1 */
const REF_DIST = 13;

const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

export function createSpamTwin(opts: TwinOptions): TwinApi {
	const { container, pipes } = opts;

	/* ---------------- extent: every pipe and reservoir ---------------- */
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
	for (const f of pipes.features) f.geometry.coordinates.forEach(grow);
	for (const r of Object.values(pipes.reservoir)) grow([r.lng, r.lat]);
	const lon0 = (west + east) / 2;
	const lat0 = (south + north) / 2;
	const project = makeProjector(lon0, lat0);
	const unproject = makeUnprojector(lon0, lat0);
	// home framing: the content's extent across the screen (right) and into it (away, foreshortened)
	const right = new THREE.Vector3(HOME_DIR.z, 0, -HOME_DIR.x).normalize();
	const away = new THREE.Vector3(-HOME_DIR.x, 0, -HOME_DIR.z).normalize();
	const content = [
		...pipes.features.flatMap((f) => f.geometry.coordinates.map(([x, y]) => project(x, y))),
		...Object.values(pipes.reservoir).map((r) => project(r.lng, r.lat))
	];
	const spread = (v: THREE.Vector3) => content.map((p) => p.x * v.x + p.z * v.z);
	const [r0, r1] = [Math.min(...spread(right)), Math.max(...spread(right))];
	const [a0, a1] = [Math.min(...spread(away)), Math.max(...spread(away))];
	const halfX = (r1 - r0) / 2 + 0.3;
	// seen from the camera's elevation, depth on the ground shrinks by sin(elevation); the near side looms larger
	const halfZ = ((a1 - a0) / 2 + 0.3) * HOME_DIR.y * 1.25;
	const HOME_TGT = right
		.clone()
		.multiplyScalar((r0 + r1) / 2)
		.add(away.clone().multiplyScalar((a0 + a1) / 2));

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
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.copy(HOME_TGT);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.minDistance = 0.35;
	controls.maxDistance = 40;
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
		const half = THREE.MathUtils.degToRad(camera.fov / 2);
		const hfovHalf = Math.atan(Math.tan(half) * camera.aspect);
		return THREE.MathUtils.clamp(Math.max(halfX / Math.tan(hfovHalf), halfZ / Math.tan(half)), 5, 30);
	}
	const homePos = () => HOME_TGT.clone().add(HOME_DIR.clone().multiplyScalar(fitDistance()));
	camera.position.copy(homePos());

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

	const margin = 0.012;
	const zoom = opts.tileZoom ?? 14;
	const tr = tileRange(west - margin, south - margin, east + margin, north + margin, zoom);
	const nw = project(tr.west, tr.north);
	const se = project(tr.east, tr.south);
	const groundW = se.x - nw.x;
	const groundD = se.z - nw.z;

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
	// the two reservoir areas first, then outwards
	const order: [number, number][] = [];
	for (let ty = tr.y0; ty <= tr.y1; ty++) for (let tx = tr.x0; tx <= tr.x1; tx++) order.push([tx, ty]);
	const hot = Object.values(pipes.reservoir).map((r) => [tileX(r.lng, zoom), tileY(r.lat, zoom)]);
	const heat = ([x, y]: [number, number]) => Math.min(...hot.map(([hx, hy]) => Math.hypot(x + 0.5 - hx, y + 0.5 - hy)));
	order.sort((a, b) => heat(a) - heat(b));
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

	/* ---------------- served-area mask: a soft glow around the network ---------------- */
	const FW = 720;
	const FH = Math.round((FW * groundD) / groundW);
	const toPx = (lon: number, lat: number): [number, number] => [
		((mercX(lon) - mercX(tr.west)) / (mercX(tr.east) - mercX(tr.west))) * FW,
		((mercY(tr.north) - mercY(lat)) / (mercY(tr.north) - mercY(tr.south))) * FH
	];
	const maskCanvas = document.createElement('canvas');
	maskCanvas.width = FW;
	maskCanvas.height = FH;
	const mctx = maskCanvas.getContext('2d')!;
	mctx.filter = 'blur(9px)';
	mctx.strokeStyle = 'rgba(255,255,255,0.55)';
	mctx.lineCap = mctx.lineJoin = 'round';
	for (const f of pipes.features) {
		mctx.lineWidth = f.properties.kategori === 'utama' ? 12 : 22;
		mctx.beginPath();
		f.geometry.coordinates.forEach(([x, y], k) => {
			const [px, py] = toPx(x, y);
			if (k) mctx.lineTo(px, py);
			else mctx.moveTo(px, py);
		});
		mctx.stroke();
	}
	const maskTex = track(new THREE.CanvasTexture(maskCanvas));

	const groundUniforms = {
		uMap: { value: imgTex as THREE.Texture },
		uHasMap: { value: 0 },
		uImagery: { value: 1 },
		uNatural: { value: 1 },
		uIsPatch: { value: 0 },
		uFade: { value: 1 },
		uGround: { value: new THREE.Vector4(nw.x, nw.z, groundW, groundD) },
		uMask: { value: maskTex },
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
		uniform sampler2D uMap, uMask;
		uniform float uHasMap, uImagery, uNatural, uIsPatch, uFade;
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
			float inside = clamp(texture2D(uMask, fuv).a * 1.6, 0.0, 1.0);
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
			vec3 night = tint * (0.5 + 0.65 * inside);

			vec3 nat = mix(vec3(dot(img, LUMA)), img, 0.9) * vec3(0.92, 1.0, 1.08) * 1.2;
			nat = mix(uDeep + uMid * fallback * 0.6, nat, has);
			vec3 natural = nat * (0.5 + 0.5 * inside);

			vec3 col = mix(night, natural, uNatural);
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
	const groundMat = track(new THREE.ShaderMaterial({ uniforms: groundUniforms, vertexShader: groundVert, fragmentShader: groundFrag }));
	const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(groundW, groundD, 1, 1)), groundMat);
	ground.rotation.x = -Math.PI / 2;
	ground.position.set((nw.x + se.x) / 2, 0, (nw.z + se.z) / 2);
	scene.add(ground);

	/* ---------------- sharper imagery around the orbit target (detail patch) ---------------- */
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
			pctx.drawImage(copy, (patchAt.x - (PATCH_N >> 1) - x0) * 256, (patchAt.y - (PATCH_N >> 1) - y0) * 256);
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
		const fade = 1 - THREE.MathUtils.smoothstep(d, 2.6, 5.5);
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

	/* ---------------- pipes as flowing ribbons, one flow group per set of downstream meters ---------------- */
	// A pipe carries what its first meters downstream register, so pipes sharing that set
	// share one group: its glow, streaming speed and alert are uniforms updated per reading.
	const groupKey = (f: PipeFeature) => `${f.properties.kategori}:${f.properties.meter.join(',')}`;
	const groups: { meters: string[]; main: boolean }[] = [];
	const groupIndex = new Map<string, number>();
	for (const f of pipes.features) {
		const k = groupKey(f);
		if (!groupIndex.has(k)) {
			groupIndex.set(k, groups.length);
			groups.push({ meters: f.properties.meter, main: f.properties.kategori === 'utama' });
		}
	}
	const G = groups.length;
	const pPos: number[] = [];
	const pNorm: number[] = [];
	const pSide: number[] = [];
	const pAlong: number[] = [];
	const pWidth: number[] = [];
	const pKind: number[] = [];
	const pGroup: number[] = [];
	const pIdx: number[] = [];
	let base = 0;
	for (const f of pipes.features) {
		const pts = f.geometry.coordinates.map(([x, y]) => project(x, y));
		if (pts.length < 2) continue;
		const kind = f.properties.kategori === 'utama' ? 1 : 0;
		const width = kind ? 4.2 : 1.9;
		const g = groupIndex.get(groupKey(f))!;
		let along = 0;
		for (let i = 0; i < pts.length; i++) {
			const q = pts[i];
			const a = pts[Math.max(0, i - 1)];
			const b = pts[Math.min(pts.length - 1, i + 1)];
			let tx = b.x - a.x;
			let tz = b.z - a.z;
			const tl = Math.hypot(tx, tz) || 1;
			tx /= tl;
			tz /= tl;
			if (i > 0) along += Math.hypot(q.x - pts[i - 1].x, q.z - pts[i - 1].z);
			for (const side of [-1, 1]) {
				pPos.push(q.x, 0, q.z);
				pNorm.push(-tz, tx);
				pSide.push(side);
				pAlong.push(along);
				pWidth.push(width);
				pKind.push(kind);
				pGroup.push(g);
			}
			if (i < pts.length - 1) {
				const k = base + i * 2;
				pIdx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
			}
		}
		base += pts.length * 2;
	}
	const pipeGeo = track(new THREE.BufferGeometry());
	pipeGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
	pipeGeo.setAttribute('aNormal', new THREE.Float32BufferAttribute(pNorm, 2));
	pipeGeo.setAttribute('aSide', new THREE.Float32BufferAttribute(pSide, 1));
	pipeGeo.setAttribute('aAlong', new THREE.Float32BufferAttribute(pAlong, 1));
	pipeGeo.setAttribute('aWidth', new THREE.Float32BufferAttribute(pWidth, 1));
	pipeGeo.setAttribute('aKind', new THREE.Float32BufferAttribute(pKind, 1));
	pipeGeo.setAttribute('aGroup', new THREE.Float32BufferAttribute(pGroup, 1));
	pipeGeo.setIndex(pIdx);
	const pipeUniforms = {
		uTime: { value: 0 },
		/** km per screen pixel per km of view depth (set on resize) */
		uPxPerDepth: { value: 0.001 },
		uFlowOn: { value: 1 },
		/** 0 = idle, up to 1 = full flow */
		uOn: { value: new Array(G).fill(0) },
		uPhase: { value: new Array(G).fill(0) },
		uAlert: { value: new Array(G).fill(0) }
	};
	const pipeVert = /* glsl */ `
		attribute vec2 aNormal;
		attribute float aSide, aAlong, aWidth, aKind, aGroup;
		uniform float uPxPerDepth, uGrow;
		uniform float uOn[${G}];
		uniform float uPhase[${G}];
		uniform float uAlert[${G}];
		varying float vSide, vAlong, vKind, vOn, vPhase, vAlert;
		void main() {
			int gi = int(aGroup + 0.5);
			vOn = uOn[gi];
			vPhase = uPhase[gi];
			vAlert = uAlert[gi];
			vec3 p = position;
			float w = (aWidth + step(0.5, vAlert) * 1.4) * uGrow;
			// constant pixel width at any distance, so far pipes never thin out into shimmering sub-pixel lines
			float depth = max(-(modelViewMatrix * vec4(position, 1.0)).z, 0.01);
			p.xz += aNormal * aSide * w * 0.5 * uPxPerDepth * depth;
			p.y = 0.006 + aKind * 0.004;
			vSide = aSide;
			vAlong = aAlong;
			vKind = aKind;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
		}`;
	// dark casing underneath keeps the glow legible over bright imagery
	const casingMat = track(
		new THREE.ShaderMaterial({
			uniforms: { ...pipeUniforms, uGrow: { value: 2.3 } },
			vertexShader: pipeVert,
			fragmentShader: /* glsl */ `
				varying float vSide, vAlong, vKind, vOn, vPhase, vAlert;
				void main() {
					float edge = 1.0 - pow(abs(vSide), 2.5);
					gl_FragColor = vec4(0.01, 0.035, 0.09, edge * (0.5 + 0.12 * vKind));
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
				uniform float uTime, uFlowOn;
				varying float vSide, vAlong, vKind, vOn, vPhase, vAlert;
				void main() {
					float wet = step(0.001, vOn);
					vec3 cat = vKind > 0.5 ? vec3(0.44, 0.88, 1.0) : vec3(0.23, 0.55, 1.0);
					vec3 col = mix(vec3(0.42, 0.5, 0.66), cat, wet);
					float ph = vAlong * 4.0;
					float f = fract(ph - vPhase);
					float streak = smoothstep(0.0, 0.1, f) * smoothstep(0.55, 0.1, f);
					// a streak only a few pixels long would twinkle under the bloom: fade it to its average
					streak = mix(streak, 0.26, smoothstep(0.06, 0.25, fwidth(ph))) * uFlowOn * wet;
					float edge = pow(max(1.0 - abs(vSide), 0.0), 0.55);
					float pulse = 0.5 + 0.5 * sin(uTime * 3.2);
					float silent = step(0.5, vAlert) * step(vAlert, 1.5);
					float loss = step(1.5, vAlert);
					col = mix(col, vec3(1.0, 0.7, 0.33), silent * (0.7 + 0.3 * sin(uTime * 1.8)));
					col = mix(col, vec3(1.0, 0.36, 0.3), loss * (0.72 + 0.28 * pulse));
					float alert = silent + loss;
					float a = edge * (0.46 + 0.2 * vOn + 0.5 * streak * vOn + 0.35 * alert);
					gl_FragColor = vec4(col * (0.7 + 0.3 * vOn + 0.9 * streak * vOn + 0.5 * alert), a);
				}`,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		})
	);
	const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
	pipeMesh.renderOrder = 2;
	scene.add(pipeMesh);
	/** streaming speed per group, from its flow */
	const speed = new Array(G).fill(0);

	/* ---------------- nodes: reservoirs and loggers ---------------- */
	interface Node {
		id: string;
		pos: XZ;
		group: THREE.Group;
		ring: THREE.Mesh;
		ringMat: THREE.MeshBasicMaterial;
		haloMat: THREE.ShaderMaterial;
		label: CSS2DObject;
		labelEl: HTMLDivElement;
		valueEl: HTMLSpanElement;
		status: TwinStatus;
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

	function addLabel(group: THREE.Group, top: number, cls: string, color: string, id: string, name: string) {
		const labelEl = document.createElement('div');
		labelEl.className = `twin-label ${cls}`;
		labelEl.style.setProperty('--c', color);
		const dot = document.createElement('span');
		dot.className = 'twin-label__dot';
		const idEl = document.createElement('b');
		idEl.textContent = name;
		const valueEl = document.createElement('span');
		valueEl.className = 'twin-label__v';
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

	function addNode(id: string, lng: number, lat: number, top: number, prio: number, build: (g: THREE.Group) => void, label: [string, string, string]) {
		const pos = project(lng, lat);
		const group = new THREE.Group();
		group.position.set(pos.x, 0, pos.z);
		scene.add(group);
		nodeGroups.push(group);
		const haloMat = makeHaloMat(STATUS_HEX.warn);
		const halo = new THREE.Mesh(haloGeo, haloMat);
		halo.rotation.x = -Math.PI / 2;
		halo.position.y = 0.008;
		group.add(halo);
		const ringMat = track(new THREE.MeshBasicMaterial({ color: STATUS_HEX.warn, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
		const ring = new THREE.Mesh(ringGeo, ringMat);
		ring.rotation.x = -Math.PI / 2;
		ring.position.y = 0.009;
		group.add(ring);
		build(group);
		const pick = new THREE.Mesh(pickGeo, pickMat);
		pick.scale.y = top + 0.06;
		pick.position.y = (top + 0.06) / 2;
		pick.userData.id = id;
		group.add(pick);
		pickables.push(pick);
		const { label: l, labelEl, valueEl } = addLabel(group, top, `twin-label--warn ${label[0]}`, label[1], id, label[2]);
		nodes.set(id, { id, pos, group, ring, ringMat, haloMat, label: l, labelEl, valueEl, status: 'warn', prio });
	}

	for (const [id, r] of Object.entries(pipes.reservoir)) {
		const res = RESERVOIRS[id.replace('RES-', '') as ReservoirId];
		const H = 0.3;
		addNode(
			id,
			r.lng,
			r.lat,
			H + 0.03,
			0,
			(g) => {
				// reservoir: glass tank on a glowing base (its level is not measured here)
				const tank = new THREE.Mesh(
					track(new THREE.CylinderGeometry(0.085, 0.085, H, 28, 1, true)),
					track(new THREE.MeshBasicMaterial({ color: '#8ff0e0', transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }))
				);
				tank.position.y = H / 2;
				g.add(tank);
				const capMat = track(new THREE.MeshBasicMaterial({ color: res.color }));
				for (const y of [0.02, H]) {
					const cap = new THREE.Mesh(track(new THREE.TorusGeometry(0.085, 0.006, 6, 32)), capMat);
					cap.rotation.x = Math.PI / 2;
					cap.position.y = y;
					g.add(cap);
				}
				const core = new THREE.Mesh(
					track(new THREE.CylinderGeometry(0.07, 0.07, H * 0.62, 24)),
					track(new THREE.MeshBasicMaterial({ color: res.color, transparent: true, opacity: 0.5 }))
				);
				core.position.y = H * 0.31;
				g.add(core);
			},
			['spam-twin-res', res.color, res.short.toUpperCase()]
		);
	}

	const TOP = 0.3;
	for (const l of LOGGERS) {
		const hex = ROLE_HEX[l.role];
		addNode(
			l.id,
			l.lng,
			l.lat,
			TOP,
			2,
			(g) => {
				const beam = new THREE.Mesh(beamGeo, beamMat(hex));
				beam.scale.y = TOP;
				beam.position.y = TOP / 2;
				g.add(beam);
				// meter chamber: a flat disc under the head
				const pit = new THREE.Mesh(track(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 16)), track(new THREE.MeshBasicMaterial({ color: hex })));
				pit.position.y = 0.012;
				g.add(pit);
				const head = new THREE.Mesh(headGeo, track(new THREE.MeshBasicMaterial({ color: hex })));
				head.position.y = TOP;
				g.add(head);
			},
			['', hex, l.id]
		);
	}

	/* ---------------- label declutter ---------------- */
	// Greedy screen-space placement in a stable order (priority, then id). Each label first
	// tries the offset it had last time, and may only switch between shown and hidden once
	// it has kept its state for a moment, so labels do not blink while the camera orbits.
	const LABEL_PRIO: Record<TwinStatus, number> = { alarm: 0, warn: 1, ok: 2 };
	const OFFSETS = [0, -1, 1, -2, 2, -3];
	const HOLD = 0.9;
	const labelState = new Map<string, { k: number | null; t: number }>();
	const projV = new THREE.Vector3();
	let lastDeclutter = 0;
	function declutter(now: number) {
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
					prio: n.id === selected ? -2 : n.prio + LABEL_PRIO[n.status] * (n.prio ? 1 : 0)
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
			const tries = prev && prev.k !== null ? [prev.k, ...OFFSETS.filter((k) => k !== prev.k)] : OFFSETS;
			let k: number | null = null;
			for (const kk of tries) {
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
			it.n.labelEl.classList.toggle('is-hidden', k === null);
			it.n.labelEl.style.setProperty('--dy', `${dy}px`);
			it.n.labelEl.classList.toggle('is-shifted', dy !== 0);
		}
	}

	/* ---------------- selection + picking ---------------- */
	let selected: string | null = null;
	let fly: { t0: number; dur: number; p0: THREE.Vector3; p1: THREE.Vector3; t0v: THREE.Vector3; t1v: THREE.Vector3 } | null = null;
	const clock = new THREE.Clock();

	function flyTo(pos: THREE.Vector3, target: THREE.Vector3, dur = 1.3, home = false) {
		fly = { t0: clock.elapsedTime, dur, p0: camera.position.clone(), p1: pos, t0v: controls.target.clone(), t1v: target };
		// once flown to a point, a later resize must not snap the camera back home
		userMoved = !home;
	}
	function select(id: string | null, doFly = false) {
		if (selected && selected !== id) nodes.get(selected)?.labelEl.classList.remove('is-selected');
		const node = id ? nodes.get(id) : undefined;
		selected = node ? id : null;
		if (!node) return;
		node.labelEl.classList.add('is-selected');
		if (doFly) {
			const tgt = new THREE.Vector3(node.pos.x, 0.1, node.pos.z);
			const dir = camera.position.clone().sub(controls.target).normalize();
			if (dir.y < 0.5) dir.y = 0.5;
			dir.normalize();
			flyTo(tgt.clone().add(dir.multiplyScalar(2.6)), tgt);
		}
		opts.onSelect?.(node.id);
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

	/* ---------------- readings pushed in from the page ---------------- */
	function setReadings(r: Record<string, NodeReading>, alerts: Record<string, PairAlert>) {
		for (const n of nodes.values()) {
			const x = r[n.id];
			if (!x) continue;
			n.valueEl.textContent = x.value;
			if (x.st !== n.status) {
				n.labelEl.classList.replace(`twin-label--${n.status}`, `twin-label--${x.st}`);
				n.status = x.st;
				n.ringMat.color.set(STATUS_HEX[x.st]);
				(n.haloMat.uniforms.uColor.value as THREE.Color).set(STATUS_HEX[x.st]);
				n.haloMat.uniforms.uAlarm.value = x.st === 'alarm' ? 1 : 0;
			}
		}
		const on = pipeUniforms.uOn.value as number[];
		const alert = pipeUniforms.uAlert.value as number[];
		groups.forEach((g, i) => {
			const q = g.meters.reduce((a, id) => a + Math.max(0, r[id]?.flow ?? 0), 0);
			on[i] = q > FLOW_EPS ? 0.45 + 0.55 * Math.min(1, Math.log1p(q) / Math.log1p(60)) : 0;
			speed[i] = q > FLOW_EPS ? 0.35 + 0.9 * Math.min(1, q / 40) : 0;
			// the inlet → outlet main of a series pair is the only main whose meters are just that outlet
			alert[i] = g.main && g.meters.length === 1 ? (alerts[g.meters[0]] ?? 0) : 0;
		});
	}

	/* ---------------- sizing + loop ---------------- */
	function resize() {
		const w = Math.max(1, container.clientWidth);
		const h = Math.max(1, container.clientHeight);
		renderer.setSize(w, h, false);
		composer.setSize(w, h);
		labelRenderer.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		pipeUniforms.uPxPerDepth.value = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / h;
		if (!userMoved && !fly) camera.position.copy(homePos());
		// setSize clears the canvas and ResizeObserver fires after rAF, so without this one black frame shows
		composer.render();
		labelRenderer.render(scene, camera);
	}
	const ro = new ResizeObserver(resize);
	ro.observe(container);
	resize();

	let raf = 0;
	let lastImgUpload = 0;
	let lastPatchCheck = 0;
	let lastPatchUpload = 0;
	let lastT = 0;
	let far = false;
	const phase = pipeUniforms.uPhase.value as number[];
	function frame() {
		raf = requestAnimationFrame(frame);
		const t = clock.getElapsedTime();
		const dt = Math.min(0.1, t - lastT);
		lastT = t;
		for (let i = 0; i < G; i++) phase[i] = (phase[i] + dt * speed[i] * 0.55) % 1;
		pipeMat.uniforms.uTime.value = t;
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
		// nodes keep a readable size at any zoom
		const camD = camera.position.distanceTo(controls.target) || 1;
		const k = THREE.MathUtils.clamp(camD / REF_DIST, 0.07, 1.6);
		// from far away, normal loggers show only their id (with hysteresis so it never toggles back and forth)
		const wantFar = far ? camD > 8.2 : camD > 9.6;
		if (wantFar !== far) {
			far = wantFar;
			container.classList.toggle('is-far', far);
		}
		// near plane follows the zoom: keeps depth precision for pipes a few metres above the ground
		const near = Math.max(0.01, camD * 0.02);
		if (Math.abs(camera.near - near) > near * 0.2) {
			camera.near = near;
			camera.updateProjectionMatrix();
		}
		for (const g of nodeGroups) g.scale.setScalar(k);
		for (const n of nodes.values()) {
			n.haloMat.uniforms.uTime.value = t + n.pos.x * 0.7;
			const pulse = 1 + 0.08 * Math.sin(t * 3 + n.pos.z * 3);
			n.ring.scale.setScalar(n.id === selected ? 1.6 * pulse : pulse);
			n.ringMat.opacity = n.status === 'alarm' ? 0.55 + 0.45 * Math.abs(Math.sin(t * 4)) : 0.9;
		}
		if (fly) {
			const kk = Math.min(1, (t - fly.t0) / fly.dur);
			const e = easeInOut(kk);
			camera.position.lerpVectors(fly.p0, fly.p1, e);
			controls.target.lerpVectors(fly.t0v, fly.t1v, e);
			if (kk >= 1) fly = null;
		}
		controls.update();
		controls.target.x = THREE.MathUtils.clamp(controls.target.x, nw.x + 0.5, se.x - 0.5);
		controls.target.z = THREE.MathUtils.clamp(controls.target.z, nw.z + 0.5, se.z - 0.5);
		if (opts.compass) opts.compass.style.transform = `rotate(${THREE.MathUtils.radToDeg(controls.getAzimuthalAngle())}deg)`;
		composer.render();
		labelRenderer.render(scene, camera);
		if (t - lastDeclutter > 0.2) {
			declutter(t);
			lastDeclutter = t;
		}
	}
	frame();

	/* ---------------- API ---------------- */
	let layers: TwinLayers = { imagery: true, pipes: true, flow: true, labels: true };
	return {
		setReadings,
		setLayers(l) {
			layers = { ...layers, ...l };
			groundUniforms.uImagery.value = layers.imagery ? 1 : 0;
			pipeMesh.visible = casingMesh.visible = layers.pipes;
			pipeUniforms.uFlowOn.value = layers.flow ? 1 : 0;
			for (const n of nodes.values()) n.label.visible = layers.labels;
		},
		setImageryStyle(style) {
			groundUniforms.uNatural.value = style === 'natural' ? 1 : 0;
		},
		select,
		resetView() {
			flyTo(homePos(), HOME_TGT.clone(), 1.4, true);
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

/** total main-pipe length of a network, km */
export const mainKm = (p: PipeNetwork) =>
	p.features.filter((f) => f.properties.kategori === 'utama').reduce((a, f) => a + f.properties.panjang_m, 0) / 1000;
