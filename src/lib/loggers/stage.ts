/**
 * Exploded-view logger stage.
 *
 * Owns the WebGL canvas and the animation timeline; knows nothing about the
 * surrounding markup. The Svelte layer drives it through `select()` and reads
 * back timeline state through the callbacks in `LoggerStageOptions`.
 *
 * Geometry lives in the `*-parts.js` siblings — each exports `buildAssembly(THREE)`
 * returning `{ root, parts, setPower }` with every part posed as-assembled inside
 * its own wrapper group. Exploding is purely this module's job.
 */

type Vec3 = [number, number, number];
type OffsetMap = Record<string, Vec3>;

export type Choreography = 'vertikal' | 'radial';
export type CameraMode = 'sinematik' | 'orbit' | 'heroik' | 'teknis';
export type LightMood = 'hangat' | 'dingin' | 'dramatis';
export type StageStatus = 'loading' | 'ready' | 'error';

export interface LoggerStageOptions {
	/** Element the canvas is appended into. Must be positioned and sized by CSS. */
	host: HTMLElement;
	durationMs?: number;
	autoCycle?: boolean;
	choreography?: Choreography;
	camera?: CameraMode;
	light?: LightMood;
	/** Timeline position 0..1, throttled — drives the tab progress bar. */
	onProgress?: (u: number) => void;
	/** Fired when the timeline wraps and auto-advances to the next model. */
	onCycle?: (index: number) => void;
	onStatus?: (status: StageStatus, label: string) => void;
}

interface ModelMeta {
	id: string;
	label: string;
	load: () => Promise<{ buildAssembly: (three: unknown) => any }>;
	dBase: number;
	dSpan: number;
	EXP: OffsetMap;
	RADIAL: OffsetMap;
	SEQ: string[];
	SPIN: Record<string, number>;
}

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (t: number) => {
	const c = clamp(t, 0, 1);
	return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};
const smooth = (t: number) => {
	const c = clamp(t, 0, 1);
	return c * c * (3 - 2 * c);
};

