/**
 * seed.ts — Yogyakarta (DIY) EWS deterministic seed data.
 * All values derived from a seeded PRNG (mulberry32). No Math.random().
 * buildData(clock) is pure: same clock → same output, always.
 */
import type {
	DemoData,
	Pos,
	LandslideSensor,
	SirenNode,
	Channel,
	Shelter,
	AffectedArea,
	OpAsset,
	Earthquake,
	AlertItem,
	HistPoint,
	Siaga
} from '../types';
import { deriveTmaStatus, deriveLandslideStatus } from '../derive';

// ---------------------------------------------------------------------------
// PRNG — mulberry32 (deterministic, seeded)
// ---------------------------------------------------------------------------
function mulberry32(seed: number): () => number {
	let s = seed >>> 0;
	return function () {
		s += 0x6d2b79f5;
		let z = s;
		z = Math.imul(z ^ (z >>> 15), z | 1);
		z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
		return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
	};
}

/** Hash a string to a uint32 for use as a PRNG salt. */
function hashStr(str: string): number {
	let h = 0x811c9dc5;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
}

/** Make a seeded rng for a specific entity from clock + id. */
function rng(clock: number, id: string): () => number {
	// Combine clock (top 32 bits of ms) and id hash to form seed
	const seed = ((clock / 1000) & 0xffffffff) ^ hashStr(id);
	return mulberry32(seed >>> 0);
}

/** Uniform float in [min, max] using the given prng. */
function rand(r: () => number, min: number, max: number): number {
	return min + r() * (max - min);
}

/** Round to d decimal places */
function round(v: number, d = 2): number {
	const f = 10 ** d;
	return Math.round(v * f) / f;
}

// ---------------------------------------------------------------------------
// History generation — 48 hourly HistPoints ending at `clock`
// ---------------------------------------------------------------------------
const HIST_LEN = 48;
const HIST_STEP = 3_600_000; // 1 hour in ms

function genHistory(
	clock: number,
	r: () => number,
	endValue: number,
	amplitude: number,
	min = 0
): HistPoint[] {
	const pts: HistPoint[] = [];
	const startValue = Math.max(min, endValue - amplitude * 0.6);
	for (let i = 0; i < HIST_LEN; i++) {
		const k = i / (HIST_LEN - 1);
		const trend = startValue + (endValue - startValue) * k;
		const wob = Math.sin(k * Math.PI * 4) * amplitude * 0.18;
		const noise = (r() - 0.5) * 2 * amplitude * 0.12;
		let v = trend + wob + noise;
		if (i === HIST_LEN - 1) v = endValue; // anchor endpoint
		pts.push({ t: clock - (HIST_LEN - 1 - i) * HIST_STEP, v: Math.max(min, round(v)) });
	}
	return pts;
}

// ---------------------------------------------------------------------------
// DIY bbox: lat −8.2..−7.5, lng 110.0..110.9
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Static station definitions — Yogyakarta geography
// ---------------------------------------------------------------------------

interface PosDef {
	id: string;
	nama: string;
	kind: 'tma' | 'arr';
	sungai: string;
	lat: number;
	lng: number;
	unit: string;
	/** Base (nominal) value for demo epoch */
	baseValue: number;
	/** Amplitude of drift in history */
	amplitude: number;
	thresholds: { waspada: number; siaga: number; awas: number };
}