export const LOGGER_MODELS: ModelMeta[] = [
	{
		id: 'bl-2000',
		label: 'BL-2000',
		load: () => import('./bl2000-parts.js'),
		// BL-2000's physical footprint is ~2x the other units' — the ported dBase
		// (0.315) sat the camera close enough that its assembled (unexploded)
		// frame dwarfed the rest; pulled back to match their on-screen scale.
		dBase: 0.52,
		dSpan: 0.355,
		EXP: {
			base: [0, -0.062, 0], standoff_lo: [0, -0.036, 0], board_lo: [0, -0.014, 0],
			screw_lo: [0, 0.01, 0], standoff_mid: [0, 0.02, 0], board_up: [0, 0.032, 0],
			screw_up: [0, 0.055, 0], display: [0, 0.072, 0], term_sig: [0, 0.092, 0],
			term_field: [0, 0.024, 0.078], cover: [0, 0.12, 0],
			screw_cover: [0, -0.095, 0], antenna: [-0.052, 0.012, 0]
		},
		RADIAL: {
			base: [0, -0.048, 0], standoff_lo: [-0.055, -0.02, 0.045], board_lo: [-0.095, 0.01, -0.02],
			screw_lo: [0, 0.015, 0], standoff_mid: [0.07, 0.02, 0.04], board_up: [0.095, 0.035, 0.02],
			screw_up: [0, 0.058, 0], display: [-0.07, 0.065, -0.055], term_sig: [0.04, 0.078, -0.07],
			term_field: [-0.02, 0.03, 0.095], cover: [0, 0.105, 0.015],
			screw_cover: [0, -0.075, 0], antenna: [-0.085, 0.02, -0.03]
		},
		SEQ: ['cover', 'term_field', 'antenna', 'term_sig', 'display', 'screw_up',
			'board_up', 'standoff_mid', 'screw_lo', 'board_lo', 'standoff_lo', 'screw_cover', 'base'],
		SPIN: { screw_lo: Math.PI * 3, screw_up: Math.PI * 3, screw_cover: -Math.PI * 3, antenna: Math.PI * 2 }
	},
	{
		id: 'bl-1100',
		label: 'BL-1100',
		load: () => import('./bl1100-parts.js'),
		dBase: 0.35,
		dSpan: 0.29,
		EXP: {
			plate: [0, -0.042, 0], screw_cover: [0, -0.064, 0], board_lo: [0, 0.003, 0],
			screw_lo: [0, 0.02, 0], io_front: [0, 0, 0.056], io_left: [-0.052, 0, 0],
			io_right: [0.052, 0, 0], risers: [0, 0.022, 0], lcd: [0, 0.033, 0],
			iface: [0, 0.046, 0], lid: [0, 0.062, 0], sma: [0.046, 0, 0]
		},
		RADIAL: {
			plate: [0, -0.034, 0], screw_cover: [0, -0.054, 0], board_lo: [-0.03, 0.006, -0.012],
			screw_lo: [0, 0.02, 0], io_front: [0, 0, 0.062], io_left: [-0.058, 0, 0],
			io_right: [0.058, 0, 0], risers: [0.036, 0.022, 0.016], lcd: [-0.04, 0.034, -0.02],
			iface: [0.03, 0.046, -0.026], lid: [0, 0.058, 0.012], sma: [0.052, 0, 0]
		},
		SEQ: ['io_front', 'io_left', 'io_right', 'sma', 'lid', 'iface', 'lcd',
			'risers', 'screw_lo', 'board_lo', 'screw_cover', 'plate'],
		SPIN: { screw_lo: Math.PI * 3, screw_cover: -Math.PI * 3, sma: Math.PI * 2 }
	},
	{
		id: 'bl-110',
		label: 'BL-110',
		load: () => import('./bl110-parts.js'),
		dBase: 0.32,
		dSpan: 0.27,
		EXP: {
			plate: [0, -0.042, 0], screw_cover: [0, -0.064, 0], board_lo: [0, 0.003, 0],
			screw_lo: [0, 0.02, 0], io_front: [0, 0, 0.052], io_left: [-0.052, 0, 0],
			risers: [0, 0.022, 0], lcd: [0, 0.033, 0], iface: [0, 0.046, 0],
			lid: [0, 0.062, 0], sma: [0.046, 0, 0]
		},
		RADIAL: {
			plate: [0, -0.034, 0], screw_cover: [0, -0.054, 0], board_lo: [-0.03, 0.006, -0.012],
			screw_lo: [0, 0.02, 0], io_front: [0, 0, 0.058], io_left: [-0.058, 0, 0],
			risers: [0.036, 0.022, 0.016], lcd: [-0.04, 0.034, -0.02], iface: [0.03, 0.046, -0.026],
			lid: [0, 0.058, 0.012], sma: [0.052, 0, 0]
		},
		SEQ: ['io_front', 'io_left', 'sma', 'lid', 'iface', 'lcd', 'risers',
			'screw_lo', 'board_lo', 'screw_cover', 'plate'],
		SPIN: { screw_lo: Math.PI * 3, screw_cover: -Math.PI * 3, sma: Math.PI * 2 }
	},
	{
		id: 'bl-11',
		label: 'BL-11',
		load: () => import('./bl11-parts.js'),
		dBase: 0.26,
		dSpan: 0.24,
		EXP: {
			plate: [0, -0.042, 0], board_lo: [0, 0.003, 0], screw_lo: [0, 0.02, 0],
			lte: [0, 0.042, 0], iface: [0, 0.06, 0], risers: [0, 0.027, 0],
			lcd: [0, 0.035, 0], lid: [0, 0.086, 0],
			io_front: [0, 0, 0.05], io_left: [-0.05, 0, 0], sma: [0.046, 0, 0]
		},
		RADIAL: {
			plate: [0, -0.036, 0], board_lo: [-0.024, 0.005, -0.01], screw_lo: [0, 0.02, 0],
			lte: [0.036, 0.042, -0.012], iface: [0, 0.06, 0.018], risers: [0.03, 0.027, -0.014],
			lcd: [-0.038, 0.035, 0.012], lid: [0, 0.08, 0.012],
			io_front: [0, 0, 0.056], io_left: [-0.056, 0, 0], sma: [0.052, 0, 0]
		},
		SEQ: ['io_front', 'io_left', 'sma', 'lid', 'iface', 'lte', 'lcd',
			'risers', 'screw_lo', 'board_lo', 'plate'],
		SPIN: { screw_lo: Math.PI * 3, sma: Math.PI * 2 }
	}
];

// ---- cinematic camera spline -------------------------------------------
const WIND = 2 * TAU;
const PATH = [
	{ th: 0.0, ph: 1.28, d: 1.12, ty: 0.012, fov: 31, roll: 0 },
	{ th: 1.02, ph: 1.18, d: 1.08, ty: 0.015, fov: 31, roll: 0.005 },
	{ th: 2.1, ph: 1.0, d: 1.1, ty: 0.02, fov: 32, roll: 0.008 },
	{ th: 3.16, ph: 0.8, d: 1.05, ty: 0.025, fov: 35, roll: 0.005 },
	{ th: 4.2, ph: 0.56, d: 1.1, ty: 0.028, fov: 38, roll: 0 },
	{ th: 5.24, ph: 0.34, d: 1.12, ty: 0.024, fov: 37, roll: -0.005 },
	{ th: 6.3, ph: 0.22, d: 1.12, ty: 0.016, fov: 34, roll: -0.008 },
	{ th: 7.35, ph: 0.34, d: 1.1, ty: 0.014, fov: 31, roll: -0.006 },
	{ th: 8.4, ph: 0.7, d: 1.14, ty: 0.026, fov: 28, roll: -0.002 },
	{ th: 9.44, ph: 1.1, d: 1.18, ty: 0.032, fov: 27, roll: 0.002 },
	{ th: 10.48, ph: 1.32, d: 1.12, ty: 0.03, fov: 28, roll: 0.006 },
	{ th: 11.52, ph: 1.16, d: 1.1, ty: 0.018, fov: 30, roll: 0.003 }
];
const NK = PATH.length;
const CAM_KEYS = ['th', 'ph', 'd', 'ty', 'fov', 'roll'] as const;
type CamFrame = Record<(typeof CAM_KEYS)[number], number>;