const POS_DEFS: PosDef[] = [
	// Kali Code (TMA)
	{
		id: 'pos-code-ngaglik',
		nama: 'Pos Duga Air Ngaglik – Kali Code',
		kind: 'tma',
		sungai: 'Kali Code',
		lat: -7.693,
		lng: 110.378,
		unit: 'm',
		baseValue: 1.85,
		amplitude: 0.9,
		thresholds: { waspada: 2.0, siaga: 2.5, awas: 3.0 }
	},
	{
		id: 'pos-code-gondolayu',
		nama: 'Pos Duga Air Gondolayu – Kali Code',
		kind: 'tma',
		sungai: 'Kali Code',
		lat: -7.784,
		lng: 110.371,
		unit: 'm',
		baseValue: 2.3,
		amplitude: 1.1,
		thresholds: { waspada: 2.2, siaga: 2.8, awas: 3.4 }
	},
	// Kali Gajah Wong (TMA)
	{
		id: 'pos-gajahwong-maguwo',
		nama: 'Pos Duga Air Maguwo – Gajah Wong',
		kind: 'tma',
		sungai: 'Kali Gajah Wong',
		lat: -7.782,
		lng: 110.425,
		unit: 'm',
		baseValue: 1.55,
		amplitude: 0.8,
		thresholds: { waspada: 2.0, siaga: 2.6, awas: 3.2 }
	},
	// Kali Winongo (TMA)
	{
		id: 'pos-winongo-bantul',
		nama: 'Pos Duga Air Bantul – Kali Winongo',
		kind: 'tma',
		sungai: 'Kali Winongo',
		lat: -7.888,
		lng: 110.329,
		unit: 'm',
		baseValue: 1.6,
		amplitude: 0.7,
		thresholds: { waspada: 1.8, siaga: 2.3, awas: 2.9 }
	},
	// Kali Opak (TMA)
	{
		id: 'pos-opak-prambanan',
		nama: 'Pos Duga Air Prambanan – Kali Opak',
		kind: 'tma',
		sungai: 'Kali Opak',
		lat: -7.752,
		lng: 110.491,
		unit: 'm',
		baseValue: 2.55,
		amplitude: 1.2,
		thresholds: { waspada: 2.5, siaga: 3.2, awas: 4.0 }
	},
	// Kali Boyong (Merapi lahar, TMA)
	{
		id: 'pos-boyong-kaliurang',
		nama: 'Pos Duga Air Kaliurang – Kali Boyong',
		kind: 'tma',
		sungai: 'Kali Boyong',
		lat: -7.597,
		lng: 110.422,
		unit: 'm',
		baseValue: 0.85,
		amplitude: 0.5,
		thresholds: { waspada: 1.0, siaga: 1.5, awas: 2.0 }
	},
	// Kali Gendol (Merapi lahar, TMA)
	{
		id: 'pos-gendol',
		nama: 'Pos Lahar Kali Gendol — Kepuharjo',
		kind: 'tma',
		sungai: 'Kali Gendol',
		lat: -7.638,
		lng: 110.447,
		unit: 'm',
		baseValue: 0.75,
		amplitude: 0.55,
		thresholds: { waspada: 1.0, siaga: 1.5, awas: 2.0 }
	},
	// Kali Kuning (Merapi lahar, TMA)
	{
		id: 'pos-kuning',
		nama: 'Pos Lahar Kali Kuning — Cangkringan',
		kind: 'tma',
		sungai: 'Kali Kuning',
		lat: -7.618,
		lng: 110.455,
		unit: 'm',
		baseValue: 0.70,
		amplitude: 0.45,
		thresholds: { waspada: 1.0, siaga: 1.5, awas: 2.0 }
	},
	// ARR – Sleman (hujan)
	{
		id: 'arr-sleman-mlati',
		nama: 'Pos Hujan Mlati – Sleman',
		kind: 'arr',
		sungai: 'Kali Code',
		lat: -7.724,
		lng: 110.343,
		unit: 'mm',
		baseValue: 18,
		amplitude: 20,
		thresholds: { waspada: 20, siaga: 50, awas: 100 }
	},
	// ARR – Opak hulu (hujan)
	{
		id: 'arr-opak-piyungan',
		nama: 'Pos Hujan Piyungan – Opak Hulu',
		kind: 'arr',
		sungai: 'Kali Opak',
		lat: -7.843,
		lng: 110.448,
		unit: 'mm',
		baseValue: 35,
		amplitude: 30,
		thresholds: { waspada: 20, siaga: 50, awas: 100 }
	}
];

interface LandslideDef {
	id: string;
	nama: string;
	lokasi: string;
	lat: number;
	lng: number;
	movementThreshold: number;
	rainThreshold: number;
	baseMovement: number;
	baseRain: number;
}

const LONGSOR_DEFS: LandslideDef[] = [
	{
		id: 'ls-menoreh-kokap',
		nama: 'Sensor Longsor Kokap – Menoreh',
		lokasi: 'Kulon Progo – Menoreh',
		lat: -7.822,
		lng: 110.125,
		movementThreshold: 30,
		rainThreshold: 80,
		baseMovement: 8,
		baseRain: 42
	},
	{
		id: 'ls-menoreh-samigaluh',
		nama: 'Sensor Longsor Samigaluh – Menoreh',
		lokasi: 'Kulon Progo – Menoreh',
		lat: -7.696,
		lng: 110.093,
		movementThreshold: 25,
		rainThreshold: 75,
		baseMovement: 19,
		baseRain: 60
	},
	{
		id: 'ls-gk-playen',
		nama: 'Sensor Longsor Playen – Gunungkidul',
		lokasi: 'Gunungkidul – Playen',
		lat: -7.966,
		lng: 110.535,
		movementThreshold: 35,
		rainThreshold: 90,
		baseMovement: 5,
		baseRain: 25
	},
	{
		id: 'ls-gk-gedangsari',
		nama: 'Sensor Longsor Gedangsari – Gunungkidul',
		lokasi: 'Gunungkidul – Gedangsari',
		lat: -7.823,
		lng: 110.568,
		movementThreshold: 28,
		rainThreshold: 70,
		baseMovement: 22,
		baseRain: 56
	}
];