function keyAt(i: number, out: CamFrame): CamFrame {
	let j = i;
	let w = 0;
	while (j < 0) { j += NK; w -= WIND; }
	while (j >= NK) { j -= NK; w += WIND; }
	const k = PATH[j];
	out.th = k.th + w;
	out.ph = k.ph;
	out.d = k.d;
	out.ty = k.ty;
	out.fov = k.fov;
	out.roll = k.roll;
	return out;
}

const _k = [{}, {}, {}, {}] as CamFrame[];
const _cam = {} as CamFrame;

function camPath(u: number): CamFrame {
	const s = u * NK;
	const i = Math.floor(s);
	const t = s - i;
	keyAt(i - 1, _k[0]); keyAt(i, _k[1]); keyAt(i + 1, _k[2]); keyAt(i + 2, _k[3]);
	const t2 = t * t;
	const t3 = t2 * t;
	for (const p of CAM_KEYS) {
		const a = _k[0][p], b = _k[1][p], c = _k[2][p], d = _k[3][p];
		_cam[p] = 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
	}
	return _cam;
}

// ---- timeline envelopes ------------------------------------------------
// The explode/reassemble choreography below was originally paced to fill the
// whole loop (finishing at u=0.985, a hair from the wrap). It's now scaled by
// K so it finishes at ASSEMBLY_END instead — the same relative pacing, just
// compressed — leaving a genuine idle tail where the logger sits fully
// assembled and lit for the camera's post-assembly settle (see tick()).
const ASSEMBLY_END = 0.6795;
const K = ASSEMBLY_END / 0.985;

function globalE(u: number) {
	if (u < 0.22 * K) return 0;
	if (u < 0.46 * K) return ease((u - 0.22 * K) / (0.24 * K));
	if (u < 0.72 * K) return 1;
	if (u < ASSEMBLY_END) return 1 - ease((u - 0.72 * K) / (0.265 * K));
	return 0;
}
function partE(i: number, n: number, u: number) {
	if (u < 0.22 * K) return 0;
	if (u < 0.46 * K) return ease((u - (0.22 * K + (i / n) * 0.1 * K)) / (0.14 * K));
	if (u < 0.72 * K) return 1;
	if (u < ASSEMBLY_END) return 1 - ease((u - (0.72 * K + ((n - 1 - i) / n) * 0.115 * K)) / (0.15 * K));
	return 0;
}
function power(u: number) {
	if (u < 0.205 * K) return 1;
	if (u < 0.265 * K) return 1 - smooth((u - 0.205 * K) / (0.06 * K));
	if (u < 0.972 * K) return 0;
	if (u < 0.995 * K) return smooth((u - 0.972 * K) / (0.023 * K));
	return 1;
}
function flashAt(u: number) {
	const g = (c: number) => Math.exp(-Math.pow(c / (0.011 * K), 2));
	return g(u - 0.992 * K) + g(u + 1 - 0.992 * K);
}

/** Timeline position the reduced-motion still frame is pinned to. */
const STILL_U = 0.58 * K;

// Fog is world-space, but the camera's orbit radius is not: it scales with
// fitScale, which fit() derives from the viewport. These two numbers were tuned
// against FIT_REF (the fitScale a 1020x660 host produces), so fit() rescales
// them by fitScale/FIT_REF to keep the same amount of haze at every size. Left
// fixed, a phone's ~4.8 fitScale parks the whole model past the far plane and it
// renders as flat fog colour — which is also the section background.
const FIT_REF = 1.78;
const FOG_NEAR = 0.85;
const FOG_FAR = 2.1;

// 1.78/k grows without bound as the host narrows, because k is driven by the
// 1020-wide reference and phones are far narrower than that in portrait. Past
// this cap the logger is under ~200px tall in a ~1000px canvas — small enough to
// read as uncentred drift rather than a subject.
const FIT_MAX = 3.4;

interface PartTarget {
	id: string;
	group: any;
	off: Vec3;
	seqI: number;
	spin: number;
	axis: string;
}

interface CamPose {
	th: number;
	ph: number;
	d: number;
	ty: number;
	fov: number;
	roll: number;
}

interface CacheEntry {
	assembly: any;
	targets: PartTarget[];
	n: number;
}