interface SirenDef {
	id: string;
	nama: string;
	sungai: string;
	lat: number;
	lng: number;
}

const SIREN_DEFS: SirenDef[] = [
	{ id: 'sir-code-terban', nama: 'Sirine EWS Terban – Kali Code', sungai: 'Kali Code', lat: -7.783, lng: 110.374 },
	{ id: 'sir-code-kota', nama: 'Sirine EWS Kota – Kali Code', sungai: 'Kali Code', lat: -7.800, lng: 110.368 },
	{ id: 'sir-code-gondomanan', nama: 'Sirine EWS Gondomanan – Kali Code', sungai: 'Kali Code', lat: -7.814, lng: 110.367 },
	{ id: 'sir-gajahwong-kotagede', nama: 'Sirine EWS Kotagede – Gajah Wong', sungai: 'Kali Gajah Wong', lat: -7.823, lng: 110.418 },
	{ id: 'sir-boyong-turgo', nama: 'Sirine EWS Turgo – Kali Boyong', sungai: 'Kali Boyong', lat: -7.610, lng: 110.415 }
];

const CHANNELS: Channel[] = [
	{ kind: 'sirine', label: 'Sirine EWS', online: true, reach: 12500 },
	{ kind: 'wa', label: 'WhatsApp', online: true, reach: 48200 },
	{ kind: 'sms', label: 'SMS Broadcast', online: true, reach: 62000 },
	{ kind: 'push', label: 'Push Notifikasi', online: true, reach: 31500 },
	{ kind: 'telegram', label: 'Telegram', online: false, reach: 9800 }
];

interface ShelterDef {
	id: string;
	nama: string;
	lokasi: string;
	lat: number;
	lng: number;
	kapasitas: number;
}

const SHELTER_DEFS: ShelterDef[] = [
	{ id: 'shl-sleman-depok', nama: 'GOR Pancasila Depok', lokasi: 'Depok, Sleman', lat: -7.762, lng: 110.391, kapasitas: 800 },
	{ id: 'shl-sleman-kalasan', nama: 'SMPN 1 Kalasan', lokasi: 'Kalasan, Sleman', lat: -7.767, lng: 110.476, kapasitas: 450 },
	{ id: 'shl-bantul-sewon', nama: 'Balai Desa Sewon', lokasi: 'Sewon, Bantul', lat: -7.867, lng: 110.334, kapasitas: 350 },
	{ id: 'shl-bantul-banguntapan', nama: 'GOR Banguntapan', lokasi: 'Banguntapan, Bantul', lat: -7.839, lng: 110.407, kapasitas: 600 }
];

interface AreaDef {
	id: string;
	nama: string;
	terdampakKK: number;
	jiwa: number;
	status: Siaga;
}

const AREA_DEFS: AreaDef[] = [
	{ id: 'area-code-kotabaru', nama: 'Kotabaru – Tepi Kali Code', terdampakKK: 120, jiwa: 480, status: 'waspada' },
	{ id: 'area-gajahwong-muja', nama: 'Muja-muju – Tepi Gajah Wong', terdampakKK: 85, jiwa: 340, status: 'normal' },
	{ id: 'area-opak-prambanan', nama: 'Prambanan – Tepi Kali Opak', terdampakKK: 200, jiwa: 780, status: 'waspada' },
	{ id: 'area-boyong-turgo', nama: 'Turgo – Lereng Merapi', terdampakKK: 65, jiwa: 250, status: 'normal' }
];

interface OpDef {
	id: string;
	nama: string;
	jenis: 'pompa' | 'tanggul';
	lat: number;
	lng: number;
	kondisi: number;
	operasional: boolean;
}

const OP_DEFS: OpDef[] = [
	{ id: 'op-pompa-somohitam', nama: 'Pompa Banjir Somohitam', jenis: 'pompa', lat: -7.808, lng: 110.362, kondisi: 88, operasional: true },
	{ id: 'op-tanggul-code-utara', nama: 'Tanggul Kali Code Utara', jenis: 'tanggul', lat: -7.736, lng: 110.379, kondisi: 74, operasional: true },
	{ id: 'op-tanggul-opak-selatan', nama: 'Tanggul Kali Opak Selatan', jenis: 'tanggul', lat: -7.940, lng: 110.470, kondisi: 55, operasional: false },
	{ id: 'op-pompa-gajahwong', nama: 'Pompa Banjir Gajah Wong', jenis: 'pompa', lat: -7.870, lng: 110.400, kondisi: 91, operasional: true }
];

interface QuakeDef {
	id: string;
	lokasi: string;
	lat: number;
	lng: number;
	mag: number;
	depthKm: number;
	/** offset ms before clock */
	ageMs: number;
}

const QUAKE_DEFS: QuakeDef[] = [
	{ id: 'eq-opak-1', lokasi: 'Sesar Opak – Prambanan', lat: -7.762, lng: 110.493, mag: 2.8, depthKm: 12, ageMs: 3_600_000 },
	{ id: 'eq-opak-2', lokasi: 'Sesar Opak – Imogiri', lat: -7.928, lng: 110.398, mag: 3.4, depthKm: 8, ageMs: 14_400_000 },
	{ id: 'eq-opak-3', lokasi: 'Sesar Opak – Bantul', lat: -7.892, lng: 110.325, mag: 2.1, depthKm: 15, ageMs: 28_800_000 },
	{ id: 'eq-merapi-4', lokasi: 'Flank Merapi – Barat', lat: -7.566, lng: 110.413, mag: 1.6, depthKm: 5, ageMs: 43_200_000 },
	{ id: 'eq-opak-5', lokasi: 'Sesar Opak – Wonosari', lat: -7.998, lng: 110.578, mag: 4.1, depthKm: 18, ageMs: 72_000_000 }
];

// ---------------------------------------------------------------------------
// buildData — main export
// ---------------------------------------------------------------------------