export class LoggerStage {
	private opts: Required<Pick<LoggerStageOptions, 'durationMs' | 'autoCycle' | 'choreography' | 'camera' | 'light'>> &
		LoggerStageOptions;
	private host: HTMLElement;
	private alive = true;
	private ready = false;
	private paused = true;
	private pausedAt = 0;
	private reduceMotion = false;

	private three: any = null;
	private renderer: any = null;
	private scene: any = null;
	private camera: any = null;
	private keyL: any = null;
	private rimL: any = null;
	private fillL: any = null;
	private canvas: HTMLCanvasElement | null = null;
	private ro: ResizeObserver | null = null;
	private raf = 0;
	private cleanupInput: (() => void) | null = null;

	private cache: Record<number, CacheEntry> = {};
	private assembly: any = null;
	private targets: PartTarget[] | null = null;
	private nPart = 12;
	private loading: number | null = null;
	private transition: { outRoot: any; inRoot: any; t0: number; dur: number } | null = null;

	private active = 0;
	private L = 21000;
	private t0 = 0;
	private lastU: number | null = null;
	private entryT = 0;
	private lastPose: CamPose | null = null;
	private enterFrom: CamPose | null = null;

	private expMap: OffsetMap = LOGGER_MODELS[0].EXP;
	private spanMax = 1;
	private dExtra = 0;
	private dBase = 0.315;
	private dSpanK = 0.355;
	private cine = true;
	private camBase = { ph0: 0.955, dph: 0.075, ty0: 0.021, dk: 1.0, fov: 38 };

	private span = 0;
	private fov = 32;
	private fitScale = 1;
	private hBias = 0.03;
	private vBias = 0.045;
	private uTh = 0;
	private uPh = 0;
	private zoomK = 1;
	private lastUser = 0;
	private dragging = false;

	private right: any = null;
	private up: any = null;
	private look: any = null;

	private emittedU = -1;