export function buildData(clock: number): DemoData {
	const alerts: AlertItem[] = [];

	// --- Pos ---
	const pos: Pos[] = POS_DEFS.map((def) => {
		const r = rng(clock, def.id);
		// Tune amplitude so some stations are elevated at demo epoch
		// Use a small perturbation around base value
		const noise = (r() - 0.5) * 2 * def.amplitude * 0.35;
		const value = round(Math.max(0, def.baseValue + noise), 2);
		const history = genHistory(clock, rng(clock, def.id + '-hist'), value, def.amplitude, 0);
		const status = deriveTmaStatus(value, def.thresholds);
		return {
			id: def.id,
			nama: def.nama,
			kind: def.kind,
			sungai: def.sungai,
			lat: def.lat,
			lng: def.lng,
			unit: def.unit,
			value,
			thresholds: def.thresholds,
			status,
			history
		};
	});

	// --- LandslideSensor ---
	const longsor: LandslideSensor[] = LONGSOR_DEFS.map((def) => {
		const r = rng(clock, def.id);
		const movNoise = (r() - 0.5) * 2 * def.movementThreshold * 0.4;
		const rainNoise = (r() - 0.5) * 2 * def.rainThreshold * 0.4;
		const movementMm = round(Math.max(0, def.baseMovement + movNoise), 1);
		const rainAccumMm = round(Math.max(0, def.baseRain + rainNoise), 1);
		const status = deriveLandslideStatus(movementMm, def.movementThreshold, rainAccumMm, def.rainThreshold);
		const history = genHistory(clock, rng(clock, def.id + '-hist'), rainAccumMm, def.rainThreshold * 0.5, 0);
		return {
			id: def.id,
			nama: def.nama,
			lokasi: def.lokasi,
			lat: def.lat,
			lng: def.lng,
			movementMm,
			movementThreshold: def.movementThreshold,
			rainAccumMm,
			rainThreshold: def.rainThreshold,
			status,
			history
		};
	});

	// --- SirenNode ---
	const sirens: SirenNode[] = SIREN_DEFS.map((def) => {
		const r = rng(clock, def.id);
		// armed ~70% of the time; lastTest within last 7 days
		const armed = r() > 0.3;
		const lastTestOffset = Math.floor(r() * 7 * 24 * 3_600_000);
		const status: Siaga = r() > 0.85 ? 'waspada' : 'normal';
		return {
			id: def.id,
			nama: def.nama,
			sungai: def.sungai,
			lat: def.lat,
			lng: def.lng,
			armed,
			lastTest: clock - lastTestOffset,
			status
		};
	});

	// --- Shelters ---
	const shelters: Shelter[] = SHELTER_DEFS.map((def) => {
		const r = rng(clock, def.id);
		const terisi = Math.floor(r() * def.kapasitas * 0.6);
		return {
			id: def.id,
			nama: def.nama,
			lokasi: def.lokasi,
			lat: def.lat,
			lng: def.lng,
			kapasitas: def.kapasitas,
			terisi
		};
	});

	// --- AffectedArea ---
	const areas: AffectedArea[] = AREA_DEFS.map((def) => ({ ...def }));

	// --- OpAsset ---
	const op: OpAsset[] = OP_DEFS.map((def) => ({ ...def }));

	// --- Earthquakes ---
	const quakes: Earthquake[] = QUAKE_DEFS.map((def) => ({
		id: def.id,
		t: clock - def.ageMs,
		mag: def.mag,
		depthKm: def.depthKm,
		lokasi: def.lokasi,
		lat: def.lat,
		lng: def.lng
	}));

	// --- Alerts: one per non-normal asset ---
	// alertPrng draws are positional — do not reorder loops or insert draws between them; determinism depends on call order.
	const alertPrng = mulberry32(((clock / 1000) & 0xffffffff) ^ hashStr('alerts'));
	let alertIdx = 0;

	for (const p of pos) {
		if (p.status !== 'normal') {
			const tOffset = Math.floor(alertPrng() * 30 * 60 * 1000);
			alerts.push({
				id: `al-pos-${p.id}-${alertIdx++}`,
				t: clock - tOffset,
				kind: p.kind === 'arr' ? 'arr' : 'tma',
				refId: p.id,
				nama: p.nama,
				from: 'normal',
				to: p.status,
				pesan: pesanPos(p.nama, p.status, p.kind)
			});
		}
	}

	for (const l of longsor) {
		if (l.status !== 'normal') {
			const tOffset = Math.floor(alertPrng() * 30 * 60 * 1000);
			alerts.push({
				id: `al-longsor-${l.id}-${alertIdx++}`,
				t: clock - tOffset,
				kind: 'longsor',
				refId: l.id,
				nama: l.nama,
				from: 'normal',
				to: l.status,
				pesan: pesanLongsor(l.nama, l.status)
			});
		}
	}

	for (const s of sirens) {
		if (s.status !== 'normal') {
			const tOffset = Math.floor(alertPrng() * 30 * 60 * 1000);
			alerts.push({
				id: `al-sirine-${s.id}-${alertIdx++}`,
				t: clock - tOffset,
				kind: 'sirine',
				refId: s.id,
				nama: s.nama,
				from: 'normal',
				to: s.status,
				pesan: `Sirine ${s.nama} menunjukkan status ${s.status} — perlu verifikasi lapangan`
			});
		}
	}

	return {
		pos,
		longsor,
		sirens,
		channels: CHANNELS,
		shelters,
		areas,
		op,
		quakes,
		alerts
	};
}

// ---------------------------------------------------------------------------
// Indonesian alert messages
// ---------------------------------------------------------------------------

function pesanPos(nama: string, status: Siaga, kind: 'tma' | 'arr'): string {
	if (kind === 'arr') {
		if (status === 'awas') return `${nama}: curah hujan melampaui ambang AWAS — risiko banjir tinggi`;
		if (status === 'siaga') return `${nama}: curah hujan melampaui ambang SIAGA`;
		return `${nama}: curah hujan mendekati ambang WASPADA`;
	}
	if (status === 'awas') return `${nama}: muka air melampaui ambang AWAS — evakuasi segera`;
	if (status === 'siaga') return `${nama}: muka air mencapai status SIAGA — pantau terus`;
	return `${nama}: muka air mendekati ambang WASPADA`;
}

function pesanLongsor(nama: string, status: Siaga): string {
	if (status === 'awas') return `${nama}: pergerakan tanah dan curah hujan melampaui ambang AWAS — evakuasi segera`;
	if (status === 'siaga') return `${nama}: indikator longsor mencapai status SIAGA`;
	return `${nama}: pergerakan tanah mendekati ambang WASPADA`;
}