	constructor(options: LoggerStageOptions) {
		this.opts = {
			durationMs: 21000,
			autoCycle: true,
			choreography: 'vertikal',
			camera: 'sinematik',
			light: 'hangat',
			...options
		};
		this.host = options.host;
		this.L = this.opts.durationMs;
		this.reduceMotion =
			typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	get activeIndex() {
		return this.active;
	}

	async boot() {
		this.opts.onStatus?.('loading', LOGGER_MODELS[this.active].label);
		let THREE: any;
		try {
			THREE = await import('three');
		} catch (err) {
			console.error('[logger-stage] three.js failed to load', err);
			this.opts.onStatus?.('error', '');
			return;
		}
		if (!this.alive) return;
		this.three = THREE;

		let renderer: any;
		try {
			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		} catch (err) {
			console.error('[logger-stage] WebGL unavailable', err);
			this.opts.onStatus?.('error', '');
			return;
		}
		renderer.setClearColor(0x000000, 0);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFShadowMap;
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.12;
		renderer.shadowMap.autoUpdate = false;
		this.renderer = renderer;

		const canvas = renderer.domElement as HTMLCanvasElement;
		canvas.style.display = 'block';
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.style.opacity = '0';
		canvas.style.transition = 'opacity 520ms cubic-bezier(0.2,0.8,0.2,1)';
		this.host.appendChild(canvas);
		this.canvas = canvas;

		const scene = new THREE.Scene();
		// range is a starting value only — fit() rescales it per viewport, see
		// FOG_NEAR/FOG_FAR
		scene.fog = new THREE.Fog(0x07080b, FOG_NEAR, FOG_FAR);
		this.scene = scene;

		// near was tuned for the old, farther-back dBase values; now that the
		// camera sits much closer for some models, 0.02 wastes most of the depth
		// buffer's precision on empty space in front of the object, and the
		// case-top decals (a hair above the case surface) start z-fighting —
		// tightening near narrows the far/near ratio and gives that precision
		// back to the range the camera actually orbits in
		const camera = new THREE.PerspectiveCamera(32, 1, 0.08, 6);
		this.camera = camera;
		this.fov = 32;

		scene.add(new THREE.HemisphereLight(0xfff6ec, 0x14141a, 1.05));
		const kL = new THREE.DirectionalLight(0xfff4e6, 2.5);
		kL.position.set(0.4, 0.75, 0.35);
		kL.castShadow = true;
		const shadowRes = this.isCompact() ? 512 : 768;
		kL.shadow.mapSize.set(shadowRes, shadowRes);
		kL.shadow.bias = 0;
		kL.shadow.normalBias = 0.0035;
		const sc = kL.shadow.camera;
		sc.left = -0.45; sc.right = 0.45; sc.top = 0.45; sc.bottom = -0.45; sc.near = 0.05; sc.far = 3;
		sc.updateProjectionMatrix();
		scene.add(kL);

		const rim = new THREE.DirectionalLight(0xffe6cf, 1.1);
		rim.position.set(-0.5, 0.4, -0.55);
		scene.add(rim);
		const fill = new THREE.DirectionalLight(0xffe4c4, 0.5);
		fill.position.set(0.55, 0.12, -0.25);
		scene.add(fill);
		this.keyL = kL; this.rimL = rim; this.fillL = fill;

		const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.34 }));
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = -0.112;
		ground.receiveShadow = true;
		scene.add(ground);

		this.t0 = performance.now() - 0.06 * this.L;
		this.ready = true;

		this.fit();
		this.ro = new ResizeObserver(() => this.fit());
		this.ro.observe(this.host);

		this.cleanupInput = this.wireInput(canvas);
		this.right = new THREE.Vector3();
		this.up = new THREE.Vector3();
		this.look = new THREE.Vector3();

		await this.showModel(this.active, true);
		if (!this.alive) return;

		let last = performance.now();
		let shadowTick = 0;
		const loop = () => {
			if (!this.alive) return;
			this.raf = requestAnimationFrame(loop);
			if (this.paused) return;
			const now = performance.now();
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			if (!this.targets) return;
			this.tick(dt, now);
			renderer.shadowMap.needsUpdate = shadowTick++ % (this.isCompact() ? 6 : 4) === 0;
			renderer.render(scene, camera);
		};
		this.raf = requestAnimationFrame(loop);
	}

	/** Pause the whole loop while the section is off-screen; the timeline freezes. */
	setPaused(paused: boolean) {
		// reduced motion never runs the loop — it holds a single still frame and
		// only re-renders when the visitor drags the model themselves
		if (this.reduceMotion) {
			this.paused = true;
			return;
		}
		if (paused === this.paused) return;
		const now = performance.now();
		if (paused) {
			this.pausedAt = now;
		} else if (this.pausedAt) {
			this.t0 += now - this.pausedAt;
			this.pausedAt = 0;
		}
		this.paused = paused;
	}

	setDuration(ms: number) {
		const next = ms || 21000;
		if (next === this.L) return;
		if (this.ready) {
			const now = performance.now();
			const u = ((now - this.t0) / this.L) % 1;
			this.t0 = now - u * next;
		}
		this.L = next;
		this.opts.durationMs = next;
	}

	setAutoCycle(on: boolean) {
		this.opts.autoCycle = on;
	}

	select(index: number) {
		if (index === this.active || index < 0 || index >= LOGGER_MODELS.length) return;
		this.active = index;
		this.lastU = null;
		if (this.ready) void this.showModel(index, true);
	}

	destroy() {
		this.alive = false;
		if (this.raf) cancelAnimationFrame(this.raf);
		this.ro?.disconnect();
		this.cleanupInput?.();
		for (const k of Object.keys(this.cache)) this.disposeEntry(Number(k));
		if (this.renderer) {
			this.renderer.dispose();
			this.canvas?.remove();
		}
		this.renderer = null;
		this.scene = null;
	}

	// ---- internals ------------------------------------------------------

	private isCompact() {
		return (this.host.clientWidth || 0) < 720;
	}

	private fit() {
		const renderer = this.renderer;
		const camera = this.camera;
		if (!renderer || !camera) return;
		const w = this.host.clientWidth || 1;
		const h = this.host.clientHeight || 1;
		// the model now fills more of the frame (camera pulled in per-model), so the
		// case-top text decals get magnified more too — a low pixel-ratio cap that
		// was fine when the model was smaller now reads as visibly soft/aliased text
		const cap = w < 640 ? 1.75 : w > 1400 ? 2 : 1.85;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		const k = Math.min(w / 1020, h / 660);
		this.fitScale = clamp(FIT_REF / k, 1.24, FIT_MAX);
		// the orbit radius rides on fitScale, so the haze range has to ride with it
		// or narrow viewports fall entirely outside it
		const fog = this.scene?.fog;
		if (fog) {
			const fogK = this.fitScale / FIT_REF;
			fog.near = FOG_NEAR * fogK;
			fog.far = FOG_FAR * fogK;
		}
		// wide viewports get the model pushed right of the copy column; narrow ones
		// leave it dead centre. The lift narrow screens used to get was scaled by
		// (1 - 0.85 * H) down in tick(), so it shrank as the model exploded and
		// grew back as it reassembled — on a phone that swung the model 228px up
		// and down the canvas over one loop, which reads as drift, not framing.
		const room = clamp((w - 560) / 700, 0, 1);
		this.hBias = 0.16 * room;
		this.vBias = w < 720 ? 0 : 0.045 + 0.02 * room;
		if (this.paused && this.targets) this.renderStill();
	}

	private renderStill() {
		if (!this.renderer || !this.targets) return;
		const now = performance.now();
		this.tick(0, now);
		this.renderer.shadowMap.needsUpdate = true;
		this.renderer.render(this.scene, this.camera);
	}

	private fadeIn() {
		if (!this.canvas) return;
		this.canvas.style.transition = 'opacity 560ms ease';
		this.canvas.style.opacity = '1';
	}

	private syncModes() {
		const M = LOGGER_MODELS[this.active];
		const radial = this.opts.choreography === 'radial';
		this.expMap = radial ? M.RADIAL : M.EXP;
		if (this.targets) for (const tg of this.targets) tg.off = this.expMap[tg.id] || [0, 0, 0];
		this.dExtra = radial ? 0.05 : 0;
		const ys = Object.values(this.expMap).map((o) => o[1]);
		this.spanMax = Math.max(...ys) - Math.min(...ys);
		this.dBase = M.dBase;
		this.dSpanK = M.dSpan;

		const cam = this.opts.camera;
		this.cine = cam === 'sinematik';
		this.camBase =
			cam === 'heroik'
				? { ph0: 1.16, dph: 0.05, ty0: 0.03, dk: 1.06, fov: 34 }
				: cam === 'teknis'
					? { ph0: 0.54, dph: 0.06, ty0: 0.016, dk: 1.0, fov: 36 }
					: { ph0: 0.955, dph: 0.075, ty0: 0.021, dk: 1.0, fov: 38 };

		if (!this.keyL) return;
		const mood = this.opts.light;
		const P =
			mood === 'dingin'
				? { k: [0xe3ecf7, 2.2], r: [0x86bcff, 1.9], f: [0xa8c0d8, 0.35] }
				: mood === 'dramatis'
					? { k: [0xffe2c8, 1.7], r: [0xff4a52, 2.3], f: [0xff9a6a, 0.22] }
					: { k: [0xfff4e6, 2.5], r: [0xffe6cf, 1.1], f: [0xffe4c4, 0.5] };
		this.keyL.color.setHex(P.k[0]); this.keyL.intensity = P.k[1];
		this.rimL.color.setHex(P.r[0]); this.rimL.intensity = P.r[1];
		this.fillL.color.setHex(P.f[0]); this.fillL.intensity = P.f[1];
	}

	private async loadModel(i: number) {
		const hit = this.cache[i];
		if (hit) return hit;
		const M = LOGGER_MODELS[i];
		const mod = await M.load();
		const assembly = mod.buildAssembly(this.three);
		assembly.root.visible = false;
		this.scene.add(assembly.root);
		const targets: PartTarget[] = assembly.parts.map((p: any) => ({
			id: p.id,
			group: p.group,
			off: M.EXP[p.id] || [0, 0, 0],
			seqI: Math.max(0, M.SEQ.indexOf(p.id)),
			spin: M.SPIN[p.id] || 0,
			axis: p.axis
		}));
		this.cache[i] = { assembly, targets, n: M.SEQ.length };
		return this.cache[i];
	}

	private async showModel(i: number, restart: boolean) {
		const firstLoad = this.assembly == null;
		if (!this.cache[i]) this.opts.onStatus?.('loading', LOGGER_MODELS[i].label);
		this.loading = i;
		let entry: CacheEntry;
		try {
			entry = await this.loadModel(i);
		} catch (err) {
			console.error('[logger-stage] assembly failed to load', err);
			this.loading = null;
			if (this.active === i) this.opts.onStatus?.('error', LOGGER_MODELS[i].label);
			return;
		}
		this.loading = null;
		// a newer selection took over while this one was loading: let that call own
		// the stage, but never leave a stale loading label behind
		if (!this.alive || this.active !== i) {
			if (this.loading == null && this.active !== i) this.opts.onStatus?.('ready', '');
			return;
		}

		// no fade-through-transparent: the outgoing model stays fully on screen
		// (and, if it was already loaded, fully animated) right up until this
		// point, then morphs — shrinking away as the incoming one grows in from
		// nothing, both visible at once — so the swap never dips through blank
		const outgoing = firstLoad ? null : this.assembly;
		const newRoot = entry.assembly.root;
		for (const k of Object.keys(this.cache)) {
			const root = this.cache[Number(k)].assembly.root;
			if (root !== newRoot && root !== outgoing?.root) root.visible = false;
		}
		newRoot.visible = true;
		if (outgoing && outgoing.root !== newRoot) {
			newRoot.scale.setScalar(0.001);
			this.transition = { outRoot: outgoing.root, inRoot: newRoot, t0: performance.now(), dur: 550 };
		} else {
			newRoot.scale.setScalar(1);
		}

		this.assembly = entry.assembly;
		this.targets = entry.targets;
		this.nPart = entry.n;
		this.syncModes();
		if (restart || !this.t0) {
			this.t0 = performance.now() - 0.055 * this.L;
			this.lastU = null;
		}
		this.uTh = 0; this.uPh = 0; this.zoomK = 1;
		// ease the incoming camera in from wherever the outgoing model's camera
		// last sat, instead of snapping straight to this model's own spline
		// position — a pose jump was what made model switches read as a hard
		// reload rather than one continuous shot
		this.enterFrom = this.lastPose;
		this.entryT = performance.now();
		this.opts.onStatus?.('ready', '');
		if (firstLoad) this.fadeIn();
		if (this.paused) this.renderStill();
	}

	private disposeEntry(k: number) {
		const entry = this.cache[k];
		if (!entry) return;
		this.scene?.remove(entry.assembly.root);
		entry.assembly.root.traverse((o: any) => {
			if (o.geometry) o.geometry.dispose();
			const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
			for (const m of mats) {
				for (const p of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'alphaMap', 'aoMap']) {
					if (m[p] && m[p].dispose) m[p].dispose();
				}
				m.dispose();
			}
		});
		delete this.cache[k];
	}

	private wireInput(canvas: HTMLCanvasElement) {
		let drag: { x: number; y: number; touch: boolean } | null = null;
		const touched = () => {
			this.lastUser = performance.now();
		};
		const onDown = (e: PointerEvent) => {
			canvas.setPointerCapture(e.pointerId);
			drag = { x: e.clientX, y: e.clientY, touch: e.pointerType !== 'mouse' };
			this.dragging = true;
			this.host.style.cursor = 'grabbing';
			touched();
		};
		const onMove = (e: PointerEvent) => {
			if (!drag) return;
			if (e.buttons === 0 && e.pointerType === 'mouse') {
				drag = null;
				this.dragging = false;
				this.host.style.cursor = 'grab';
				return;
			}
			const dx = e.clientX - drag.x;
			const dy = e.clientY - drag.y;
			drag.x = e.clientX;
			drag.y = e.clientY;
			this.uTh -= dx * 0.0056;
			// touch keeps vertical gestures for page scroll — orbit stays horizontal
			if (!drag.touch) this.uPh = clamp(this.uPh - dy * 0.005, -0.8, 0.5);
			touched();
			if (this.paused) this.renderStill();
		};
		const onEnd = () => {
			drag = null;
			this.dragging = false;
			this.host.style.cursor = 'grab';
		};
		const onCtx = (e: Event) => e.preventDefault();
		// the canvas covers the whole section, so a plain wheel must stay with the
		// page — only a pinch gesture (which arrives as ctrl+wheel) zooms the model
		const onWheel = (e: WheelEvent) => {
			if (!e.ctrlKey) return;
			e.preventDefault();
			this.zoomK = clamp(this.zoomK * Math.exp(e.deltaY * 0.001), 0.5, 2.4);
			touched();
			if (this.paused) this.renderStill();
		};
		canvas.addEventListener('pointerdown', onDown);
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerup', onEnd);
		canvas.addEventListener('pointercancel', onEnd);
		canvas.addEventListener('contextmenu', onCtx);
		canvas.addEventListener('wheel', onWheel, { passive: false });
		return () => {
			canvas.removeEventListener('pointerdown', onDown);
			canvas.removeEventListener('pointermove', onMove);
			canvas.removeEventListener('pointerup', onEnd);
			canvas.removeEventListener('pointercancel', onEnd);
			canvas.removeEventListener('contextmenu', onCtx);
			canvas.removeEventListener('wheel', onWheel);
		};
	}

	private tick(dt: number, now: number) {
		if (!this.targets || !this.assembly) return;

		if (this.transition) {
			const { outRoot, inRoot, t0, dur } = this.transition;
			const p = clamp((now - t0) / dur, 0, 1);
			const e = ease(p);
			inRoot.scale.setScalar(0.001 + 0.999 * e);
			outRoot.scale.setScalar(1 - e);
			if (p >= 1) {
				outRoot.visible = false;
				outRoot.scale.setScalar(1);
				this.transition = null;
			}
		}

		const u = this.reduceMotion ? STILL_U : ((now - this.t0) / this.L) % 1;

		if (
			!this.reduceMotion &&
			this.lastU != null &&
			u < this.lastU &&
			this.opts.autoCycle &&
			this.loading == null
		) {
			this.lastU = null;
			const next = (this.active + 1) % LOGGER_MODELS.length;
			this.select(next);
			this.opts.onCycle?.(next);
			return;
		}
		this.lastU = u;

		if (Math.abs(u - this.emittedU) > 0.004 || u < this.emittedU) {
			this.emittedU = u;
			this.opts.onProgress?.(u);
		}

		const Eg = globalE(u);
		const n = this.nPart;
		const map = this.expMap;

		let yMin = 0;
		let yMax = 0;
		for (const tg of this.targets) {
			const off = map[tg.id] || [0, 0, 0];
			const e = partE(tg.seqI, n, u);
			const bob = Math.sin(now * 0.0007 + tg.seqI * 1.9) * 0.0013 * smooth((e - 0.7) / 0.3);
			const py = off[1] * e + bob;
			if (py < yMin) yMin = py;
			if (py > yMax) yMax = py;
			tg.group.position.set(off[0] * e, py, off[2] * e);
			if (tg.spin) {
				tg.group.rotation.set(0, 0, 0);
				const rot = tg.spin * e;
				for (const ch of tg.group.children) {
					if (tg.axis === 'x') ch.rotation.x = rot;
					else ch.rotation.y = rot;
				}
			}
		}
		this.span = yMax - yMin;

		const F = flashAt(u);
		this.assembly.setPower(power(u) * (1 + 1.1 * F));

		if (!this.dragging && now - this.lastUser > 1600) {
			const f = Math.exp(-dt * 1.4);
			this.uTh *= f;
			this.uPh *= f;
			this.zoomK = 1 + (this.zoomK - 1) * f;
		}

		const camera = this.camera;
		const H = clamp(this.span / (this.spanMax || 1), 0, 1);
		let ph: number, th: number, dk: number, ty: number, fov: number, roll: number;
		if (this.cine) {
			const P = camPath(u);
			ph = P.ph; th = P.th; dk = P.d; ty = P.ty; fov = P.fov; roll = P.roll;
			th += (Math.sin(now * 0.00041) + 0.55 * Math.sin(now * 0.00097 + 1.3)) * 0.006;
			ph += (Math.cos(now * 0.00034 + 0.7) + 0.5 * Math.sin(now * 0.00083 + 2.1)) * 0.0045;
			dk *= 1 + 0.01 * Math.sin(now * 0.00029 + 0.4);
			// PATH[6] is the mid-loop "fully exploded" hero angle — steep enough
			// (ph 0.22) that the logger's top face (screen, labels) presents to
			// camera, rather than the level side/front-panel view PATH[0] gives.
			// Starting exactly at ASSEMBLY_END (parts are fully back together and
			// powered on by then, see globalE/power above), swing into that pose
			// — at the front-continuing azimuth, not PATH[6]'s own mid-loop
			// azimuth, so the camera doesn't spin backwards to get there — then
			// hold it for ~4s before the loop hands off to the next model.
			const settleFrom = ASSEMBLY_END;
			const settleSpan = 0.13;
			if (u > settleFrom) {
				const w = ease(clamp((u - settleFrom) / settleSpan, 0, 1));
				const target = PATH[6];
				const targetTh = PATH[0].th + Math.round((th - PATH[0].th) / WIND) * WIND;
				th += (targetTh - th) * w;
				ph += (target.ph - ph) * w;
				dk += (target.d - dk) * w;
				ty += (target.ty - ty) * w;
				fov += (target.fov - fov) * w;
				roll += (target.roll - roll) * w;
			}
		} else {
			const cb = this.camBase;
			ph = cb.ph0 + cb.dph * Eg;
			th = -0.62 + u * TAU;
			dk = cb.dk;
			ty = cb.ty0 + 0.017 * Eg;
			fov = cb.fov;
			roll = 0;
		}

		let entry = 0;
		if (this.entryT) {
			const e = clamp(1 - (now - this.entryT) / 1050, 0, 1);
			if (e <= 0) this.entryT = 0;
			entry = e * e * e;
		}
		th += this.uTh;
		ph = clamp(ph + this.uPh, 0.08, 1.5);
		let d = (this.dBase + (this.dSpanK + this.dExtra) * H) * dk * this.fitScale * this.zoomK;

		if (this.enterFrom && entry > 0) {
			const ef = this.enterFrom;
			const thFrom = th + Math.round((ef.th - th) / WIND) * WIND;
			th += (thFrom - th) * entry;
			ph += (ef.ph - ph) * entry;
			d += (ef.d - d) * entry;
			ty += (ef.ty - ty) * entry;
			fov += (ef.fov - fov) * entry;
			roll += (ef.roll - roll) * entry;
		}
		if (Math.abs(fov - this.fov) > 0.01) {
			this.fov = fov;
			camera.fov = fov;
			camera.updateProjectionMatrix();
		}

		const sp = Math.sin(ph);
		camera.position.set(d * sp * Math.sin(th), ty + d * Math.cos(ph), d * sp * Math.cos(th));
		this.look.set(0, ty, 0);
		camera.lookAt(this.look);
		if (this.hBias || this.vBias) {
			camera.updateMatrixWorld();
			this.right.setFromMatrixColumn(camera.matrix, 0);
			this.up.setFromMatrixColumn(camera.matrix, 1);
			const hx = d * this.hBias;
			const hy = d * this.vBias * (1 - 0.85 * H);
			camera.position.addScaledVector(this.right, -hx).addScaledVector(this.up, -hy);
			this.look.addScaledVector(this.right, -hx).addScaledVector(this.up, -hy);
			camera.lookAt(this.look);
		}
		if (roll) camera.rotateZ(roll);
		camera.updateMatrixWorld(true);
		this.lastPose = { th, ph, d, ty, fov, roll };
	}
}
